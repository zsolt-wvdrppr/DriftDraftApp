import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import logger from "@/lib/logger";
import { getUserIdFromJWT } from "@/lib/utils/getUserIdFromJwt";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Role Key for secure DB queries

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.replace("Bearer ", "").trim() || null;

    // ✅ Extract userId from JWT for authentication
    const userId = await getUserIdFromJWT(authHeader);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Authenticate with Supabase using JWT (RLS-enabled)
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} },
    });

    // ✅ Fetch agent request IDs securely from Supabase
    const { data: userData, error: userError } = await supabaseAuth
      .from("profiles")
      .select("agent_requests")
      .eq("user_id", userId)
      .maybeSingle();

    if (userError) {
      logger.error("❌ Database error fetching agent requests:", userError);

      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    const agentRequestIds = userData?.agent_requests || [];

    // ✅ If no agent requests exist, return an empty list
    if (agentRequestIds.length === 0) {
      return NextResponse.json({ agentEmails: [] }, { status: 200 });
    }

    // ✅ Authenticate with Supabase using Service Role Key (Bypasses RLS)
    const supabaseRoleKey = createClient(supabaseUrl, supabaseServiceRoleKey, {
      global: { headers: { "Content-Type": "application/json" } },
    });

    // ✅ Fetch agent emails using the Role Key-authenticated Supabase
    const { data: agents, error: agentsError } = await supabaseRoleKey
      .from("profiles")
      .select("email")
      .in("user_id", agentRequestIds);

    if (agentsError) {
      logger.error("❌ Database error fetching agent emails:", agentsError);

      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // ✅ Extract only the email addresses (no user IDs)
    const agentEmails = agents.map((agent) => agent.email);

    logger.debug(`✅ Successfully fetched agent emails: ${JSON.stringify(agentEmails)}`);

    return NextResponse.json({ agentEmails }, { status: 200 });

  } catch (error) {
    logger.error("❌ Server Error:", error.message);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
