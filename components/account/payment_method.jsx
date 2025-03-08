"use client";

import { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "@/lib/AuthContext";
import { usePaymentMethod } from "@/lib/hooks/usePaymentMethod";
import { Card, Button, Form, Input, Textarea } from "@heroui/react";
import {
  IconCreditCard,
  IconBuilding,
  IconFileText,
  IconMapPin,
  IconAlertTriangleFilled,
  IconCircleCheck,
} from "@tabler/icons-react";
import useDarkMode from "@/lib/hooks/useDarkMode";

export default function PaymentMethod() {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const userId = user?.id;
  const isDarkMode = useDarkMode(); 
  const [processingPayment, setProcessingPayment] = useState(false);
  const [setupError, setSetupError] = useState(null);
  const [setupSuccess, setSetupSuccess] = useState(false);
  const [localPaymentMethod, setLocalPaymentMethod] = useState(null);

  const {
    paymentMethod,
    businessName,
    vatNumber,
    billingAddress,
    loading,
    error,
    updatePaymentMethod,
  } = usePaymentMethod(userId, stripe, elements);

  // ✅ State for billing details, pre-filled with Stripe data
  const [businessNameState, setBusinessName] = useState("");
  const [vatNumberState, setVatNumber] = useState("");
  const [billingAddressState, setBillingAddress] = useState("");

  // ✅ Update state when Stripe data is loaded
  useEffect(() => {
    setBusinessName(businessName || "");
    setVatNumber(vatNumber || "");
    setBillingAddress(billingAddress || "");
    setLocalPaymentMethod(paymentMethod);
  }, [businessName, vatNumber, billingAddress, paymentMethod]);

  // Clear the card element on successful setup
  useEffect(() => {
    if (setupSuccess && elements) {
      const cardElement = elements.getElement(CardElement);
      if (cardElement) {
        cardElement.clear();
      }
    }
  }, [setupSuccess, elements]);

  // New function to handle payment method update with 3D Secure
  const handleUpdatePaymentMethod = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);
    setSetupError(null);
    setSetupSuccess(false);

    if (!stripe || !elements) {
      setSetupError("Stripe has not loaded yet.");
      setProcessingPayment(false);
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
      const cardElement = elements.getElement(CardElement);
      const { error: confirmError, setupIntent } = await stripe.confirmCardSetup(
        setupData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: businessNameState || undefined,
              address: {
                line1: billingAddressState || undefined,
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
          businessName: businessNameState || null,
          vatNumber: vatNumberState || null,
          billingAddress: billingAddressState || null,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update payment method.");
      }

      // Step 4: Get payment method details from the API response or fetch them separately
      // Instead of using stripe.retrievePaymentMethod which doesn't exist in the client
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
        setLocalPaymentMethod(updatedPaymentMethod);
      }
      
      setSetupSuccess(true);
      
      // Optional: Display a success message that auto-hides after a few seconds
      setTimeout(() => {
        setSetupSuccess(false);
      }, 5000);

    } catch (err) {
      console.error("Payment method update error:", err);
      setSetupError(err.message || "An unexpected error occurred.");
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="mx-auto mt-10">
      {setupSuccess && (
        <div className="flex items-center justify-center p-3 bg-green-100 dark:bg-green-900 rounded-md mb-4">
          <IconCircleCheck className="text-green-600 dark:text-green-400 mr-2" size={20} />
          <span className="text-green-700 dark:text-green-300">
            Payment method successfully updated!
          </span>
        </div>
      )}
      
      <Form
        onSubmit={handleUpdatePaymentMethod}
        className="flex flex-row items-stretch justify-center flex-wrap gap-4"
      >
        <Card className="flex-grow max-w-sm p-4 gap-y-4">
          {/* ✅ Business Name */}
          <Input
            label="Business Name (Optional)"
            type="text"
            value={businessNameState}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Enter your company name"
            startIcon={<IconBuilding />}
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "dark:!text-white",
              inputWrapper: "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
            }}
          />

          {/* ✅ VAT Number */}
          <Input
            label="VAT Number (Optional)"
            type="text"
            value={vatNumberState}
            onChange={(e) => setVatNumber(e.target.value)}
            placeholder="Enter VAT number"
            startIcon={<IconFileText />}
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "dark:!text-white",
              inputWrapper: "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
            }}
          />

          {/* ✅ Billing Address */}
          <Textarea
            label="Billing Address"
            value={billingAddressState}
            onChange={(e) => setBillingAddress(e.target.value)}
            placeholder="Street, City, ZIP, Country"
            startIcon={<IconMapPin />}
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "dark:!text-white",
              inputWrapper: "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
            }}
          />
        </Card>
        <Card className="p-4 min-h-68 gap-y-4 flex justify-between border max-w-sm flex-grow">
          <div className="flex gap-x-4 items-center justify-between">
            <IconCreditCard size={24} aria-label="Card number input" />
            {localPaymentMethod ? (
              <p className="self-center">
                <code>
                  Saved Card: {localPaymentMethod.brand} **** {localPaymentMethod.last4}
                </code>
              </p>
            ) : (
              <p className="text-lg">Add a payment method</p>
            )}
          </div>

          <div className="w-full flex">
            <CardElement 
              className="p-2 border rounded-md w-full bg-primary/10 dark:bg-content1 dark" 
              options={{
                style: {
                  base: {
                    color: `${isDarkMode ? "#fff" : ""}`
                  }
                }
              }} 
            />
          </div>

          <Button
            type="submit"
            color="primary"
            disabled={!stripe || processingPayment}
            className="w-full"
          >
            {processingPayment ? "Processing..." : "Update Payment Method"}
          </Button>
        </Card>
      </Form>

      {(error || setupError) && (
        <div className="flex gap-4 items-center mt-4 justify-center">
          <IconAlertTriangleFilled size={24} className="text-highlightYellow" />
          <p className="text-danger text-center">{setupError || error}</p>
        </div>
      )}
    </div>
  );
}