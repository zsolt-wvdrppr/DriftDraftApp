import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { getUserIdFromJWT } from "@/lib/utils/getUserIdFromJwt";
import logger from "@/lib/logger";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // ✅ Role Key for secure lookup

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.replace("Bearer ", "").trim() || null;
    const { referral_name } = await req.json(); // ✅ Referral name is explicitly passed

    logger.debug(`🔍 Referral name: ${referral_name}`);

    // ✅ Authenticate the user making the request
    const userId = await getUserIdFromJWT(authHeader);

    if (!userId) {
      logger.error("❌ Unauthorized request: No valid token.");

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!referral_name) {
      logger.info("ℹ️ No referral name provided in request. Skipping referral assignment.");

      return NextResponse.json({ message: "No referral name found. No action taken." }, { status: 200 });
    }

    // ✅ Authenticate with JWT to fetch the logged-in user's profile
    const headers = jwt ? { Authorization: `Bearer ${jwt}` } : {};
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, { global: { headers } });

    const { data: userData, error: userError } = await supabaseAuth
      .from("profiles")
      .select("referral_user_id, email")
      .eq("user_id", userId)
      .maybeSingle();

    if (userError) {
      logger.error("❌ Error fetching user profile:", userError);

      return NextResponse.json({ error: "Failed to fetch user data." }, { status: 500 });
    }

    const currentReferralId = userData?.referral_user_id;
    const userEmail = userData?.email;    


    if (currentReferralId) {
      logger.info(`ℹ️ User ${userId} already has referral_user_id set (${currentReferralId}). Skipping update.`);

      return NextResponse.json({ message: "Referral already assigned. No action taken." }, { status: 200 });
    }

    // ✅ Authenticate with Role Key to find the referral agent’s `user_id`
    const supabaseRoleKey = createClient(supabaseUrl, supabaseServiceRoleKey, {
      global: { headers: { "Content-Type": "application/json" } },
    });

    const { data: referrerData, error: referrerError } = await supabaseRoleKey
      .from("profiles")
      .select("user_id, referees")
      .eq("referral_name", referral_name)
      .maybeSingle();

    if (referrerError || !referrerData?.user_id) {
      logger.info(`ℹ️ Referrer '${referral_name}' not found for user ${userId}. Skipping assignment.`);

      return NextResponse.json({ message: "Referrer not found. No action taken." }, { status: 200 });
    }

    const referralUserId = referrerData.user_id;
    let agentReferees = referrerData?.referees || {};

    // Check if referral user id and user id is the same
    if (referralUserId === userId) {
      logger.error("❌ Referral user id and user id cannot be the same.");

      return NextResponse.json({ error: "Referral user id and user id cannot be the same." }, { status: 400 });
    }

    // ✅ Check if the user is already listed in the `referees` JSONB
    let userKey = null;

    for (const key in agentReferees) {
      if (agentReferees[key].email === userEmail) {
        userKey = key;
        break;
      }
    }

    if (userKey) {
      // ✅ If already listed, set `accepted: true`
      agentReferees[userKey].accepted = true;
      logger.info(`✅ Referee ${userEmail} found in agent's referees list. Marking as accepted.`);
    } else {
      // ✅ Generate a new referee key dynamically
      const existingKeys = Object.keys(agentReferees)
        .map((key) => parseInt(key.replace("user", ""), 10))
        .filter((num) => !isNaN(num));

      const nextKey = existingKeys.length > 0 ? Math.max(...existingKeys) + 1 : 1;
      const newUserKey = `user${nextKey}`;

      // ✅ Add the new referee entry
      agentReferees[newUserKey] = {
        email: userEmail,
        accepted: true,
        rejected: false,
        timestamp: new Date().toISOString(), // ✅ Store current timestamp
        auto_accept: true,
      };

      logger.info(`✅ Added new referee entry: ${newUserKey} for agent ${referralUserId}`);
    }

    // ✅ Update the agent’s `referees` JSONB
    const { error: refereesUpdateError } = await supabaseRoleKey
      .from("profiles")
      .update({ referees: agentReferees })
      .eq("user_id", referralUserId);

    if (refereesUpdateError) {
      logger.error("❌ Failed to update agent's referees JSONB:", refereesUpdateError);

      return NextResponse.json({ error: "Failed to update agent referees." }, { status: 500 });
    }

    // ✅ Update the logged-in user’s `referral_user_id`
    const { error: updateError } = await supabaseAuth
      .from("profiles")
      .update({ referral_user_id: referralUserId })
      .eq("user_id", userId);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update referral_user_id." }, { status: 500 });
    }

    logger.info(`✅ Referral user ${referralUserId} successfully assigned to ${userId}`);

    return NextResponse.json({ success: true, referral_user_id: referralUserId }, { status: 200 });

  } catch (error) {
    logger.error("❌ Server Error:", error.message);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
