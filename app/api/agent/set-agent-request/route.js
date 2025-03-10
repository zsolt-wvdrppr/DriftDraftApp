import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import logger from "@/lib/logger"; 

// ✅ Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export async function POST(req) {
  try {
    const { inviteeEmail, agentUserId } = await req.json();

    if (!inviteeEmail || !agentUserId) {
      logger.error("❌ Missing parameters in agent request.");

      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // ✅ Fetch the invitee's profile
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("user_id, agent_requests")
      .eq("email", inviteeEmail)
      .maybeSingle();

    if (userError) {
      logger.error("❌ Supabase Error fetching invitee:", userError);

      return NextResponse.json({ error: "Database error fetching invitee." }, { status: 500 });
    }

    if (!user) {
      logger.error(`❌ Invitee not found: ${inviteeEmail}`);

      return NextResponse.json({ error: "Invitee not found" }, { status: 404 });
    }

    // ✅ Prevent self-invites
    if (user.user_id === agentUserId) {
      logger.error("❌ User attempted to invite themselves.");

      return NextResponse.json({ error: "You cannot invite yourself." }, { status: 400 });
    }

    // ✅ Ensure agent_requests is an array and check if the request already exists
    let updatedRequests = user.agent_requests || [];

    if (updatedRequests.includes(agentUserId)) {
      logger.error(`❌ Duplicate invite attempt to ${inviteeEmail}`);

      return NextResponse.json({ error: "Invitation has already been sent." }, { status: 400 });
    }

    // ✅ Add the new agent request
    updatedRequests.push(agentUserId);

    // ✅ Update the invitee's profile with the new agent request
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ agent_requests: updatedRequests })
      .eq("user_id", user.user_id);

    if (updateError) {
      logger.error("❌ Supabase Error updating invitee:", updateError);

      return NextResponse.json({ error: "Database error updating invitee." }, { status: 500 });
    }

    logger.info(`✅ Agent request successfully sent to ${inviteeEmail} by ${agentUserId}`);

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    logger.error("❌ Server Error:", error.message);

    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }

}
