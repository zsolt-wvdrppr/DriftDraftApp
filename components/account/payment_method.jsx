"use client";

import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useAuth } from "@/lib/AuthContext";
import { usePaymentMethod } from "@/lib/hooks/usePaymentMethod";
import { Card, Button, Form } from "@heroui/react";
import {
  IconCreditCard,
  IconBrandStripe,
  IconLock,
  IconAlertTriangleFilled,
} from "@tabler/icons-react";

export default function PaymentMethod() {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const userId = user?.id;

  const { paymentMethod, loading, error, updatePaymentMethod } =
    usePaymentMethod(userId, stripe, elements);

  return (
    <div className="max-w-md mx-auto mt-10">
      
      <Card className="p-4 mt-4 min-h-48 flex justify-stretch border">
        <Form
          onSubmit={updatePaymentMethod}
          className="min-h-48 flex flex-col justify-between w-full"
        >
          <div className="flex gap-x-4 items-center justify-between">
          <IconCreditCard size={24} className="" aria-label="Card number input" />
          {paymentMethod ? (
            <>
              <p className="self-center">
                <code>Saved Card: {paymentMethod.brand} **** {paymentMethod.last4}</code>
              </p>
            </>
          ) : (
            <p className="text-lg">Add a payment method</p>
          )}
          </div>
          <div className="w-full flex">
            <CardElement className="p-2 border rounded-md w-full bg-primary/10" />
          </div>

          <Button
            type="submit"
            color="primary"
            disabled={!stripe || loading}
            className="w-full"
          >
            {loading ? "Updating..." : "Update Payment Method"}
          </Button>
        </Form>
      </Card>
      {error && (
        <div className="flex gap-4 items-center mt-4 justify-center">
          <IconAlertTriangleFilled size={24} className="text-highlightYellow" />
          <p className="text-danger text-center">{error}</p>
        </div>
      )}
    </div>
  );
}
