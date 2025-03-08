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

    try {
      // Step 1: Create a SetupIntent on the server
      const setupResponse = await fetch("/api/stripe/create-setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      
      const setupData = await setupResponse.json();
      
      if (!setupResponse.ok) {
        throw new Error(setupData.error || "Failed to create setup intent");
      }
      
      // Step 2: Confirm the SetupIntent with the card element
      const cardElement = elements.getElement("card");
      const { error: confirmError, setupIntent } = await stripe.confirmCardSetup(
        setupData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: billingDetails.businessName || undefined,
              address: {
                line1: billingDetails.billingAddress || undefined,
              },
            },
          },
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Step 3: Send updated billing details to the API with the confirmed payment method
      const response = await fetch("/api/stripe/update-payment-method", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          newPaymentMethodId: setupIntent.payment_method,
          businessName: billingDetails.businessName || null,
          vatNumber: billingDetails.vatNumber || null,
          billingAddress: billingDetails.billingAddress || null,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update payment method.");
      }

      // Get the payment method details to display to the user
      const { paymentMethod: paymentMethodDetails } = await stripe.retrievePaymentMethod(
        setupIntent.payment_method
      );

      setPaymentMethod({
        brand: paymentMethodDetails.card.brand,
        last4: paymentMethodDetails.card.last4,
      });

    } catch (err) {
      console.error("Payment method update error:", err);
      setError(err.message || "An unexpected error occurred.");
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