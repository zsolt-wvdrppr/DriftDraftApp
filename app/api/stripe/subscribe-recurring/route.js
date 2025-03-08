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

    // ✅ Fetch price details
    const price = await stripe.prices.retrieve(priceId, {
      expand: ["product"],
    });

    let subscription;
    let isUpgrade = false;

    // ✅ Create automatic tax configuration
    const automaticTax = {
      enabled: true
    };

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
      subscription = await stripe.subscriptions.update(user.subscription_id, {
        items: [{ id: subscription.items.data[0].id, price: priceId }],
        proration_behavior: "none", // No immediate charge or proration
        automatic_tax: automaticTax // Enable automatic tax calculation
      });
      logger.debug("🔹 Subscription updated for next renewal with tax calculation enabled.");
    } else {
      // ✅ If no existing subscription, create a new one with tax
      subscription = await stripe.subscriptions.create({
        customer: user.stripe_customer_id,
        items: [{ price: priceId }],
        metadata: { userId, priceId },
        automatic_tax: automaticTax, // Enable automatic tax calculation
        // Optional: You can also add customer billing address details if not already in Stripe
        // customer_update: {
        //   address: 'auto', // Automatically update customer's address for tax calculation
        //   shipping: 'auto' // Automatically update customer's shipping address
        // }
      });
      
      logger.debug("🔹 New subscription created with tax calculation enabled.");
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

    // ✅ Save subscription ID, renewal dates, and tax info in Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        subscription_id: subscription.id,
        plan_starts_at: planStartsAt,
        plan_renews_at: planRenewsAt,
        tier: tier[0], // save the tier name
        tax_enabled: true // Track that tax is enabled for this subscription
      })
      .eq("user_id", userId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to save subscription in database." },
        { status: 500 }
      );
    }

    // ✅ Calculate and include tax information in the response
    let taxAmount = 0;
    let taxRate = 0;
    
    if (subscription.tax && subscription.tax.amount_total) {
      taxAmount = subscription.tax.amount_total;
      
      // Calculate approximate tax rate if possible
      const subtotal = subscription.items.data[0].price.unit_amount;

      if (subtotal > 0) {
        taxRate = (taxAmount / subtotal) * 100;
      }
    }

    return NextResponse.json({
      success: true,
      subscriptionId: subscription.id,
      planStartsAt,
      planRenewsAt,
      taxAmount,
      taxRate: taxRate.toFixed(2) + '%',
      message: isUpgrade
        ? "Subscription change scheduled for next renewal."
        : "Subscription successful!",
    });
  } catch (error) {
    logger.error(`❌ Subscription Error: ${error.message}`);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}