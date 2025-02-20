import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Fetch referees JSON from profiles table
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("referees")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    if (!profile || !profile.referees) {
      return NextResponse.json({ refereesList: [] }, { status: 200 });
    }

    const referees = profile.referees;
    const emails = Object.values(referees).map((ref) => ref.email);

    // Fetch user IDs for referees based on their email
    const { data: usersData, error: usersError } = await supabase
      .from("profiles")
      .select("user_id, email")
      .in("email", emails);

    if (usersError) throw usersError;

    const emailToUserId = usersData.reduce((acc, user) => {
      acc[user.email] = user.user_id;

      return acc;
    }, {});

    // Format referees list
    const refereesList = Object.values(referees).map((referee) => ({
      key: referee.email,
      label: referee.email,
      user_id: emailToUserId[referee.email] || null,
      allocated_credits: referee.allocated_credits,
      transfer_completion_date: referee.transfer_completion_date,
    }));

    return NextResponse.json({ refereesList }, { status: 200 });
  } catch (error) {
    console.error("Error fetching referees:", error);

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
