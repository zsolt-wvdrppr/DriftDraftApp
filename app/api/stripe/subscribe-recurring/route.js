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

// Helper function to calculate tax for subscriptions
const getDefaultTaxRates = async () => {
  try {
    // Get your active tax rates from Stripe
    const taxRates = await stripe.taxRates.list({
      active: true,
      limit: 10,
    });
    
    if (taxRates.data && taxRates.data.length > 0) {
      // Return tax rate IDs to apply to the subscription
      return taxRates.data.map(rate => rate.id);
    }
    
    return []; // No tax rates found
  } catch (error) {
    logger.warn(`Failed to retrieve tax rates: ${error.message}`);
    return []; // Return empty array if retrieval fails
  }
};

export async function POST(req) {
  try {
    const { userId, priceId } = await req.json();

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
      return NextResponse.json(
        { error: `User not found by id = ${userId}` },
        { status: 404 }
      );
    }

    // ✅ Get applicable tax rates
    const defaultTaxRates = await getDefaultTaxRates();

    let subscription;
    let isUpgrade = false;

    // ✅ If user already has a subscription, modify it
    if (user.subscription_id) {
      isUpgrade = true;
      subscription = await stripe.subscriptions.retrieve(user.subscription_id);

      // ✅ Check if the user is switching plans
      const currentPriceId = subscription.items.data[0].price.id;

      // log entire subscription object
      logger.debug("🔹 Current Subscription:", subscription.items.data[0]);

      if (currentPriceId === priceId) {
        return NextResponse.json(
          { error: "You are already on this plan." },
          { status: 400 }
        );
      }

      // ✅ Update subscription for next renewal (billing cycle remains unchanged)
      // Include tax rates in the update
      subscription = await stripe.subscriptions.update(user.subscription_id, {
        items: [{ id: subscription.items.data[0].id, price: priceId }],
        proration_behavior: "none", // No immediate charge or proration
        default_tax_rates: defaultTaxRates.length > 0 ? defaultTaxRates : undefined,
      });
      logger.debug("🔹 Subscription updated for next renewal.");
    } else {
      // ✅ If no existing subscription, create a new one with tax
      const subscriptionParams = {
        customer: user.stripe_customer_id,
        items: [{ price: priceId }],
        metadata: { userId, priceId },
      };

      // Only add tax rates if we have any
      if (defaultTaxRates.length > 0) {
        subscriptionParams.default_tax_rates = defaultTaxRates;
      }

      // Add auto collection info and email receipts
      subscriptionParams.collection_method = 'charge_automatically';
      if (user.email) {
        subscriptionParams.receipt_email = user.email;
      }

      subscription = await stripe.subscriptions.create(subscriptionParams);
      
      logger.info(`✅ New subscription created with ID: ${subscription.id}`);
      if (defaultTaxRates.length > 0) {
        logger.info(`✅ Applied tax rates: ${defaultTaxRates.join(', ')}`);
      }
    }

    // ✅ Get start and renewal dates from Stripe
    const planStartsAt = new Date(
      subscription.current_period_start * 1000
    ).toISOString();
    const planRenewsAt = new Date(
      subscription.current_period_end * 1000
    ).toISOString();

    // find the user's tier by priceId in products
    const products = await stripe.products.list({
      active: true,
      expand: ["data.default_price"],
    });

    const tier = products.data
      .filter((product) => product.default_price.id === priceId)
      .map((product) => product.name);

    // Get tax information from the subscription
    const taxInfo = {
      hasTax: subscription.default_tax_rates && subscription.default_tax_rates.length > 0,
      taxRateIds: subscription.default_tax_rates || [],
    };

    // ✅ Save subscription ID and renewal dates in Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_id: subscription.id,
        plan_starts_at: planStartsAt,
        plan_renews_at: planRenewsAt,
        tier: tier[0], // save the tier name
        tax_enabled: taxInfo.hasTax, // Track whether tax is applied
      })
      .eq("user_id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to save subscription in database." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      planStartsAt,
      planRenewsAt,
      taxApplied: taxInfo.hasTax,
      message: isUpgrade
        ? "Subscription change scheduled for next renewal."
        : "Subscription successful!",
    });
  } catch (error) {
    logger.error(`❌ Subscription operation failed: ${error.message}`);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}