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

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req) {
  try {
    const { userId, priceId } = await req.json();

    if (!userId || !priceId) {
      return NextResponse.json({ error: "User ID and price ID are required" }, { status: 400 });
    }

    // Fetch the user from Supabase
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, top_up_credits")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: `User not found by id = ${userId}` }, { status: 404 });
    }

    // Fetch product price from Stripe (includes metadata)
    const price = await stripe.prices.retrieve(priceId, {
      expand: ["product"], // Expands product details
    });

    if (!price || !price.product || price.recurring) {
      return NextResponse.json({ error: "Invalid product price" }, { status: 400 });
    }

    // log price object
    logger.debug(`[PURCHASE ONE OFF] - Price:`, price);
    

    const productId = price.product.id;
    const productMetadata = price.product.metadata;

    // Read credit amount from metadata
    const creditsToAdd = productMetadata.credit_amount ? parseInt(productMetadata.credit_amount, 10) : 0;

    if (!creditsToAdd) {
      return NextResponse.json({ error: `Invalid credit amount in product metadata: ${creditsToAdd}` }, { status: 400 });
    }

    // Create a PaymentIntent without confirming it (webhooks will handle confirmation)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: price.currency,
      customer: user.stripe_customer_id,
      payment_method: "pm_card_visa", // Replace with actual user's saved payment method
      confirm: false, // Don't confirm immediately
      metadata: {
        userId,
        productId,
        creditAmount: creditsToAdd,
      },
    });

    return NextResponse.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
