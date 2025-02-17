import { useOneOffProducts } from "@/lib/hooks/useOneOffProducts";
import { useState, useEffect } from "react";
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
import { useStripe } from "@stripe/react-stripe-js";
import logger from "@/lib/logger";
import { IconCoins } from "@tabler/icons-react";

// Utility function to creat key from a name
const createKey = (name) => name.toLowerCase().replace(/ /g, "_");

const OneOffProductsModal = ({ isOpen, onClose, onSuccess }) => {
  const { products, loading } = useOneOffProducts();
  const [selectedProduct, setSelectedProduct] = useState();
  const { user } = useAuth();
  const userId = user?.id;
  const stripe = useStripe();
  const [error, setError] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);

  // Log selectedProduct when changes
  useEffect(() => {
    logger.debug(
      `[ONE OFF PRODUCTS] - Selected Product changed:`,
      selectedProduct
    );
  }, [selectedProduct]);

  const handlePurchase = async () => {
    if (!selectedProduct || !userId) return;

    setLoadingPayment(true);
    setError(null);

    try {
      logger.debug(`[ONE OFF PRODUCTS] - User ID: ${userId}`);
      logger.debug(`[ONE OFF PRODUCTS] - Selected Product:`, selectedProduct);

      // Step 1: Request PaymentIntent from API
      const response = await fetch("/api/stripe/purchase-one-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, priceId: selectedProduct.priceId }),
      });

      const { success, clientSecret, error } = await response.json();

      if (!success || !clientSecret) {
        setError(error || "Failed to create payment intent");
        setLoadingPayment(false);
        return;
      }

      // ✅ Ensure Stripe is ready
      if (!stripe) {
        setError("Stripe.js has not loaded yet.");
        setLoadingPayment(false);
        return;
      }

      logger.debug(
        `[ONE OFF PRODUCTS] - Confirming Payment with Stripe using saved method`
      );

      // Step 2: Confirm Payment with the saved payment method
      const { paymentIntent, error: stripeError } =
        await stripe.confirmCardPayment(clientSecret);

      if (stripeError) {
        logger.error(`[ONE OFF PRODUCTS] - Stripe Error:`, stripeError);
        setError(stripeError.message);
        setLoadingPayment(false);
        return;
      }

      // Step 3: Check if payment was successful
      if (paymentIntent.status === "succeeded") {
        setSelectedProduct(null);

        // ✅ Notify parent component about successful purchase
        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
        // Close the modal in 2 seconds
        onClose();
        toast.success("Payment successful! Credits will be added shortly.", {
          position: "bottom-right",
          closeButton: true,
          duration: 5000,
          classNames: {
            toast: "text-green-800",
          },
        });
      } else {
        setError("Payment not completed. Please try again.");
        toast.error("Payment not completed. Please try again.", {
          position: "bottom-right",
          closeButton: true,
          duration: 5000,
          classNames: {
            toast: "text-danger",
          },
        });
      }
    } catch (err) {
      logger.error(`[ONE OFF PRODUCTS] - Unexpected Error:`, err);
      setError("An unexpected error occurred.");
    } finally {
      setLoadingPayment(false);
    }
  };

  const colorVariants = [
    "text-highlightOrange",
    "text-highlightBlue",
    "text-highlightPurple",
  ];

  if (!products || !products.length) {
    return null;
  }

  return (
    <div>
      {
        <Modal isOpen={isOpen} onClose={() => {onClose(); setSelectedProduct(null)}}>
          <ModalContent>
            <ModalHeader>Top-up Credits</ModalHeader>
            <ModalBody>
              <Select
                aria-label="Select a product"
                variant="underlined"
                items={products}
                isMultiline={true}
                placeholder={
                  <p className="text-lg">
                    Select a top-up amount
                  </p>
                }
                classNames={{
                  trigger: "min-h-24",
                }}
                //onSelectionChange={setSelectedProduct}
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
                    // setSelectedProduct(product) if selectedProduct not equals to the previous selected product
                    onPress={() => {
                      setSelectedProduct((prev) =>
                        prev?.id === product.id ? null : product
                      );
                    }}
                  >
                    <div className="flex items-center gap-4 border-b-1 pb-3 border-default-200 dark:border-default-200">
                      <IconCoins
                        size={24}
                        className={
                          colorVariants[
                            products.indexOf(product) % colorVariants.length
                          ]
                        }
                      />
                      <div className="flex flex-col justify-between">
                        <p className="font-semibold">{product.name}</p>
                        <p>{product.description}</p>
                        <p>£{product.amount}</p>
                      </div>
                    </div>
                  </SelectItem>
                )}
              </Select>
            </ModalBody>
            <ModalFooter>
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
                Confirm Top-up
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      }
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default OneOffProductsModal;
