import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import logger from "@/lib/logger";
import { getUserIdFromJWT } from "@/lib/utils/getUserIdFromJwt";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Role Key for secure updates

export async function DELETE(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.replace("Bearer ", "").trim() || null;

    // ✅ Extract userId from JWT for authentication
    const userId = await getUserIdFromJWT(authHeader);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Authenticate Supabase with JWT (to fetch user's linked data)
    const headers = jwt ? { Authorization: `Bearer ${jwt}` } : {};
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, { global: { headers } });

    // ✅ Fetch user's `referral_user_id` and `agent_requests`
    const { data: userData, error: userError } = await supabaseAuth
      .from("profiles")
      .select("referral_user_id, agent_requests, email")
      .eq("user_id", userId)
      .maybeSingle();

    if (userError) {
      return NextResponse.json({ error: "Database error fetching user profile." }, { status: 500 });
    }

    const agentId = userData?.referral_user_id;
    const agentRequests = userData?.agent_requests || [];
    const userEmail = userData?.email;

    // ✅ Authenticate Supabase with Role Key for modifying affected agents
    const supabaseRoleKey = createClient(supabaseUrl, supabaseServiceRoleKey, {
      global: { headers: { "Content-Type": "application/json" } },
    });

    // ✅ Update the `referees` JSONB for the assigned agent (if any)
    if (agentId) {
      const { data: agentData, error: agentError } = await supabaseRoleKey
        .from("profiles")
        .select("referees")
        .eq("user_id", agentId)
        .maybeSingle();

      if (agentError) {
        return NextResponse.json({ error: "Failed to fetch agent referees." }, { status: 500 });
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
    }

    // ✅ Update referees JSONB for all agents in `agent_requests`
    for (const requestAgentId of agentRequests) {
      const { data: requestAgentData, error: requestAgentError } = await supabaseRoleKey
        .from("profiles")
        .select("referees")
        .eq("user_id", requestAgentId)
        .maybeSingle();

      if (requestAgentError) {
        logger.error(`❌ Failed to fetch referees for agent ${requestAgentId}:`, requestAgentError);
        continue;
      }

      let updatedReferees = requestAgentData?.referees || {};

      for (const key in updatedReferees) {
        if (updatedReferees[key].email === userEmail) {
          updatedReferees[key].rejected = true;
        }
      }

      const { error: updateError } = await supabaseRoleKey
        .from("profiles")
        .update({ referees: updatedReferees })
        .eq("user_id", requestAgentId);

      if (updateError) {
        logger.error(`❌ Failed to update referees for agent ${requestAgentId}:`, updateError);
      }
    }

    // ✅ Delete the user from `profiles`
    const { error: deleteProfileError } = await supabaseRoleKey
      .from("profiles")
      .delete()
      .eq("user_id", userId);

    if (deleteProfileError) {
      logger.error("❌ Failed to delete user profile:", deleteProfileError);

      return NextResponse.json({ error: "Failed to delete user profile." }, { status: 500 });
    }

    // ✅ Delete the user from Supabase auth.users table
    const { error: deleteUserError } = await supabaseRoleKey.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      logger.error("❌ Failed to delete user from auth:", deleteUserError);

      return NextResponse.json({ error: "Failed to delete user account." }, { status: 500 });
    }

    logger.info(`✅ User ${userId} successfully deleted from both profile and auth.`);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    logger.error("❌ Server Error:", error.message);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}