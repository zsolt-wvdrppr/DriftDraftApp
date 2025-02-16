"use client";

import { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "@/lib/AuthContext";

export default function PaymentMethod() {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch payment method when user is available
  useEffect(() => {
    if (user) {
      fetch("/api/stripe/get-payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setPaymentMethod(data.paymentMethod);
          } else {
            setError(data.error);
          }
        })
        .catch(() => setError("Failed to load payment method"));
    }
  }, [user]);

  const handleUpdatePaymentMethod = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet.");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/stripe/update-payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          newPaymentMethodId: paymentMethod.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update payment method.");
        setLoading(false);
        return;
      }

      setPaymentMethod({
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
      });

    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h3 className="text-lg font-semibold mb-2">Manage Your Payment Method</h3>
      {error && <p className="text-red-500">{error}</p>}

      {paymentMethod ? (
        <p>
          Saved Card: {paymentMethod.brand} **** {paymentMethod.last4}
        </p>
      ) : (
        <p>No payment method saved</p>
      )}

      <form onSubmit={handleUpdatePaymentMethod} className="space-y-4">
        <CardElement className="p-2 border rounded-md" />
        <button
          type="submit"
          disabled={!stripe || loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          {loading ? "Updating..." : "Update Payment Method"}
        </button>
      </form>
    </div>
  );
}
