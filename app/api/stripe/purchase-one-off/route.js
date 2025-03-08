import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

import logger from "@/lib/logger";

// ✅ Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
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
      .select("stripe_customer_id, email")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: `User not found by id = ${userId}` },
        { status: 404 }
      );
    }

    // ✅ Fetch product price from Stripe
    const price = await stripe.prices.retrieve(priceId, {
      expand: ["product"],
    });

    if (!price || !price.product || price.recurring) {
      return NextResponse.json(
        { error: "Invalid product price" },
        { status: 400 }
      );
    }

    const productId = price.product.id;
    const productMetadata = price.product.metadata;

    // ✅ Read credit amount from metadata
    const creditsToAdd = productMetadata.credit_amount
      ? parseInt(productMetadata.credit_amount, 10)
      : 0;

    if (!creditsToAdd) {
      return NextResponse.json(
        { error: "Invalid credit amount in product metadata" },
        { status: 400 }
      );
    }

    // ✅ Fetch the user's saved payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripe_customer_id,
      type: "card",
    });

    if (!paymentMethods.data.length) {
      return NextResponse.json(
        { error: "No saved payment method found. Please add a card first." },
        { status: 400 }
      );
    }

    const defaultPaymentMethod = paymentMethods.data[0].id; // ✅ Use the first saved payment method

    // ✅ Create a tax calculation for the purchase
    const taxCalculation = await stripe.tax.calculations.create({
      currency: price.currency,
      customer: user.stripe_customer_id,
      line_items: [
        {
          amount: price.unit_amount,
          reference: productId,
          tax_behavior: "exclusive", // Tax is added to the price
          tax_code: productMetadata.tax_code || "txcd_10000000", // Default to general tax code if not specified
        },
      ],
      // Optional: Add customer location if available
      // customer_details: {
      //   address: {
      //     line1: '...',
      //     city: '...',
      //     state: '...',
      //     postal_code: '...',
      //     country: '...',
      //   },
      //   address_source: 'shipping' // or 'billing'
      // },
    });

    // ✅ Step 1: Create and confirm PaymentIntent (charges the user immediately)
    let paymentIntent;

    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: price.unit_amount,
        currency: price.currency,
        customer: user.stripe_customer_id,
        payment_method: defaultPaymentMethod,
        confirm: true, // ✅ Charge immediately
        receipt_email: user.email,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never", // ✅ No redirect-based payments
        },
        metadata: {
          userId: userId.toString(),
          priceId: priceId.toString(),
          creditAmount: creditsToAdd.toString(),
          includedTax: Boolean(taxCalculation.tax_amount_inclusive).toString(),
        },
        // ✅ Add tax information
        tax: {
          calculation: taxCalculation.id,
        },
        description: `${price.product.name} purchase with ${taxCalculation.tax_amount_inclusive ? "tax included" : "no tax"}`,
      });

      logger.info(
        `✅ Payment succeeded for user ${userId}: ${paymentIntent.id}`
      );
    } catch (err) {
      logger.error(`❌ Payment failed: ${err.message}`);

      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      tax: taxCalculation.tax_amount_inclusive || 0,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
