// /api/stripe/create-setup-intent/route.js

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
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
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

    // If user has NO stripe_customer_id, create a new Stripe customer
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: userId },
      });

      stripeCustomerId = customer.id;

      // Save Stripe Customer ID in Supabase
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ stripe_customer_id: stripeCustomerId })
        .eq("user_id", userId);

      if (updateError) {
        return NextResponse.json({ error: "Failed to save Stripe customer ID" }, { status: 500 });
      }
    }

    // Create a SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session', // This allows the payment method to be used for future payments
    });

    return NextResponse.json({ 
      success: true, 
      clientSecret: setupIntent.client_secret
    });
  } catch (error) {
    console.error("Setup intent creation error:", error);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}