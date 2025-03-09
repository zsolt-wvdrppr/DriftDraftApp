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
import { useStripe, useElements } from "@stripe/react-stripe-js";
import logger from "@/lib/logger";
import { IconCoins } from "@tabler/icons-react";

// Utility function to create key from a name
const createKey = (name) => name.toLowerCase().replace(/ /g, "_");

const OneOffProductsModal = ({ isOpen, onClose, onSuccess }) => {
  const { products, loading } = useOneOffProducts();
  const [selectedProduct, setSelectedProduct] = useState();
  const { user } = useAuth();
  const userId = user?.id;
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [processingAuth, setProcessingAuth] = useState(false);

  // Log selectedProduct when changes
  useEffect(() => {
    logger.debug(
      `[ONE OFF PRODUCTS] - Selected Product changed:`,
      selectedProduct
    );
  }, [selectedProduct]);

  // Handle 3D Secure authentication when client secret is available
  useEffect(() => {
    const handlePaymentConfirmation = async () => {
      if (!clientSecret || !stripe || processingAuth) return;
      
      setProcessingAuth(true);
      
      try {
        logger.debug(`[ONE OFF PRODUCTS] - Confirming payment with 3D Secure`);
        
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
        
        if (error) {
          logger.error(`[ONE OFF PRODUCTS] - Payment authentication failed:`, error);
          setError(error.message || "Payment authentication failed");
          toast.error(error.message || "Payment authentication failed");
          setProcessingAuth(false);
          setClientSecret(null);
          return;
        }
        
        if (paymentIntent.status === 'succeeded') {
          logger.debug(`[ONE OFF PRODUCTS] - Payment completed successfully`);
          
          // Payment succeeded, refresh credits and close modal
          if (onSuccess) {
            setTimeout(() => {
              onSuccess(); // This should trigger `refreshCredits`
            }, 2000);
          }
          
          setSelectedProduct(null);
          onClose();
          
          toast.success("Payment successful! Credits have been added.", {
            position: "bottom-right",
            closeButton: true,
            duration: 5000,
            classNames: {
              toast: "text-green-800",
            },
          });
        }
      } catch (err) {
        logger.error(`[ONE OFF PRODUCTS] - Error during payment confirmation:`, err);
        setError("An error occurred during payment processing.");
      } finally {
        setProcessingAuth(false);
        setClientSecret(null);
      }
    };
    
    if (clientSecret && stripe) {
      handlePaymentConfirmation();
    }
  }, [clientSecret, stripe, onSuccess, onClose, processingAuth]);

  const handlePurchase = async () => {
    if (!selectedProduct || !userId || !stripe) return;
  
    setLoadingPayment(true);
    setError(null);
  
    try {
      logger.debug(`[ONE OFF PRODUCTS] - User ID: ${userId}`);
      logger.debug(`[ONE OFF PRODUCTS] - Selected Product:`, selectedProduct);
  
      // ✅ Step 1: Request Payment from API
      const response = await fetch("/api/stripe/purchase-one-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, priceId: selectedProduct.priceId }),
      });
  
      const data = await response.json();
  
      if (!data.success) {
        setError(data.error || "Payment failed.");
        setLoadingPayment(false);
        return;
      }
      
      // Check for client secret (needed for 3D Secure)
      if (data.clientSecret) {
        logger.debug(`[ONE OFF PRODUCTS] - 3D Secure authentication required`);
        setClientSecret(data.clientSecret);
        // The payment confirmation will be handled by the useEffect
        return;
      }
  
      // If no 3D Secure needed, handle success immediately
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(); // This should trigger `refreshCredits`
        }, 2000);
      }
  
      setSelectedProduct(null);
      onClose();
  
      toast.success("Payment successful! Credits have been added.", {
        position: "bottom-right",
        closeButton: true,
        duration: 5000,
        classNames: {
          toast: "text-green-800",
        },
      });
  
    } catch (err) {
      logger.error(`[ONE OFF PRODUCTS] - Unexpected Error:`, err);
      setError("An unexpected error occurred.");
    } finally {
      if (!clientSecret) {
        setLoadingPayment(false);
      }
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
        <Modal 
          isOpen={isOpen} 
          onClose={() => {
            if (processingAuth) {
              toast.warning("Please wait while payment is being processed", {
                position: "bottom-right",
              });
              return;
            }
            onClose(); 
            setSelectedProduct(null);
          }}
        >
          <ModalContent>
            <ModalHeader>
              {processingAuth ? "Processing Payment" : "Top-up Credits"}
            </ModalHeader>
            <ModalBody>
              {processingAuth ? (
                <div className="text-center p-4">
                  <p className="mb-4">Please complete the authentication process to finalize your payment.</p>
                  <p className="text-sm text-gray-500">Do not close this window until the process is complete.</p>
                </div>
              ) : (
                <Select
                  aria-label="Select a product"
                  variant="underlined"
                  items={products}
                  isMultiline={true}
                  selectionMode="single"
                  placeholder={
                    <p className="text-lg">
                      Select a top-up amount
                    </p>
                  }
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
              )}
            </ModalBody>
            <ModalFooter>
              {processingAuth ? (
                <Button
                  className="bg-blue-500 text-white"
                  isLoading={true}
                  isDisabled={true}
                >
                  Processing...
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
                    isDisabled={!selectedProduct || !stripe}
                  >
                    Confirm Top-up
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

export default OneOffProductsModal;