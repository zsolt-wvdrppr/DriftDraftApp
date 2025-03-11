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

  // ✅ Handle payment_intent.succeeded for invoices
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    // If this payment is for a one-time purchase (has creditAmount)
    if (
      paymentIntent.metadata &&
      paymentIntent.metadata.creditAmount &&
      paymentIntent.metadata.invoiceId
    ) {
      const userId = paymentIntent.metadata.userId;
      const creditAmount =
        parseInt(paymentIntent.metadata.creditAmount, 10) || 0;
      const invoiceId = paymentIntent.metadata.invoiceId;

      if (!userId || !creditAmount) {
        logger.error("❌ Invalid metadata in payment intent");

        return NextResponse.json(
          { error: "Invalid metadata in payment intent" },
          { status: 400 }
        );
      }

      logger.info(
        `✅ Payment succeeded for user: ${userId}, adding ${creditAmount} credits. Invoice: ${invoiceId}`
      );

      // ✅ Try to pay the invoice if it's not already paid
      try {
        const invoice = await stripe.invoices.retrieve(invoiceId);

        if (invoice.status !== "paid") {
          // Try to mark the invoice as paid
          await stripe.invoices.pay(invoiceId, {
            paid_out_of_band: true, // Use this since we're handling payment outside the invoice flow
          });
          logger.info(`✅ Marked invoice ${invoiceId} as paid`);
        } else {
          logger.info(`✅ Invoice ${invoiceId} is already marked as paid`);
        }
      } catch (invoiceError) {
        logger.warn(
          `⚠️ Could not mark invoice as paid: ${invoiceError.message}`
        );
        // Continue processing since the payment succeeded anyway
      }

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

      // Add a record to credit transactions if you have that table
      try {
        // Fetch the invoice to get tax details
        const invoice = await stripe.invoices.retrieve(invoiceId);

        // Record the transaction with tax details
        await supabase.from("credit_transactions").insert({
          user_id: userId,
          amount: creditAmount,
          type: "purchase",
          stripe_invoice_id: invoiceId,
          stripe_payment_id: paymentIntent.id,
          metadata: {
            invoice_number: invoice.number,
            tax_amount: invoice.tax,
            total_amount: invoice.total,
            payment_method_details: paymentIntent.payment_method_details?.card
              ? {
                  brand: paymentIntent.payment_method_details.card.brand,
                  last4: paymentIntent.payment_method_details.card.last4,
                }
              : null,
          },
        });

        logger.info(
          `✅ Transaction recorded with invoice details for user: ${userId}`
        );
      } catch (txError) {
        // Don't fail the webhook if transaction recording fails
        logger.error(`❌ Error recording transaction: ${txError.message}`);
      }

      logger.info(`✅ Credits updated successfully for user: ${userId}`);

      return NextResponse.json({ success: true });
    }
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
    } else if (paymentIntent.metadata?.creditAmount) {
      logger.info(
        `🔹 One-time purchase payment requires 3D Secure authentication - userId: ${paymentIntent.metadata.userId}`
      );
    } else {
      logger.info(
        `🔹 Payment requires 3D Secure authentication (unknown payment type)`
      );
    }

    return NextResponse.json({ success: true });
  }

  // ✅ Handle invoice.created event
  if (event.type === "invoice.created") {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;

    // Skip if there's no subscription (likely a one-time purchase invoice)
    if (!subscriptionId) {
      logger.info(`🔹 Skipping non-subscription invoice: ${invoice.id}`);

      return NextResponse.json({ ignored: true });
    }

    logger.info(
      `🔹 Processing new invoice for subscription: ${subscriptionId}`
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

    // Update the plan_renews_at date based on the invoice period_end
    const planRenewsAt = new Date(invoice.period_end * 1000).toISOString();

    // ✅ Update user's renewal date
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        plan_renews_at: planRenewsAt,
      })
      .eq("user_id", user.user_id);

    if (updateError) {
      logger.error(`❌ Failed to update renewal date: ${updateError.message}`);

      return NextResponse.json(
        { error: "Failed to update renewal date." },
        { status: 500 }
      );
    }

    logger.info(
      `✅ Updated renewal date for user: ${user.user_id} to ${planRenewsAt}`
    );

    return NextResponse.json({ success: true });
  }

  // ✅ Handle invoice.paid event - This is for one-time purchases
  if (event.type === "invoice.paid") {
    const invoice = event.data.object;

    // Check if this is a one-time purchase (has creditAmount in metadata)
    if (
      invoice.metadata &&
      invoice.metadata.creditAmount &&
      invoice.metadata.userId
    ) {
      const userId = invoice.metadata.userId;
      const creditAmount = parseInt(invoice.metadata.creditAmount, 10) || 0;

      logger.info(
        `🔹 One-time purchase invoice paid: ${invoice.id} for user: ${userId}`
      );

      if (!userId || !creditAmount) {
        logger.error("❌ Invalid metadata in invoice");

        return NextResponse.json(
          { error: "Invalid metadata in invoice" },
          { status: 400 }
        );
      }

      // Check if we've already processed this invoice
      const { data: existingTx } = await supabase
        .from("credit_transactions")
        .select("id")
        .eq("stripe_invoice_id", invoice.id)
        .single();

      if (existingTx) {
        logger.info(
          `🔹 Skip processing - invoice already processed: ${invoice.id}`
        );

        return NextResponse.json({ success: true, already_processed: true });
      }

      // Add the credits
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

      // Record the transaction
      try {
        await supabase.from("credit_transactions").insert({
          user_id: userId,
          amount: creditAmount,
          type: "purchase",
          stripe_invoice_id: invoice.id,
          stripe_payment_id: invoice.payment_intent,
          metadata: {
            invoice_number: invoice.number,
            tax_amount: invoice.tax,
            total_amount: invoice.total,
          },
        });

        logger.info(`✅ Transaction recorded for invoice: ${invoice.id}`);
      } catch (txError) {
        logger.error(`❌ Error recording transaction: ${txError.message}`);
      }

      logger.info(`✅ Credits updated successfully for user: ${userId}`);

      return NextResponse.json({ success: true });
    }

    // If it has a subscription ID, let your existing handler process it
  }

  // ✅ Handle invoice.payment_action_required event
  if (event.type === "invoice.payment_action_required") {
    const invoice = event.data.object;

    // Check if this is a one-time purchase or subscription
    if (invoice.subscription) {
      logger.info(
        `🔹 Subscription invoice payment requires action for subscription: ${invoice.subscription}`
      );
    } else if (invoice.metadata?.userId && invoice.metadata?.creditAmount) {
      // One-time purchase that requires action (like 3D Secure)
      const userId = invoice.metadata.userId;

      logger.info(
        `🔹 One-time purchase invoice payment requires action for user: ${userId}`
      );

      // The frontend will handle the 3D Secure authentication
    } else {
      logger.info(`🔹 Unknown invoice payment requires action: ${invoice.id}`);
    }

    return NextResponse.json({ success: true });
  }

  // ✅ Handle Subscription Renewals
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;

    // Skip if there's no subscription (likely a one-time purchase invoice)
    if (!subscriptionId) {
      logger.info(`🔹 Skipping non-subscription invoice: ${invoice.id}`);

      return NextResponse.json({ ignored: true });
    }

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

  // ✅ Handle invoice.payment_failed event
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object;

    // Check if this is a one-time purchase or subscription
    if (invoice.subscription) {
      // Let your existing subscription handler process this
      logger.info(
        `🔹 Subscription invoice payment failed for subscription: ${invoice.subscription}`
      );
    } else if (invoice.metadata?.userId && invoice.metadata?.creditAmount) {
      // One-time purchase failure
      const userId = invoice.metadata.userId;

      logger.info(
        `🔹 One-time purchase invoice payment failed for user: ${userId}`
      );

      // You could implement specific logic for one-time purchase failures here
    } else {
      logger.info(`🔹 Unknown invoice payment failed: ${invoice.id}`);
    }

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

  // ✅ Enhanced Handler for Subscription Updates
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object;
    const subscriptionId = subscription.id;
    const status = subscription.status;
    const currentPeriodEnd = subscription.current_period_end;
    const currentPeriodStart = subscription.current_period_start;

    logger.debug(
      `🔹 Subscription ${subscriptionId} updated, status: ${status}, period: ${new Date(currentPeriodStart * 1000).toISOString()} to ${new Date(currentPeriodEnd * 1000).toISOString()}`
    );

    // ✅ Fetch user by subscription ID
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("user_id, subscription_id, plan_renews_at")
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
      const planExpiresAt = new Date(currentPeriodEnd * 1000).toISOString();

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

      return NextResponse.json({ success: true });
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

      return NextResponse.json({ success: true });
    }

    // ✅ Handle subscription renewal - Check if this is a renewal by comparing period dates
    if (status === "active") {
      const planRenewsAt = new Date(currentPeriodEnd * 1000).toISOString();
      const oldRenewalDate = user.plan_renews_at;

      // Update the renewal date
      const { error: updateDateError } = await supabase
        .from("profiles")
        .update({
          plan_renews_at: planRenewsAt,
        })
        .eq("user_id", user.user_id);

      if (updateDateError) {
        logger.error(
          `❌ Failed to update renewal date: ${updateDateError.message}`
        );
      } else {
        logger.info(
          `✅ Updated renewal date for user: ${user.user_id} to ${planRenewsAt}`
        );
      }

      // Check if this is likely a renewal (period end has changed)
      const isRenewal =
        oldRenewalDate &&
        new Date(oldRenewalDate).getTime() <
          new Date(currentPeriodEnd * 1000).getTime();

      // If this is a new period, update the credits
      if (isRenewal) {
        logger.info(
          `🔹 Processing subscription renewal for user: ${user.user_id}`
        );

        try {
          // Get the subscription item to find the price
          if (subscription.items.data.length === 0) {
            logger.error(
              `❌ No subscription items found for subscription: ${subscriptionId}`
            );

            return NextResponse.json({ success: true }); // Continue with date update only
          }

          const priceId = subscription.items.data[0].price.id;

          // Get credit amount from product metadata
          const price = await stripe.prices.retrieve(priceId, {
            expand: ["product"],
          });

          const creditsToAdd = price.product.metadata.credit_amount
            ? parseInt(price.product.metadata.credit_amount, 10)
            : 0;

          if (!creditsToAdd) {
            logger.error(
              `❌ Invalid credit amount in metadata for price ID: ${priceId}`
            );

            return NextResponse.json({ success: true }); // Continue with date update only
          }

          // Update user credits
          const { error: updateCreditsError } = await supabase
            .from("profiles")
            .update({
              allowance_credits: creditsToAdd, // Set credits to allowance amount
            })
            .eq("user_id", user.user_id);

          if (updateCreditsError) {
            logger.error(
              `❌ Failed to update credits: ${updateCreditsError.message}`
            );

            return NextResponse.json({ success: true }); // Continue with date update only
          }

          // Record the transaction - Correctly handling the promise
          try {
            const { error: transactionError } = await supabase
              .from("credit_transactions")
              .insert({
                user_id: user.user_id,
                amount: creditsToAdd,
                type: "subscription_renewal",
                stripe_invoice_id: subscription.latest_invoice,
                metadata: {
                  subscription_id: subscriptionId,
                  price_id: priceId,
                  product_name: price.product.name,
                  renewal_date: new Date().toISOString(),
                },
              });

            if (transactionError) {
              logger.error(
                `❌ Error recording transaction: ${transactionError.message}`
              );
            } else {
              logger.info(`✅ Transaction recorded for subscription renewal`);
            }
          } catch (transactionError) {
            logger.error(
              `❌ Exception recording transaction: ${transactionError.message}`
            );
            // Continue since credits were updated successfully
          }

          logger.info(
            `✅ [CREDITS UPDATED] Successfully set ${creditsToAdd} credits for user: ${user.user_id}`
          );
        } catch (error) {
          logger.error(
            `❌ Error processing subscription renewal: ${error.message}`
          );
          // Continue with renewal date update only
        }
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
        allowance_credits: 0,
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

  // Also add handlers for the test clock events if you're using them for testing
  if (
    event.type === "test_helpers.test_clock.advancing" ||
    event.type === "test_helpers.test_clock.ready"
  ) {
    logger.info(`🔹 Test clock event: ${event.type}`);

    return NextResponse.json({ success: true });
  }

  logger.warn(`⚠️ Unhandled event type: ${event.type}`);

  return NextResponse.json({ received: true });
}
