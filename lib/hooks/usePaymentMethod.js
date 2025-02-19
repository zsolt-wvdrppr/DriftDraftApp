import { useState, useEffect } from "react";

export function usePaymentMethod(userId, stripe, elements) {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch payment method when user is available
  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    fetch("/api/stripe/get-payment-method", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPaymentMethod(data.paymentMethod);
          setLoading(false);
        } else {
          setError(data.error);
        }
      })
      .catch(() => setError("Failed to load payment method"));
  }, [userId]);

  // Function to update payment method
  const updatePaymentMethod = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet.");
      setLoading(false);

      return;
    }

    const cardElement = elements.getElement("card");

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
          userId,
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
      setError("An unexpected error occurred.", err);
    } finally {
      setLoading(false);
    }
  };

  return { paymentMethod, loading, error, updatePaymentMethod };
}
