import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import logger from "@/lib/logger";

// Create a Supabase client using your environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      logger.error("❌ Missing userId parameter.");

      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // ✅ Fetch referral_user_id from profiles
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("referral_user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (userError) {
      logger.error("❌ Database error fetching referral_user_id:", userError);

      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!user?.referral_user_id) {
      return NextResponse.json({ referralEmail: null }, { status: 200 });
    }

    // ✅ Fetch agent's email using referral_user_id
    const { data: agent, error: agentError } = await supabase
      .from("profiles")
      .select("email")
      .eq("user_id", user.referral_user_id)
      .maybeSingle();

    if (agentError) {
      logger.error("❌ Database error fetching agent email:", agentError);

      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json({ referralEmail: agent?.email || null }, { status: 200 });

  } catch (error) {
    logger.error("❌ Server Error:", error.message);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
