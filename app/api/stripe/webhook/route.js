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

// Secret key for verifying Stripe webhooks
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    const body = await req.text(); // Read raw body

    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (error) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    const userId = paymentIntent.metadata.userId;
    const creditAmount = parseInt(paymentIntent.metadata.creditAmount, 10) || 0;

    if (!userId || !creditAmount) {
      return NextResponse.json({ error: "Invalid metadata in payment intent" }, { status: 400 });
    }

    logger.info(`✅ Payment succeeded for user: ${userId}, adding ${creditAmount} credits.`);

    // Use Supabase RPC function to increment top_up_credits
    const { error: rpcError } = await supabase.rpc("increment_profile_top_up_credits", {
      p_user_id: userId,
      p_amount: creditAmount,
    });

    if (rpcError) {
      logger.error("❌ Error updating profile credits:", rpcError);

      return NextResponse.json({ success: false, error: "Unable to update profile credits" }, { status: 500 });
    }

    logger.info(`✅ Credits updated successfully for user: ${userId}`);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ received: true });
}
