// components/StripeProvider.js
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Load your publishable key from environment variables
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export default function StripeProvider({ children }) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
