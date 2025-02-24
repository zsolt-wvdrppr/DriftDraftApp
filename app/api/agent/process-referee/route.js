import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js"; 

import logger from "@/lib/logger";

// ✅ Initialize Supabase client with the service role key for secure queries
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    // ✅ Extract agent's user ID and referee's email from the request body
    const { agentUserId, refereeEmail } = await req.json();

    // ✅ Validate required parameters
    if (!agentUserId || !refereeEmail) {
      logger.error("❌ Missing parameters: agentUserId or refereeEmail");

      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // ✅ Step 1: Fetch the referee's profile from Supabase using their email
    const { data: referee, error: refereeError } = await supabase
      .from("profiles")
      .select("user_id, agent_requests, referral_user_id")
      .eq("email", refereeEmail)
      .maybeSingle(); // Returns a single row if found

    // ✅ Handle database errors
    if (refereeError) {
      logger.error("❌ Database error fetching referee:", refereeError);

      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // ✅ If the referee doesn't exist, return `false`
    if (!referee) {
      logger.info(`❌ Referee not found for email: ${refereeEmail}`);

      return NextResponse.json({ success: false }, { status: 200 });
    }

    // ✅ Step 2: Check if the agent is already in the referee's `agent_requests` array
    if (referee.agent_requests?.includes(agentUserId)) {
      logger.info(`❌ Agent ${agentUserId} is still in pending agent_requests for ${refereeEmail}`);

      return NextResponse.json({ success: false, message: "Pending agent request" }, { status: 200 });
    }

    // ✅ Step 3: Check if the agent is already the assigned referral agent
    const isAcceptedAgent = referee.referral_user_id === agentUserId;

    // ✅ Step 4: Fetch the agent's `referees` JSONB from Supabase
    const { data: agentProfile, error: agentError } = await supabase
      .from("profiles")
      .select("referees")
      .eq("user_id", agentUserId)
      .maybeSingle(); // Returns a single row if found

    // ✅ Handle database errors for the agent's profile
    if (agentError) {
      logger.error("❌ Database error fetching agent:", agentError);

      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    // ✅ If the agent has no referees JSONB, return an error
    if (!agentProfile?.referees) {
      logger.error(`❌ No referees found for agent ${agentUserId}`);

      return NextResponse.json({ success: false }, { status: 404 });
    }

    // ✅ Step 5: Prepare to update the agent's `referees` JSONB
    let updatedReferees = { ...agentProfile.referees };

    // ✅ Step 6: Find the referee in the agent's `referees` JSONB by matching email
    for (const key in updatedReferees) {
      if (updatedReferees[key].email === refereeEmail) {
        if (isAcceptedAgent) {
          // ✅ If the agent is already the assigned referral agent, mark `accepted: true`
          updatedReferees[key].accepted = true;
          logger.info(`✅ Referee ${refereeEmail} accepted by agent ${agentUserId}`);

          // ✅ Update the agent's referees JSONB and return success
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ referees: updatedReferees })
            .eq("user_id", agentUserId);

          if (updateError) {
            logger.error("❌ Error updating agent's referees JSONB:", updateError);

            return NextResponse.json({ error: "Database update failed" }, { status: 500 });
          }

          return NextResponse.json({ success: true, refereeUserId: referee.user_id }, { status: 200 });
        } else {
          // ✅ If the agent is NOT the assigned referral agent, mark `rejected: true`
          updatedReferees[key].rejected = true;
          logger.info(`❌ Referee ${refereeEmail} rejected for agent ${agentUserId}`);

          return NextResponse.json({ success: false }, { status: 200 });
        }
      }
    }

    // ✅ Step 7: Update the agent's referees JSONB to reflect rejection
    const { error: finalUpdateError } = await supabase
      .from("profiles")
      .update({ referees: updatedReferees })
      .eq("user_id", agentUserId);

    if (finalUpdateError) {
      logger.error("❌ Error updating agent's referees JSONB:", finalUpdateError);

      return NextResponse.json({ error: "Database update failed" }, { status: 500 });
    }

    return NextResponse.json({ success: false }, { status: 400 });

  } catch (error) {
    logger.error("❌ Server Error:", error.message);

    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
