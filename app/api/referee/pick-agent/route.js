import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import logger from "@/lib/logger";
import { getUserIdFromJWT } from "@/lib/utils/getUserIdFromJwt";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Secure Role Key

export async function POST(req) {
  try {
    const { agentEmail } = await req.json();
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.replace("Bearer ", "").trim() || null;

    // ✅ Extract userId from JWT for authentication
    const userId = await getUserIdFromJWT(authHeader);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!agentEmail) {
      return NextResponse.json({ error: "Agent email is required." }, { status: 400 });
    }

    // ✅ Create a Role Key-authenticated Supabase client to fetch the agent's UUID
    const supabaseRoleKey = createClient(supabaseUrl, supabaseServiceRoleKey, {
      global: { headers: { "Content-Type": "application/json" } },
    });

    // ✅ Find the agent's user_id using their email
    const { data: agentData, error: agentError } = await supabaseRoleKey
      .from("profiles")
      .select("user_id")
      .eq("email", agentEmail)
      .maybeSingle();

    if (agentError || !agentData?.user_id) {
      return NextResponse.json({ error: "Agent not found." }, { status: 404 });
    }

    const agentId = agentData.user_id;

    // ✅ Authenticate Supabase with JWT (RLS-enabled)
    const headers = jwt ? { Authorization: `Bearer ${jwt}` } : {};
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, { global: { headers } });

    // ✅ Fetch existing agent requests and referral_user_id
    const { data: userData, error: userError } = await supabaseAuth
      .from("profiles")
      .select("agent_requests, referral_user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (userError) {
      return NextResponse.json({ error: "Database error fetching user profile." }, { status: 500 });
    }

    const currentAgent = userData?.referral_user_id;
    let updatedRequests = userData?.agent_requests || [];

    // ✅ Prevent selection if the user already has an assigned agent
    if (currentAgent) {
      return NextResponse.json(
        { error: "You must remove your current agent before selecting a new one." },
        { status: 400 }
      );
    }

    // ✅ Remove selected agentId from `agent_requests`
    updatedRequests = updatedRequests.filter(id => id !== agentId);

    // ✅ Update Supabase: Assign the new agent and update `agent_requests`
    const { error: updateError } = await supabaseAuth
      .from("profiles")
      .update({
        agent_requests: updatedRequests,
        referral_user_id: agentId,
      })
      .eq("user_id", userId);

    if (updateError) {
      return NextResponse.json({ error: "Failed to assign agent." }, { status: 500 });
    }

    logger.info(`✅ Agent ${agentEmail} (UUID: ${agentId}) successfully assigned to user ${userId}.`);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    logger.error("❌ Server Error:", error.message);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
