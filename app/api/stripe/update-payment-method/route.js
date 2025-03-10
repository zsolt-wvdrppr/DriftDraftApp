// Update payment method /api/stripe/update-payment-method/route.js

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req) {
  try {
    const { userId, newPaymentMethodId, businessName, vatNumber, billingAddress } = await req.json();

    if (!userId || !newPaymentMethodId) {
      return NextResponse.json({ error: "User ID and payment method are required" }, { status: 400 });
    }

    // Validate required address fields for tax calculation
    if (!billingAddress || !billingAddress.line1 || !billingAddress.city || 
        !billingAddress.postal_code || !billingAddress.country) {
      return NextResponse.json({ 
        error: "Complete address is required for tax calculation (line1, city, postal_code, and country)" 
      }, { status: 400 });
    }

    // Fetch the user from Supabase
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found in Supabase" }, { status: 404 });
    }

    let stripeCustomerId = user.stripe_customer_id;

    // 🔹 If user has NO stripe_customer_id, create a new Stripe customer
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: userId },
      });

      stripeCustomerId = customer.id;

      // 🔹 Save Stripe Customer ID in Supabase
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("user_id", userId);

      if (updateError) {
        return NextResponse.json({ error: "Failed to save Stripe customer ID" }, { status: 500 });
      }
    }

    // 🔹 Attach the new payment method to the Stripe customer
    await stripe.paymentMethods.attach(newPaymentMethodId, { customer: stripeCustomerId });

    // Set up tax_id for VAT if provided
    const taxIdData = vatNumber ? [{ type: "eu_vat", value: vatNumber }] : [];

    // 🔹 Update customer with detailed address information for tax calculation
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: newPaymentMethodId },
      name: businessName || undefined,
      tax_id_data: taxIdData.length > 0 ? taxIdData : undefined,
      address: {
        line1: billingAddress.line1,
        line2: billingAddress.line2 || null,
        city: billingAddress.city,
        state: billingAddress.state || null,
        postal_code: billingAddress.postal_code,
        country: billingAddress.country,
      }
    });

    // Optional: Retrieve the payment method to return to the client
    const paymentMethod = await stripe.paymentMethods.retrieve(newPaymentMethodId);

    // Store the billing address in Supabase for future reference
    const { error: addressUpdateError } = await supabase
      .from("profiles")
      .update({ 
        billing_address: billingAddress,
        business_name: businessName || null,
        vat_number: vatNumber || null
      })
      .eq("user_id", userId);

    if (addressUpdateError) {
      console.error("Failed to update billing address in Supabase:", addressUpdateError);
      // Continue anyway - the critical part was updating Stripe
    }

    return NextResponse.json({ 
      success: true, 
      stripeCustomerId,
      paymentMethod: {
        id: paymentMethod.id,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year
      }
    });
  } catch (error) {
    console.error("Payment method update error:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}