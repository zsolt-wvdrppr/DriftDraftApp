import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import logger from "@/lib/logger";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Using the secure role key
);

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("user_id") // Only fetching user_id for security
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({ exists: !!data }, { status: 200 });
  } catch (error) {
    logger.error("Error checking user existence:", error.message);
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
