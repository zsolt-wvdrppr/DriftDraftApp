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
} from "@tabler/icons-react";
import useDarkMode from "@/lib/hooks/useDarkMode";

export default function PaymentMethod() {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const userId = user?.id;
  const isDarkMode = useDarkMode(); 

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
    }, [businessName, vatNumber, billingAddress]);

  return (
    <div className="mx-auto mt-10">
      <Form
         onSubmit={(e) =>
          updatePaymentMethod(e, {
            businessName: businessNameState,
            vatNumber: vatNumberState,
            billingAddress: billingAddressState,
          })
        }
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
            {paymentMethod ? (
              <p className="self-center">
                <code>
                  Saved Card: {paymentMethod.brand} **** {paymentMethod.last4}
                </code>
              </p>
            ) : (
              <p className="text-lg">Add a payment method</p>
            )}
          </div>

          <div className="w-full flex">
            <CardElement className="p-2 border rounded-md w-full bg-primary/10 dark:bg-content1 dark" options={{style:{base: {color: `${isDarkMode ? "#fff" : ""}`}}}} />
          </div>

          <Button
            type="submit"
            color="primary"
            disabled={!stripe || loading}
            className="w-full"
          >
            {loading ? "Updating..." : "Update Payment Method"}
          </Button>
        </Card>
      </Form>

      {error && (
        <div className="flex gap-4 items-center mt-4 justify-center">
          <IconAlertTriangleFilled size={24} className="text-highlightYellow" />
          <p className="text-danger text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
