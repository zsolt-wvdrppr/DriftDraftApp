import { useState, useEffect } from "react";

export function usePaymentMethod(userId, stripe, elements) {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch payment method and billing details
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
          setBusinessName(data.businessName || "");
          setVatNumber(data.vatNumber || "");
          setBillingAddress(data.billingAddress || "");
        } else {
          setError(data.error);
        }
      })
      .catch(() => setError("Failed to load payment method"))
      .finally(() => setLoading(false));
  }, [userId]);

  // Function to update payment method and billing details
  const updatePaymentMethod = async (event, billingDetails) => {
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

      // ✅ Send updated billing details to the API
      const response = await fetch("/api/stripe/update-payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          newPaymentMethodId: paymentMethod.id,
          businessName: billingDetails.businessName || null,
          vatNumber: billingDetails.vatNumber || null,
          billingAddress: billingDetails.billingAddress || null,
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

  return {
    paymentMethod,
    businessName,
    vatNumber,
    billingAddress,
    loading,
    error,
    updatePaymentMethod,
  };
}
