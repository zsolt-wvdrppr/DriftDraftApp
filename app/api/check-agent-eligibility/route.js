import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    // ✅ Authenticate with Supabase using JWT (RLS-enabled)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} },
    });

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_id, top_up_credits, is_agent_eligible, stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check eligibility
    const isEligible = profile.stripe_customer_id && (profile.is_agent_eligible || profile.subscription_id || profile.top_up_credits >= 10);

    // If user is eligible then set the is_agent_eligible to true
    if (isEligible) {
      await supabase.from("profiles").update({ is_agent_eligible: true }).eq("user_id", userId);
    }

    return NextResponse.json({ isEligible });
  } catch (error) {
    console.error("Error checking agent eligibility:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
