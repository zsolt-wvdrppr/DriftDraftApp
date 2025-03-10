import { useRecurringProducts } from "@/lib/hooks/useRecurringProducts";
import { useState, useEffect } from "react";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import {
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { toast } from "sonner";

import { useAuth } from "@/lib/AuthContext";
import logger from "@/lib/logger";
import {
  IconStack,
  IconStack2,
  IconStack3,
  IconStethoscope,
} from "@tabler/icons-react";

// Utility function to create key from a name
const createKey = (name) => name.toLowerCase().replace(/ /g, "_");

const RecurringProductsModal = ({ isOpen, onClose, onSuccess }) => {
  const { products, loading } = useRecurringProducts();
  const [selectedProduct, setSelectedProduct] = useState();
  const { user } = useAuth();
  const userId = user?.id;
  const [error, setError] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [requiresAuth, setRequiresAuth] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  // Log selectedProduct when changes
  useEffect(() => {
    logger.debug(
      `[RECURRING PRODUCTS] - Selected Product changed:`,
      selectedProduct
    );
  }, [selectedProduct]);

  // Effect to handle payment when client secret is available
  useEffect(() => {
    if (clientSecret && stripe && !requiresAuth) {
      handlePaymentAttempt();
    }
  }, [clientSecret, stripe]);

  // Function to handle payment attempt
  const handlePaymentAttempt = async () => {
    if (!clientSecret || !stripe) return;

    setRequiresAuth(true);

    try {
      logger.debug(
        `[RECURRING PRODUCTS] - Attempting payment with client secret`
      );

      // Use confirmCardPayment to trigger the authentication flow
      const { error, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret);

      if (error) {
        logger.error(
          `[RECURRING PRODUCTS] - Payment confirmation failed:`,
          error
        );
        setError(error.message || "Payment failed");
        toast.error("Payment failed: " + error.message);
        setRequiresAuth(false);
        setClientSecret("");
        onClose();
        return;
      }

      // Payment succeeded
      logger.debug(`[RECURRING PRODUCTS] - Payment confirmed successfully!`);

      // Notify success
      toast.success("Subscription successful! Your plan is now active.", {
        position: "bottom-right",
        closeButton: true,
        duration: 5000,
        classNames: {
          toast: "text-green-800",
        },
      });

      // Clean up
      setRequiresAuth(false);
      setClientSecret("");
      setSelectedProduct(null);

      // Payment succeeded, refresh credits and close modal
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(); // This should trigger `refreshCredits`
        }, 2000);
      }

      // Close modal
      onClose();
    } catch (err) {
      logger.error(`[RECURRING PRODUCTS] - Error during payment attempt:`, err);
      setError("An error occurred during payment processing.");
      setRequiresAuth(false);
      setClientSecret("");
      onClose();
    } finally {
      setLoadingPayment(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct || !userId) return;

    setLoadingPayment(true);
    setError(null);

    try {
      logger.debug(`[RECURRING PRODUCTS] - User ID: ${userId}`);
      logger.debug(`[RECURRING PRODUCTS] - Selected Product:`, selectedProduct);

      // Step 1: Request Subscription from API
      const response = await fetch("/api/stripe/subscribe-recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, priceId: selectedProduct.priceId }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to create subscription");
        setLoadingPayment(false);
        onClose();
        return;
      }

      // Check if we received a client secret for payment
      if (data.clientSecret) {
        logger.debug(
          `[RECURRING PRODUCTS] - Received client secret for payment`
        );
        setClientSecret(data.clientSecret);
        setSubscriptionId(data.subscriptionId);

        // The useEffect will handle payment confirmation when clientSecret is set
        return;
      }

      // If no client secret needed (e.g., for plan changes)
      setSelectedProduct(null);

      // Notify about success
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();

      toast.success(data.message || "Subscription successful!", {
        position: "bottom-right",
        closeButton: true,
        duration: 5000,
        classNames: {
          toast: "text-green-800",
        },
      });
    } catch (err) {
      logger.error(`[RECURRING PRODUCTS] - Unexpected Error:`, err);
      setError("An unexpected error occurred.");
      onClose();
    } finally {
      if (!clientSecret) {
        setLoadingPayment(false);
      }
    }
  };

  const colorVariants = [
    "text-highlightBlue",
    "text-highlightPurple",
    "text-highlightOrange",
    "text-primary",
  ];

  const icons = {
    Tester: <IconStethoscope size={24} className="text-primary" />,
    Power: <IconStack2 size={24} className="text-highlightPurple" />,
    Pro: <IconStack3 size={24} className="text-highlightOrange" />,
    Starter: <IconStack size={24} className="text-highlightBlue" />,
  };

  if (!products || !products.length) {
    return null;
  }

  return (
    <div>
      {
        <Modal
          isOpen={isOpen}
          onClose={() => {
            if (!requiresAuth) {
              onClose();
              setSelectedProduct(null);
            } else {
              // Show warning if trying to close during processing
              toast.warning("Please wait while we process your payment.", {
                position: "bottom-right",
              });
            }
          }}
        >
          <ModalContent>
            <ModalHeader>
              {requiresAuth ? "Processing Payment" : "Manage Your Subscription"}
            </ModalHeader>
            <ModalBody>
              {requiresAuth ? (
                <div className="text-center p-4">
                  <p className="mb-4">
                    Please wait while we process your payment and set up your
                    subscription.
                  </p>
                  <p className="text-sm text-gray-500">
                    This may take a moment. Please do not close this window.
                  </p>
                </div>
              ) : (
                <Select
                  aria-label="Select a product"
                  variant="underlined"
                  items={products}
                  isMultiline={true}
                  placeholder={<p className="text-lg">Select a plan</p>}
                  classNames={{
                    trigger: "min-h-24",
                  }}
                  renderValue={(items, index) => {
                    // Map the selected keys back to the full plan objects
                    const selectedProducts = items?.map((item) => {
                      return products.find(
                        (product) => createKey(product.name) === item.key
                      );
                    });

                    return selectedProducts?.map((product) => (
                      <div
                        key={createKey(product.name)}
                        className="flex items-center gap-4"
                      >
                        <div className="flex flex-col justify-between">
                          <p className="font-semibold">{product.name}</p>
                          <p>{product.description}</p>
                          <p>£{product.amount}</p>
                        </div>
                      </div>
                    ));
                  }}
                >
                  {(product) => (
                    <SelectItem
                      key={createKey(product.name)}
                      aria-label={product.name}
                      onPress={() => {
                        setSelectedProduct((prev) =>
                          prev?.id === product.id ? null : product
                        );
                      }}
                    >
                      <div className="flex items-center gap-4 border-b-1 pb-3 border-default-200 dark:border-default-200">
                        {icons[product.name]}
                        <div className="flex flex-col justify-between">
                          <p className="font-semibold">{product.name}</p>
                          <p>{product.description}</p>
                          <p>£{product.amount}</p>
                        </div>
                      </div>
                    </SelectItem>
                  )}
                </Select>
              )}
            </ModalBody>
            <ModalFooter>
              {requiresAuth ? (
                <Button
                  className="bg-blue-500 text-white"
                  isLoading={true}
                  isDisabled={true}
                >
                  Processing Payment...
                </Button>
              ) : (
                <>
                  <Button
                    onPress={onClose}
                    className="bg-gray-500 text-white"
                    isDisabled={loadingPayment}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-green-500 text-white"
                    onPress={handlePurchase}
                    isLoading={loadingPayment}
                    isDisabled={!selectedProduct}
                  >
                    Confirm Plan
                  </Button>
                </>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      }
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default RecurringProductsModal;
