import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

import logger from "@/lib/logger";

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
    const body = await req.json();
    const { userId, priceId } = body;

    logger.debug(`🔹 Subscription request received for user ${userId}, price ${priceId}`);

    if (!userId || !priceId) {
      return NextResponse.json(
        { error: "User ID and price ID are required" },
        { status: 400 }
      );
    }

    // ✅ Fetch user from Supabase
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, subscription_id, email")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      logger.error(`❌ User not found by id = ${userId}`);

      return NextResponse.json(
        { error: `User not found by id = ${userId}` },
        { status: 404 }
      );
    }

    let subscription;
    let isUpgrade = false;
    let clientSecret = null;

    // ✅ If user already has a subscription, modify it
    if (user.subscription_id) {
      isUpgrade = true;
      logger.debug(`🔹 Updating existing subscription ${user.subscription_id}`);
      
      try {
        subscription = await stripe.subscriptions.retrieve(user.subscription_id);
        
        // ✅ Check if the user is switching plans
        const currentPriceId = subscription.items.data[0].price.id;

        logger.debug(`🔹 Current price ID: ${currentPriceId}, new price ID: ${priceId}`);

        if (currentPriceId === priceId) {
          return NextResponse.json(
            { error: "You are already on this plan." },
            { status: 400 }
          );
        }

        // ✅ Update subscription for next renewal (billing cycle remains unchanged)
        // Enable automatic tax calculation
        subscription = await stripe.subscriptions.update(user.subscription_id, {
          items: [{ id: subscription.items.data[0].id, price: priceId }],
          proration_behavior: "none", // No immediate charge or proration
          automatic_tax: { enabled: true },
        });
        logger.debug("🔹 Subscription updated for next renewal with automatic tax");
      } catch (subscriptionError) {
        logger.error(`❌ Error handling existing subscription: ${subscriptionError.message}`);
        throw subscriptionError;
      }
    } else {
      // ✅ If no existing subscription, create a new one
      logger.debug(`🔹 Creating new subscription for user ${userId}`);
      
      try {
        // Create subscription with automatic tax calculation enabled
        const subscriptionParams = {
          customer: user.stripe_customer_id,
          items: [{ price: priceId }],
          metadata: { userId, priceId },
          expand: ['latest_invoice.payment_intent'],
          automatic_tax: { enabled: true },
        };

        // Create subscription
        subscription = await stripe.subscriptions.create(subscriptionParams);
        logger.debug(`🔹 Subscription created with ID: ${subscription.id}`);
        
        // CRITICAL: Save subscription ID to database IMMEDIATELY to ensure webhooks can find the user
        try {
          const { error: immediateUpdateError } = await supabase
            .from("profiles")
            .update({ subscription_id: subscription.id })
            .eq("user_id", userId);

          if (immediateUpdateError) {
            logger.error(`❌ Failed to immediately save subscription ID: ${immediateUpdateError.message}`);
          } else {
            logger.debug(`✅ Subscription ID immediately saved to database`);
          }
        } catch (dbError) {
          logger.error(`❌ Database operation error during immediate update: ${dbError.message}`);
        }
        
        // Check payment intent status
        if (subscription.latest_invoice?.payment_intent) {
          const paymentIntentStatus = subscription.latest_invoice.payment_intent.status;

          logger.debug(`🔹 Payment intent status: ${paymentIntentStatus}`);
          
          // If 3D Secure is needed
          if (paymentIntentStatus === 'requires_action' || 
              paymentIntentStatus === 'requires_confirmation') {
            clientSecret = subscription.latest_invoice.payment_intent.client_secret;
            logger.info(`✅ 3D Secure authentication required for subscription`);
            
            // Add subscription ID to payment intent metadata for tracking
            await stripe.paymentIntents.update(
              subscription.latest_invoice.payment_intent.id,
              {
                metadata: { 
                  subscription_id: subscription.id,
                  user_id: userId
                }
              }
            );
          }
        }
      } catch (createError) {
        logger.error(`❌ Error creating subscription: ${createError.message}`);
        throw createError;
      }
    }

    // ✅ Get start and renewal dates from Stripe
    const planStartsAt = new Date(
      subscription.current_period_start * 1000
    ).toISOString();
    const planRenewsAt = new Date(
      subscription.current_period_end * 1000
    ).toISOString();

    // Find the user's tier by priceId in products
    let tierName = null;

    try {
      const products = await stripe.products.list({
        active: true,
        expand: ["data.default_price"],
      });

      const tier = products.data
        .filter((product) => product.default_price.id === priceId)
        .map((product) => product.name);
        
      tierName = tier[0] || null;
      logger.debug(`🔹 Found tier name: ${tierName}`);
    } catch (tierError) {
      logger.warn(`⚠️ Error finding tier name: ${tierError.message}`);
    }

    // ✅ Get tax information from latest invoice
    let taxDetails = null;
    
    try {
      if (subscription.latest_invoice) {
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice);
        
        // Get automatic tax information
        if (invoice.automatic_tax) {
          taxDetails = {
            enabled: invoice.automatic_tax.enabled,
            status: invoice.automatic_tax.status,
            taxAmount: invoice.tax,
            taxPercentage: invoice.total > 0 ? (invoice.tax / invoice.total) * 100 : 0,
          };
          
          logger.debug(`🔹 Retrieved tax details: ${JSON.stringify(taxDetails)}`);
        }
      }
    } catch (taxError) {
      logger.warn(`⚠️ Error retrieving tax information: ${taxError.message}`);
    }

    // ✅ Save additional subscription details in Supabase
    // (We already saved the subscription_id immediately after creation)
    try {
      const updateData = {
        plan_starts_at: planStartsAt,
        plan_renews_at: planRenewsAt,
      };
      
      // Only add tier if we found one
      if (tierName) {
        updateData.tier = tierName;
      }
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", userId);

      if (updateError) {
        logger.error(`❌ Database update error: ${updateError.message}`);

        return NextResponse.json(
          { error: "Failed to save subscription details in database." },
          { status: 500 }
        );
      }
    } catch (dbError) {
      logger.error(`❌ Database operation error: ${dbError.message}`);
      throw dbError;
    }

    logger.info(`✅ Subscription process completed successfully for user ${userId}`);
    
    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      planStartsAt,
      planRenewsAt,
      taxDetails,
      requiresAuthentication: !!clientSecret,
      clientSecret,
      message: isUpgrade
        ? "Subscription change scheduled for next renewal."
        : clientSecret 
          ? "Subscription created. Please complete authentication." 
          : "Subscription successful!",
    });
  } catch (error) {
    logger.error(`❌ Subscription operation failed: ${error.message}`);
    logger.error(error.stack); // Log the full stack trace

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}