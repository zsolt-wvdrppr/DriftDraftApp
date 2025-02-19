// /webhook/route.js

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

import logger from "@/lib/logger";

// ✅ Initialize Supabase with the Service Role Key (Bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Admin-level access
  { auth: { persistSession: false } }
);

// ✅ Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
});

// ✅ Secret key for verifying Stripe webhooks
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    const body = await req.text();

    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);

    // ✅ Log event type to debug
    logger.info(`🔹 [WEBHOOK RECEIVED] Event Type: ${event.type}`);
  } catch (error) {
    logger.error("❌ Webhook Signature Verification Failed", error.message);

    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }

  // ✅ Handle One-Off Payments
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    // ✅ If payment is linked to a subscription, ignore it
    if (paymentIntent.invoice) {
      logger.info(
        "🔹 Skipping `payment_intent.succeeded` as it's from a subscription invoice."
      );

      return NextResponse.json({ ignored: true });
    }

    const userId = paymentIntent.metadata.userId;
    const creditAmount = parseInt(paymentIntent.metadata.creditAmount, 10) || 0;

    if (!userId || !creditAmount) {
      logger.error("❌ Invalid metadata in payment intent");

      return NextResponse.json(
        { error: "Invalid metadata in payment intent" },
        { status: 400 }
      );
    }

    logger.info(
      `✅ Payment succeeded for user: ${userId}, adding ${creditAmount} credits.`
    );

    // ✅ Use Supabase RPC function to increment top_up_credits
    const { error: rpcError } = await supabase.rpc(
      "increment_profile_top_up_credits",
      {
        p_user_id: userId,
        p_amount: creditAmount,
      }
    );

    if (rpcError) {
      logger.error("❌ Error updating profile credits:", rpcError);

      return NextResponse.json(
        { success: false, error: "Unable to update profile credits" },
        { status: 500 }
      );
    }

    logger.info(`✅ Credits updated successfully for user: ${userId}`);

    return NextResponse.json({ success: true });
  }

  // ✅ Handle Subscription Renewals
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;

    logger.info(
      `🔹 Processing subscription renewal for subscription: ${subscriptionId}`
    );

    // ✅ Fetch user by subscription ID
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("user_id, allowance_credits")
      .eq("subscription_id", subscriptionId)
      .single();

    if (userError || !user) {
      logger.error(`❌ User not found for subscription: ${subscriptionId}`);

      return NextResponse.json(
        { error: "User not found for this subscription." },
        { status: 404 }
      );
    }

    // ✅ Get credit amount from Stripe metadata
    const priceId = invoice.lines.data[0].price.id;
    const price = await stripe.prices.retrieve(priceId, {
      expand: ["product"],
    });

    const creditsToAdd = price.product.metadata.credit_amount
      ? parseInt(price.product.metadata.credit_amount, 10)
      : 0;

    if (!creditsToAdd) {
      logger.error("❌ Invalid credit amount in metadata.");

      return NextResponse.json(
        { error: "Invalid credit amount in metadata." },
        { status: 400 }
      );
    }

    logger.info(
      `✅ [ADDING CREDITS] ${creditsToAdd} credits for user: ${user.user_id}`
    );

    // ✅ Overwrite credits (no carry-over)
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ allowance_credits: creditsToAdd }) // Ensure correct column name
      .eq("user_id", user.user_id);

    if (updateError) {
      logger.error("❌ Failed to update credits:", updateError);

      return NextResponse.json(
        { error: "Failed to update credits." },
        { status: 500 }
      );
    }

    logger.info(
      `✅ [CREDITS UPDATED] Successfully added ${creditsToAdd} credits for user: ${user.user_id}`
    );

    return NextResponse.json({ success: true });
  }

  // ✅ Handle Subscription Cancellation (Immediate or at Period End)
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    const subscriptionId = subscription.id;
    const status = subscription.status;

    logger.debug(`🔹 Subscription ${subscriptionId} updated, status: ${status}`);

    // ✅ Fetch user by subscription ID
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("user_id, subscription_id")
      .eq("subscription_id", subscriptionId)
      .single();

    if (userError || !user) {
      logger.error(`❌ User not found for subscription: ${subscriptionId}`);
      
      return NextResponse.json({ error: "User not found for this subscription." }, { status: 404 });
    }

    // ✅ Handle scheduled cancellation (cancel at period end)
    if (subscription.cancel_at_period_end) {
      const planExpiresAt = new Date(subscription.current_period_end * 1000).toISOString();

      logger.debug(`✅ Subscription scheduled to cancel at: ${planExpiresAt}`);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          plan_renews_at: null, // Remove renewal date
          plan_expires_at: planExpiresAt, // Set expiration date
        })
        .eq("user_id", user.user_id);

      if (updateError) {
        logger.error("❌ Failed to update subscription cancellation:", updateError);

        return NextResponse.json({ error: "Failed to update subscription cancellation." }, { status: 500 });
      }
    }

    // ✅ Handle immediate cancellation (subscription is completely canceled)
    if (status === "canceled") {
      logger.debug(`✅ Subscription ${subscriptionId} is fully canceled.`);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          subscription_id: null, // Remove subscription ID
          plan_renews_at: null,
          plan_expires_at: null, // Clear expiration date
        })
        .eq("user_id", user.user_id);

      if (updateError) {
        logger.error("❌ Failed to update immediate subscription cancellation:", updateError);

        return NextResponse.json({ error: "Failed to update subscription cancellation." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  }

  // ✅ Handle Subscription Deletion
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const subscriptionId = subscription.id;

    logger.debug(`🔹 Subscription ${subscriptionId} deleted.`);

    // ✅ Fetch user by subscription ID
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("subscription_id", subscriptionId)
      .single();

    if (userError || !user) {
      logger.error(`❌ User not found for subscription: ${subscriptionId}`);

      return NextResponse.json({ error: "User not found for this subscription." }, { status: 404 });
    }

    // ✅ Clear subscription details from user profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_id: null,
        plan_renews_at: null,
        plan_expires_at: null,
        plan_starts_at: null,
        tier: "Free"
      })
      .eq("user_id", user.user_id);

    if (updateError) {
      logger.error("❌ Failed to clear subscription details:", updateError);

      return NextResponse.json({ error: "Failed to clear subscription details." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  }

  logger.warn(`⚠️ Unhandled event type: ${event.type}`);

  return NextResponse.json({ received: true });
}
