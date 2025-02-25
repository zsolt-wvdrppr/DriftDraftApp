import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Role Key for lookup

export async function POST(req) {
  try {
    const { referral_name } = await req.json();

    if (!referral_name) {
      return NextResponse.json({ error: "No agent name provided" }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      global: { headers: { "Content-Type": "application/json" } },
    });

    // ✅ Check if referral name already exists
    const { data, error } = await supabase
      .from("profiles")
      .select("referral_name")
      .eq("referral_name", referral_name)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (data) {
      return NextResponse.json({ available: false, message: "Name is already taken" }, { status: 200 });
    }

    return NextResponse.json({ available: true }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
