import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import logger from "@/lib/logger";
import { getUserIdFromJWT } from "@/lib/utils/getUserIdFromJwt";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Secure Role Key

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.replace("Bearer ", "").trim() || null;

    // ✅ Extract userId from JWT for authentication
    const userId = await getUserIdFromJWT(authHeader);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Authenticate Supabase with JWT (to fetch user's current referral agent)
    const headers = jwt ? { Authorization: `Bearer ${jwt}` } : {};
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, { global: { headers } });

    // ✅ Get the currently assigned referral agent (`referral_user_id`)
    const { data: userData, error: userError } = await supabaseAuth
      .from("profiles")
      .select("referral_user_id, email")
      .eq("user_id", userId)
      .maybeSingle();

    if (userError) {
      return NextResponse.json({ error: "Database error fetching user profile." }, { status: 500 });
    }

    const agentId = userData?.referral_user_id;
    const userEmail = userData?.email;

    if (!agentId) {
      return NextResponse.json({ error: "No agent assigned." }, { status: 400 });
    }

    // ✅ Authenticate Supabase with Role Key (to modify agent's referees JSONB)
    const supabaseRoleKey = createClient(supabaseUrl, supabaseServiceRoleKey, {
      global: { headers: { "Content-Type": "application/json" } },
    });

    // ✅ Fetch the agent’s referees JSONB
    const { data: agentData, error: agentError } = await supabaseRoleKey
      .from("profiles")
      .select("referees")
      .eq("user_id", agentId)
      .maybeSingle();

    if (agentError) {
      return NextResponse.json({ error: "Database error fetching agent's referees." }, { status: 500 });
    }

    let agentReferees = agentData?.referees || {};

    // ✅ Modify the agent's referees JSONB to set `rejected: true`
    for (const key in agentReferees) {
      if (agentReferees[key].email === userEmail) {
        agentReferees[key].rejected = true;
      }
    }

    // ✅ Update the agent's referees JSONB column
    const { error: refereesUpdateError } = await supabaseRoleKey
      .from("profiles")
      .update({ referees: agentReferees })
      .eq("user_id", agentId);

    if (refereesUpdateError) {
      logger.error("❌ Failed to update agent's referees JSONB:", refereesUpdateError);

      return NextResponse.json({ error: "Failed to update agent referees." }, { status: 500 });
    }

    // ✅ Remove the agent’s user ID from the user's `referral_user_id` column
    const { error: revokeError } = await supabaseRoleKey
      .from("profiles")
      .update({ referral_user_id: null })
      .eq("user_id", userId);

    if (revokeError) {
      return NextResponse.json({ error: "Failed to revoke agent." }, { status: 500 });
    }

    logger.info(`✅ Agent ${agentId} successfully revoked by user ${userId}.`);
    logger.info(`✅ Agent's referees updated: ${JSON.stringify(agentReferees)}`);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    logger.error("❌ Server Error:", error.message);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
