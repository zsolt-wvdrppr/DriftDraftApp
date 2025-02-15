import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Use Service Role Key for admin operations
  { auth: { persistSession: false } }
);

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
});

export async function POST(req) {
  try {
    const { userId } = await req.json(); // Get user ID from request body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Fetch Stripe Customer ID from Supabase
    const { data, error } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (error || !data?.stripe_customer_id) {
      return NextResponse.json({ error: "No payment method found" }, { status: 404 });
    }

    // Fetch the default payment method from Stripe
    const customer = await stripe.customers.retrieve(data.stripe_customer_id);
    const paymentMethodId = customer.invoice_settings.default_payment_method;

    if (!paymentMethodId) {
      return NextResponse.json({ error: "No default payment method found" }, { status: 404 });
    }

    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    return NextResponse.json({
      success: true,
      paymentMethod: {
        id: paymentMethod.id,
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        exp_month: paymentMethod.card.exp_month,
        exp_year: paymentMethod.card.exp_year,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
