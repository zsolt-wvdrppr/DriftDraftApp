import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import logger from "@/lib/logger";
import { getUserIdFromJWT } from "@/lib/utils/getUserIdFromJwt";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req) {
  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.replace("Bearer ", "").trim() || null;

    // ✅ Extract userId from JWT for authentication
    const userId = await getUserIdFromJWT(authHeader);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.debug("Processing referral name update for user:", userId);
    logger.debug("JWT:", jwt);

    // ✅ Authenticate with Supabase using JWT (RLS-enabled)
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} },
    });

    const { newName } = await req.json();

    if (!newName || newName.length < 5) {
      return NextResponse.json(
        { error: "Invalid referral name." },
        { status: 400 }
      );
    }

    // Check if is_agent_eligible is true in profiles table
    const { data: profileData, error: profileError } = await supabaseAuth
      .from("profiles")
      .select("is_agent_eligible")
      .eq("user_id", userId)
      .single();

    if (profileError) {
      logger.error("❌ Error fetching profile data:", profileError);

      return NextResponse.json(
        { error: "Error fetching profile data." },
        { status: 500 }
      );
    }

    if (!profileData.is_agent_eligible) {
      return NextResponse.json(
        { error: "You are not eligible to become an agent." },
        { status: 403 }
      );
    }

    // ✅ Update referral name securely
    const { error: updateError } = await supabaseAuth
      .from("profiles")
      .update({ referral_name: newName })
      .eq("user_id", userId);

    if (updateError) {
      logger.error("❌ Error updating referral name:", updateError);

      return NextResponse.json(
        { error: "Failed to update referral name." },
        { status: 500 }
      );
    }

    logger.info(`✅ Referral name updated to: ${newName}`);

    return NextResponse.json({
      message: "Referral name updated successfully.",
    });
  } catch (error) {
    logger.error("❌ Unexpected error updating referral name:", error.message);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
