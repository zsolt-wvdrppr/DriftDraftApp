"use client";

import { useState, useEffect } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "@/lib/AuthContext";
import { usePaymentMethod } from "@/lib/hooks/usePaymentMethod";
import { Card, Button, Form, Input, Select, SelectItem, Avatar } from "@heroui/react";
import {
  IconCreditCard,
  IconBuilding,
  IconFileText,
  IconMapPin,
  IconAlertTriangleFilled,
  IconCircleCheck,
  IconFlag,
  IconHome,
  IconMap,
  IconMailbox,
} from "@tabler/icons-react";
import useDarkMode from "@/lib/hooks/useDarkMode";
import { COUNTRIES, isEUCountry, validateVatNumber } from "@/lib/utils/utils";

export default function PaymentMethod() {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const userId = user?.id;
  const isDarkMode = useDarkMode(); 
  const [processingPayment, setProcessingPayment] = useState(false);
  const [localPaymentMethod, setLocalPaymentMethod] = useState(null);
  const [vatRequired, setVatRequired] = useState(false);
  const [vatError, setVatError] = useState("");

  const {
    paymentMethod,
    businessName,
    vatNumber,
    billingAddress,
    loading,
    error,
    setupSuccess,
    updatePaymentMethod,
  } = usePaymentMethod(userId, stripe, elements);

  // ✅ State for billing details, now structured properly for Stripe
  const [businessNameState, setBusinessName] = useState("");
  const [vatNumberState, setVatNumber] = useState("");
  
  // New structured address fields
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  // ✅ Update state when Stripe data is loaded
  useEffect(() => {
    // Only update form state when loading is complete to prevent blank form flashing
    if (!loading) {
      setBusinessName(businessName || "");
      setVatNumber(vatNumber || "");
      
      // Parse billing address if it exists
      if (billingAddress && typeof billingAddress === 'object') {
        console.log("Setting form fields from billing address:", billingAddress);
        setAddressLine1(billingAddress.line1 || "");
        setAddressLine2(billingAddress.line2 || "");
        setCity(billingAddress.city || "");
        setState(billingAddress.state || "");
        setPostalCode(billingAddress.postal_code || "");
        setCountry(billingAddress.country || "");
      }
      
      setLocalPaymentMethod(paymentMethod);
    }
  }, [businessName, vatNumber, billingAddress, paymentMethod, loading]);

  // Update VAT requirement based on country selection
  useEffect(() => {
    if (country) {
      const isEU = isEUCountry(country);
      setVatRequired(isEU);
      
      // Clear VAT error when country changes
      setVatError("");
      
      console.log(`Country set to ${country}, EU status: ${isEU ? "EU" : "Non-EU"}`);
    }
  }, [country]);

  // Clear the card element on successful setup
  useEffect(() => {
    if (setupSuccess && elements) {
      const cardElement = elements.getElement(CardElement);
      if (cardElement) {
        cardElement.clear();
      }
      
      // Optional: Auto-hide success message after a few seconds
      const timer = setTimeout(() => {
        // We don't need to set any state here as the success state is in the hook
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [setupSuccess, elements]);

  // Updated function to handle payment method update with 3D Secure
  const handleUpdatePaymentMethod = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);
    setVatError("");
    
    try {
      // Check VAT number if country is in EU
      if (vatRequired) {
        if (!vatNumberState) {
          setVatError("VAT number is required for EU countries");
          setProcessingPayment(false);
          return;
        }
        
        if (!validateVatNumber(vatNumberState, country)) {
          setVatError(`Invalid VAT format. VAT should start with country code (${country}) followed by 8-12 alphanumeric characters`);
          setProcessingPayment(false);
          return;
        }
      }
      
      // Call the hook's updatePaymentMethod with all form data
      await updatePaymentMethod({
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country,
        businessNameState,
        vatNumberState
      });
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
        <Card className="flex-grow max-w-md p-4 gap-y-4 border-0 shadow-none">
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
            label={vatRequired ? "VAT Number (Required for EU)" : "VAT Number (Optional)"}
            type="text"
            value={vatNumberState}
            onChange={(e) => setVatNumber(e.target.value)}
            placeholder={vatRequired ? `${country}123456789` : "Enter VAT number"}
            isRequired={vatRequired}
            color={vatError ? "danger" : undefined}
            startIcon={<IconFileText />}
            classNames={{
              label: vatRequired ? "!text-danger dark:!text-danger" : "!text-primary dark:!text-accentMint",
              input: "dark:!text-white",
              inputWrapper: vatError 
                ? "!border-danger bg-danger/10" 
                : "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
            }}
            description={vatRequired ? `Format: ${country} followed by 8-12 characters` : undefined}
            errorMessage={vatError}
          />

          {/* ✅ Address Line 1 - Required */}
          <Input
            label="Address Line 1"
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="Street address"
            isRequired
            startIcon={<IconHome />}
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "dark:!text-white",
              inputWrapper: "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
            }}
          />

          {/* ✅ Address Line 2 - Optional */}
          <Input
            label="Address Line 2 (Optional)"
            type="text"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
            placeholder="Apt, Suite, Building (optional)"
            startIcon={<IconMapPin />}
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "dark:!text-white",
              inputWrapper: "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
            }}
          />

          {/* ✅ City - Required */}
          <Input
            label="City"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            isRequired
            startIcon={<IconMap />}
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "dark:!text-white",
              inputWrapper: "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
            }}
          />

          <div className="flex gap-4">
            {/* ✅ State/Province */}
            <Input
              label="State/Province"
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State/Province"
              classNames={{
                label: "!text-primary dark:!text-accentMint",
                input: "dark:!text-white",
                inputWrapper: "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
              }}
            />

            {/* ✅ Postal Code - Required */}
            <Input
              label="Postal Code"
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="ZIP/Postal Code"
              isRequired
              startIcon={<IconMailbox />}
              classNames={{
                label: "!text-primary dark:!text-accentMint",
                input: "dark:!text-white",
                inputWrapper: "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
              }}
            />
          </div>

          {/* ✅ Country - Required */}
          <Select
            label="Country"
            placeholder="Select country"
            selectedKeys={country ? [country] : []}
            onChange={(e) => setCountry(e.target.value)}
            isRequired
            startContent={<IconFlag />}
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              trigger: "dark:!text-white bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
            }}
          >
            {COUNTRIES
              .sort((a, b) => a.label.localeCompare(b.label))
              .map((countryOption) => (
                <SelectItem
                  key={countryOption.value}
                  value={countryOption.value}
                  textValue={countryOption.label}
                  startContent={
                    <Avatar 
                      alt={countryOption.label} 
                      className="w-6 h-6" 
                      src={`https://flagcdn.com/${countryOption.flag}.svg`} 
                    />
                  }
                >
                  {countryOption.label} {countryOption.isEU ? "(EU)" : ""}
                </SelectItem>
              ))
            }
          </Select>
        </Card>

        <Card className="p-4 h-60 gap-y-4 flex justify-between border max-w-sm flex-grow">
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
            disabled={!stripe || processingPayment || loading}
            className="w-full"
          >
            {processingPayment || loading ? "Processing..." : "Update Payment Method"}
          </Button>
        </Card>
      </Form>

      {(error || vatError) && (
        <div className="flex gap-4 items-center mt-4 justify-center">
          <IconAlertTriangleFilled size={24} className="text-highlightYellow" />
          <p className="text-danger text-center">{vatError || error}</p>
        </div>
      )}
    </div>
  );
}