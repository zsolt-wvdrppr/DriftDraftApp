import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
});

export async function fetchOneOffProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
  });

  return products.data
    .filter((product) => !product.default_price.recurring)
    .map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      priceId: product.default_price.id,
      amount: product.default_price.unit_amount / 100, // Convert cents to dollars
      currency: product.default_price.currency.toUpperCase(),
      creditAmount: product.metadata.credit_amount ? parseInt(product.metadata.credit_amount, 10) : 0, // Extract credit amount
    }));
}


