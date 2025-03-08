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

// Helper function to calculate tax
const calculateTax = async (amount, customerId) => {
  try {
    // Calculate tax using Stripe Tax API
    const taxCalculation = await stripe.tax.calculations.create({
      currency: "usd", // Default to USD, adjust if needed
      customer: customerId,
      line_items: [
        {
          amount: amount,
          reference: "manual_calculation",
          tax_behavior: "exclusive",
        },
      ],
    });
    
    return taxCalculation.tax_amount_exclusive || 0;
  } catch (error) {
    logger.warn(`Failed to calculate tax: ${error.message}`);

    return 0; // Fallback to zero tax if calculation fails
  }
};

export async function POST(req) {
  try {
    const { userId, priceId } = await req.json();

    if (!userId || !priceId) {
      return NextResponse.json({ error: "User ID and price ID are required" }, { status: 400 });
    }

    // ✅ Fetch user from Supabase
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: `User not found by id = ${userId}` }, { status: 404 });
    }

    // ✅ Fetch product price from Stripe
    const price = await stripe.prices.retrieve(priceId, {
      expand: ["product"],
    });

    if (!price || !price.product || price.recurring) {
      return NextResponse.json({ error: "Invalid product price" }, { status: 400 });
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

    // ✅ Calculate tax separately using helper function
    const baseAmount = price.unit_amount;
    const taxAmount = await calculateTax(baseAmount, user.stripe_customer_id);
    const totalAmount = baseAmount + taxAmount;

    // ✅ Create PaymentIntent but DON'T confirm it yet
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: price.currency,
      customer: user.stripe_customer_id,
      payment_method: defaultPaymentMethod,
      confirm: false, // Don't confirm automatically server-side
      receipt_email: user.email,
      metadata: {
        userId: userId.toString(),
        priceId: priceId.toString(),
        creditAmount: creditsToAdd.toString(),
        baseAmount: baseAmount.toString(),
        taxAmount: taxAmount.toString(),
      },
      description: `Payment for ${price.product.name} (Base: ${(baseAmount/100).toFixed(2)}, Tax: ${(taxAmount/100).toFixed(2)})`,
    });

    logger.info(`✅ Payment Intent created with ID: ${paymentIntent.id}`);

    // Return the client secret so the frontend can handle 3D Secure if needed
    return NextResponse.json({ 
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
      baseAmount: baseAmount,
      taxAmount: taxAmount
    });

  } catch (error) {
    logger.error(`❌ Request failed: ${error.message}`);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}