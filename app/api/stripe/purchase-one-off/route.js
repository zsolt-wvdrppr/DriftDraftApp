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

    // ✅ Verify the customer has a valid address for tax calculation
    try {
      const stripeCustomer = await stripe.customers.retrieve(user.stripe_customer_id);
      
      // Check if customer has the required address fields for tax calculation
      if (!stripeCustomer.address || 
          !stripeCustomer.address.line1 || 
          !stripeCustomer.address.city || 
          !stripeCustomer.address.postal_code || 
          !stripeCustomer.address.country) {
        
        logger.error(`❌ Customer ${user.stripe_customer_id} has incomplete address information`);

        return NextResponse.json(
          { 
            error: "A complete billing address is required for tax calculation. Please update your payment method with a valid address.",
            missingAddress: true 
          },
          { status: 400 }
        );
      }
    } catch (customerError) {
      logger.error(`❌ Error retrieving customer: ${customerError.message}`);
      throw customerError;
    }

    // ✅ Fetch product price from Stripe
    const price = await stripe.prices.retrieve(priceId, {
      expand: ["product"],
    });

    if (!price || !price.product || price.recurring) {
      return NextResponse.json({ error: "Invalid product price" }, { status: 400 });
    }

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

    const defaultPaymentMethod = paymentMethods.data[0].id;

    try {
      // 1. Create an invoice item
      const invoiceItem = await stripe.invoiceItems.create({
        customer: user.stripe_customer_id,
        price: priceId,
        description: `Credit top-up: ${price.product.name}`
      });
      
      logger.debug(`🔹 Added invoice item with ID: ${invoiceItem.id} and price: ${priceId}`);

      // Verify the invoice item was created
      const pendingItems = await stripe.invoiceItems.list({
        customer: user.stripe_customer_id,
        pending: true
      });
      
      logger.debug(`🔹 Pending invoice items: ${pendingItems.data.length}`);
      
      if (pendingItems.data.length === 0) {
        return NextResponse.json(
          { error: "Failed to create invoice item. Please try again." },
          { status: 500 }
        );
      }

      // 2. Create an invoice that collects payment
      const invoice = await stripe.invoices.create({
        customer: user.stripe_customer_id,
        description: `Credit purchase: ${price.product.name}`,
        metadata: {
          userId: userId.toString(),
          creditAmount: creditsToAdd.toString(),
        },
        automatic_tax: {
          enabled: true
        },
        collection_method: 'charge_automatically',
        default_payment_method: defaultPaymentMethod,
        // Explicitly include pending invoice items
        pending_invoice_items_behavior: 'include',
        // Don't auto-advance to ensure we can finalize it ourselves
        auto_advance: false
      });
      
      logger.debug(`🔹 Created invoice: ${invoice.id}`);

      // 3. Finalize the invoice
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

      logger.debug(`🔹 Finalized invoice: ${finalizedInvoice.id}`);

      // Check if the invoice has items and an amount due
      if (finalizedInvoice.amount_due === 0) {
        logger.error(`❌ Invoice has zero amount due: ${finalizedInvoice.id}`);
        
        // Check invoice items
        const items = await stripe.invoiceItems.list({
          invoice: finalizedInvoice.id
        });
        
        logger.error(`❌ Invoice items count: ${items.data.length}`);
        
        if (items.data.length === 0) {
          return NextResponse.json(
            { error: "Failed to create invoice with items. Please try again." },
            { status: 500 }
          );
        }
      }

      // 4. If we need to collect payment now and 3D Secure might be required,
      // we need to get the payment intent associated with this invoice
      const retrievedInvoice = await stripe.invoices.retrieve(finalizedInvoice.id, {
        expand: ['payment_intent']
      });
      
      let clientSecret = null;

      if (retrievedInvoice.payment_intent) {
        clientSecret = retrievedInvoice.payment_intent.client_secret;
        logger.debug(`🔹 Got client secret from invoice payment intent: ${retrievedInvoice.payment_intent.id}`);
      }

      // Extract tax information from the invoice for the frontend
      const taxDetails = {
        enabled: finalizedInvoice.automatic_tax.enabled,
        status: finalizedInvoice.automatic_tax.status,
        taxAmount: finalizedInvoice.tax,
        taxPercentage: finalizedInvoice.total > 0 
          ? (finalizedInvoice.tax / finalizedInvoice.total) * 100 
          : 0,
      };

      logger.info(`✅ Invoice created with ID: ${finalizedInvoice.id}, tax amount: ${finalizedInvoice.tax}`);

      // Return information to the frontend, including the client secret if available
      return NextResponse.json({ 
        success: true,
        clientSecret: clientSecret,
        paymentIntentId: retrievedInvoice.payment_intent?.id,
        invoiceId: finalizedInvoice.id,
        invoiceNumber: finalizedInvoice.number,
        hostedInvoiceUrl: finalizedInvoice.hosted_invoice_url,
        amount: finalizedInvoice.amount_due,
        baseAmount: finalizedInvoice.subtotal,
        taxAmount: finalizedInvoice.tax,
        taxDetails
      });
    } catch (stripeError) {
      logger.error(`❌ Stripe operation failed: ${stripeError.message}`);
      
      // Special error handling for payment_intent.confirm errors
      if (stripeError.type === 'StripeCardError') {
        return NextResponse.json({ 
          error: stripeError.message,
          code: stripeError.code,
          decline_code: stripeError.decline_code 
        }, { status: 400 });
      }
      
      throw stripeError;
    }
  } catch (error) {
    logger.error(`❌ Request failed: ${error.message}`);

    // Special handling for address-related errors
    if (error.message && error.message.includes("customer's location isn't recognized")) {
      return NextResponse.json({ 
        error: "A complete billing address is required for tax calculation. Please update your payment method with a valid address.",
        missingAddress: true 
      }, { status: 400 });
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}