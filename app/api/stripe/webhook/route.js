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

  // ✅ Handle payment_intent.requires_action (3D Secure needed)
  if (event.type === "payment_intent.requires_action") {
    const paymentIntent = event.data.object;
    let subscriptionId = paymentIntent.metadata?.subscription_id;

    // If subscription_id isn't in metadata, try to find it from the invoice
    if (!subscriptionId && paymentIntent.invoice) {
      try {
        const invoice = await stripe.invoices.retrieve(paymentIntent.invoice);

        subscriptionId = invoice.subscription;
      } catch (err) {
        logger.error(`❌ Error fetching invoice: ${err.message}`);
      }
    }

    if (subscriptionId) {
      logger.info(
        `🔹 Payment requires 3D Secure authentication for subscription: ${subscriptionId}`
      );
    } else {
      logger.info(
        `🔹 Payment requires 3D Secure authentication (no subscription ID available)`
      );
    }

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

    // ✅ Update user credits
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        allowance_credits: creditsToAdd, // Add credits to allowance
      })
      .eq("user_id", user.user_id);

    if (updateError) {
      logger.error("❌ Failed to update credits:", updateError);

      return NextResponse.json(
        { error: "Failed to update credits." },
        { status: 500 }
      );
    }

    logger.info(
      `✅ [CREDITS UPDATED] Successfully set ${creditsToAdd} credits for user: ${user.user_id}`
    );

    return NextResponse.json({ success: true });
  }

  // ✅ Handle invoice.payment_action_required
  if (event.type === "invoice.payment_action_required") {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;

    logger.info(
      `🔹 Invoice payment requires action for subscription: ${subscriptionId}`
    );

    return NextResponse.json({ success: true });
  }

  // ✅ Handle invoice.payment_failed
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;
    const customerId = invoice.customer;

    logger.info(
      `🔹 Invoice payment failed for subscription: ${subscriptionId}`
    );

    // Try to find user by customer ID first (more reliable than subscription ID)
    let userData = null;
    let userError = null;

    if (customerId) {
      ({ data: userData, error: userError } = await supabase
        .from("profiles")
        .select("user_id, email")
        .eq("stripe_customer_id", customerId)
        .single());
    }

    // If not found by customer ID, try subscription ID
    if ((!userData || userError) && subscriptionId) {
      ({ data: userData, error: userError } = await supabase
        .from("profiles")
        .select("user_id, email")
        .eq("subscription_id", subscriptionId)
        .single());
    }

    if (userError || !userData) {
      logger.error(
        `❌ User not found for subscription: ${subscriptionId} or customer: ${customerId}`
      );

      // Do not return error, just acknowledge the webhook
      return NextResponse.json({ received: true });
    }

    logger.info(`✅ Recorded payment failure for user: ${userData.user_id}`);

    return NextResponse.json({ success: true });
  }

  // ✅ Handle customer.subscription.created - Save subscription details
  if (event.type === "customer.subscription.created") {
    const subscription = event.data.object;
    const subscriptionId = subscription.id;
    const customerId = subscription.customer;

    logger.info(
      `🔹 New subscription created: ${subscriptionId} for customer: ${customerId}`
    );

    try {
      // Find user by customer ID
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (userError || !user) {
        logger.error(`❌ User not found for customer: ${customerId}`);

        return NextResponse.json({ received: true });
      }

      // Get plan/tier information
      let tierName = "Unknown";

      try {
        if (subscription.items.data.length > 0) {
          const priceId = subscription.items.data[0].price.id;
          const price = await stripe.prices.retrieve(priceId, {
            expand: ["product"],
          });

          tierName = price.product.name || "Unknown";
        }
      } catch (tierError) {
        logger.warn(`⚠️ Error finding tier name: ${tierError.message}`);
      }

      // Get dates
      const planStartsAt = new Date(
        subscription.current_period_start * 1000
      ).toISOString();
      const planRenewsAt = new Date(
        subscription.current_period_end * 1000
      ).toISOString();

      // Save subscription details to user profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          subscription_id: subscriptionId,
          plan_starts_at: planStartsAt,
          plan_renews_at: planRenewsAt,
          tier: tierName,
        })
        .eq("user_id", user.user_id);

      if (updateError) {
        logger.error(
          `❌ Failed to save subscription details: ${updateError.message}`
        );

        return NextResponse.json({ received: true });
      }

      logger.info(`✅ Saved subscription details for user: ${user.user_id}`);

      // Check payment status
      if (subscription.status === "incomplete" && subscription.latest_invoice) {
        logger.info(
          `🔹 Subscription is incomplete, checking payment intent status`
        );

        try {
          const invoice = await stripe.invoices.retrieve(
            subscription.latest_invoice,
            {
              expand: ["payment_intent"],
            }
          );

          if (invoice.payment_intent?.status === "requires_action") {
            logger.info(
              `🔹 Payment requires authentication for subscription: ${subscriptionId}`
            );
          }
        } catch (error) {
          logger.error(`❌ Error fetching invoice: ${error.message}`);
        }
      }
    } catch (error) {
      logger.error(
        `❌ Error processing subscription creation: ${error.message}`
      );
    }

    return NextResponse.json({ success: true });
  }

  // ✅ Handle Subscription Cancellation (Immediate or at Period End)
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    const subscriptionId = subscription.id;
    const status = subscription.status;

    logger.debug(
      `🔹 Subscription ${subscriptionId} updated, status: ${status}`
    );

    // ✅ Fetch user by subscription ID
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("user_id, subscription_id")
      .eq("subscription_id", subscriptionId)
      .single();

    if (userError || !user) {
      logger.error(`❌ User not found for subscription: ${subscriptionId}`);

      return NextResponse.json(
        { error: "User not found for this subscription." },
        { status: 404 }
      );
    }

    // ✅ Handle scheduled cancellation (cancel at period end)
    if (subscription.cancel_at_period_end) {
      const planExpiresAt = new Date(
        subscription.current_period_end * 1000
      ).toISOString();

      logger.debug(`✅ Subscription scheduled to cancel at: ${planExpiresAt}`);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          plan_renews_at: null, // Remove renewal date
          plan_expires_at: planExpiresAt, // Set expiration date
        })
        .eq("user_id", user.user_id);

      if (updateError) {
        logger.error(
          "❌ Failed to update subscription cancellation:",
          updateError
        );

        return NextResponse.json(
          { error: "Failed to update subscription cancellation." },
          { status: 500 }
        );
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
        logger.error(
          "❌ Failed to update immediate subscription cancellation:",
          updateError
        );

        return NextResponse.json(
          { error: "Failed to update subscription cancellation." },
          { status: 500 }
        );
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

      return NextResponse.json(
        { error: "User not found for this subscription." },
        { status: 404 }
      );
    }

    // ✅ Clear subscription details from user profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_id: null,
        plan_renews_at: null,
        plan_expires_at: null,
        plan_starts_at: null,
        tier: "Free",
      })
      .eq("user_id", user.user_id);

    if (updateError) {
      logger.error("❌ Failed to clear subscription details:", updateError);

      return NextResponse.json(
        { error: "Failed to clear subscription details." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  }

  logger.warn(`⚠️ Unhandled event type: ${event.type}`);

  return NextResponse.json({ received: true });
}
