import { useRecurringProducts } from "@/lib/hooks/useRecurringProducts";
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
import logger from "@/lib/logger";
import { IconStack, IconStack2, IconStack3 } from "@tabler/icons-react";
import { Tooltip } from "react-tooltip";

// Utility function to creat key from a name
const createKey = (name) => name.toLowerCase().replace(/ /g, "_");

const RecurringProductsModal = ({ isOpen, onClose, onSuccess }) => {
  const { products, loading } = useRecurringProducts();
  const [selectedProduct, setSelectedProduct] = useState();
  const { user } = useAuth();
  const userId = user?.id;
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
      logger.debug(`[RECURRING PRODUCTS] - User ID: ${userId}`);
      logger.debug(`[RECURRING PRODUCTS] - Selected Product:`, selectedProduct);

      // Step 1: Request Subscription from API
      const response = await fetch("/api/stripe/subscribe-recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, priceId: selectedProduct.priceId }),
      });

      const { success, message, subscriptionId, error } = await response.json();

      if (!success) {
        setError(error || "Failed to create subscription");
        setLoadingPayment(false);
        onClose();
        return;
      }

      // ✅ Subscription successful or change scheduled
      setSelectedProduct(null);

      // ✅ Notify parent component about successful purchase
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }

      // Close the modal in 2 seconds
      onClose();

      // ✅ Show different messages for new vs. updated subscriptions
      toast.success(
        message || "Subscription successful! Credits will be added on renewal.",
        {
          position: "bottom-right",
          closeButton: true,
          duration: 5000,
          classNames: {
            toast: "text-green-800",
          },
        }
      );
    } catch (err) {
      logger.error(`[RECURRING PRODUCTS] - Unexpected Error:`, err);
      setError("An unexpected error occurred.");
      onClose();
    } finally {
      setLoadingPayment(false);
    }
  };

  const colorVariants = [
    "text-highlightBlue",
    "text-highlightPurple",
    "text-highlightOrange",
  ];

  /*const icons = [
    <IconStack2 size={24} className="text-highlightBlue" />,
    <IconStack3 size={24} className="text-highlightPurple" />,
    <IconStack size={24} className="text-highlightOrange" />,
  ];*/

  const icons = {
    Pro: <IconStack2 size={24} className="text-highlightPurple" />,
    Advanced: <IconStack3 size={24} className="text-highlightOrange" />,
    Starter: <IconStack size={24} className="text-highlightBlue" />,
  }


  if (!products || !products.length) {
    return null;
  }

  return (
    <div>
      {
        <Modal
          isOpen={isOpen}
          onClose={() => {
            onClose();
            setSelectedProduct(null);
          }}
        >
          <ModalContent>
            <ModalHeader>Manage Your Subscription</ModalHeader>
            <ModalBody>
              <Select
                aria-label="Select a product"
                variant="underlined"
                items={products}
                isMultiline={true}
                placeholder={<p className="text-lg">Select a plan</p>}
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
                Confirm Plan
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      }
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default RecurringProductsModal;
