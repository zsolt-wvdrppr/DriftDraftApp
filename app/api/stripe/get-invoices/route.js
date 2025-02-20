import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const startingAfter = searchParams.get("starting_after"); // Pagination

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // ✅ Fetch user from Supabase
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: `User not found by id = ${userId}` }, { status: 404 });
    }

    // ✅ Fetch paginated invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: user.stripe_customer_id,
      status: "paid",
      limit: 5, // Fetch 5 invoices at a time
      starting_after: startingAfter || undefined,
    });

    // ✅ Format invoices for frontend
    const invoiceLinks = invoices.data.map((invoice) => ({
      id: invoice.id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      date: new Date(invoice.created * 1000).toISOString(),
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
    }));

    return NextResponse.json({
      success: true,
      invoices: invoiceLinks,
      hasMore: invoices.has_more,
      lastInvoiceId: invoices.data.length > 0 ? invoices.data[invoices.data.length - 1].id : null,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
