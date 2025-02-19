import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ✅ Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Admin-level access
  { auth: { persistSession: false } }
);

// ✅ Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // ✅ Fetch user from Supabase
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, subscription_id")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: `User not found by id = ${userId}` }, { status: 404 });
    }

    if (!user.subscription_id) {
      return NextResponse.json({ error: "No active subscription to cancel." }, { status: 400 });
    }

    // ✅ Cancel subscription at the end of the billing cycle
    const subscription = await stripe.subscriptions.update(user.subscription_id, {
      cancel_at_period_end: true,
    });

    // ✅ Get the subscription expiration date
    const planExpiresAt = new Date(subscription.current_period_end * 1000).toISOString(); // Convert to timestamp format

    // ✅ Update database to reflect cancellation
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan_renews_at: null, // Remove renewal date
        plan_expires_at: planExpiresAt, // Set expiration date
      })
      .eq("user_id", userId);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update subscription status in database." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Subscription will be canceled at the end of the billing cycle.", planExpiresAt });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
