import { useState, useEffect } from "react";
import { CardElement } from "@stripe/react-stripe-js";

import logger from "@/lib/logger";

export function usePaymentMethod(userId, stripe, elements) {
  const [paymentMethod, setPaymentMethod] = useState(null); 
  const [businessName, setBusinessName] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [setupSuccess, setSetupSuccess] = useState(false);
  
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
          
          // Handle the properly structured billing address
          if (data.billingAddress) {
            // No need to transform the address as it's now properly structured from the API
            logger.debug("Setting billing address:", data.billingAddress);
            setBillingAddress(data.billingAddress);
          } else {
            logger.debug("No billing address data received");
            setBillingAddress({
              line1: "",
              line2: "",
              city: "",
              state: "",
              postal_code: "",
              country: ""
            });
          }
        } else {
          setError(data.error);
        }
      })
      .catch((err) => {
        logger.error("Error fetching payment method:", err);
        setError("Failed to load payment method");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  // Function to update payment method and billing details
  const updatePaymentMethod = async (formData) => {
    setLoading(true);
    setError(null);
    setSetupSuccess(false);

    if (!stripe || !elements) {
      setError("Stripe has not loaded yet.");
      setLoading(false);

      return;
    }

    // Validate required address fields for tax calculation
    const { addressLine1, city, postalCode, country, businessNameState, vatNumberState, addressLine2, state } = formData;
    
    if (!addressLine1 || !city || !postalCode || !country) {
      setError("Address Line 1, City, Postal Code, and Country are required.");
      setLoading(false);

      return;
    }

    // Prepare structured address object
    const formattedAddress = {
      line1: addressLine1,
      line2: addressLine2 || undefined,
      city,
      state: state || undefined,
      postal_code: postalCode,
      country,
    };

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
      const cardElement = elements.getElement(CardElement);
      const { error: confirmError, setupIntent } = await stripe.confirmCardSetup(
        setupData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: businessNameState || undefined,
              address: formattedAddress,
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
          businessName: businessNameState || null,
          vatNumber: vatNumberState || null,
          billingAddress: formattedAddress,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update payment method.");
      }

      // Step 4: Get payment method details from the API response or fetch them separately
      let updatedPaymentMethod;
      
      if (responseData.paymentMethod) {
        // If your API returns payment method details
        updatedPaymentMethod = responseData.paymentMethod;
      } else {
        // Otherwise, make a separate API call to get payment method details
        const pmResponse = await fetch("/api/stripe/get-payment-method", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        
        const pmData = await pmResponse.json();
        
        if (pmResponse.ok && pmData.success) {
          updatedPaymentMethod = pmData.paymentMethod;
        }
      }

      // Update local state with the new payment method
      if (updatedPaymentMethod) {
        setPaymentMethod(updatedPaymentMethod);
      }
      
      // Update the other states
      setBusinessName(businessNameState || "");
      setVatNumber(vatNumberState || "");
      setBillingAddress(formattedAddress);
      setSetupSuccess(true);
      
      return true;
    } catch (err) {
      logger.error("Payment method update error:", err);
      setError(err.message || "An unexpected error occurred.");

      return false;
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
    setupSuccess,
    updatePaymentMethod,
  };
}