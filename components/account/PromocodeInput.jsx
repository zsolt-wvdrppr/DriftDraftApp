import { useState } from "react";
import { Input, Button } from "@heroui/react";
import logger from "@/lib/logger";
import { IconCheck, IconSend, IconX } from "@tabler/icons-react";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export const PromocodeInput = ({ onPromoCodeApplied }) => {
  const [promoCode, setPromoCode] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const { user } = useAuth();

  const handleUpdate = async () => {
    if (!promoCode.trim()) return;

    logger.info(`Validating promo code: ${promoCode}`);
    setLoading(true);
    setIsValidated(false);
    setError(null);

    try {
      const res = await fetch("/api/promocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, code: promoCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsCodeValid(false);
        setError(data.error || "Something went wrong");
      } else {
        setIsCodeValid(true);
        logger.info(`Promo code valid. Credits awarded: ${data.creditsAwarded}`);
        if (typeof onPromoCodeApplied === "function") {
          onPromoCodeApplied(data);
        }
      }
    } catch (err) {
      setIsCodeValid(false);
      setError("Network or server error");
      logger.error("Error validating promo code", err);
    } finally {
      setLoading(false);
      setIsValidated(true);
      setIsChanged(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleUpdate();
    }
  };

  return (
    <div>
      <div className="flex items-center">
        <Input
          label="Enter Promo Code"
          type="text"
          value={promoCode}
          classNames={{
            label: "!text-primary dark:!text-accentMint",
            input: "dark:!text-white",
            inputWrapper: "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
          }}
          onChange={(e) => {
            setPromoCode(e.target.value);
            setIsChanged(true);
            setIsCodeValid(false);
            setIsValidated(false);
          }}
          onKeyDown={handleKeyDown}
          disabled={loading}
          endContent={
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center h-full pt-0.5"
            >
              {(isChanged || isCodeValid) && (
                <Button
                  onPress={handleUpdate}
                  className={`${loading ? "bg-lime-600" : isCodeValid ? "bg-success" : !isCodeValid && isValidated ? "bg-danger" : "bg-warning"} text-white rounded-md w-11 min-w-0 self-center px-2`}
                  isLoading={loading}
                >
                  {!loading && !isCodeValid && !isValidated && <IconSend size={32} />}
                  {isCodeValid && isValidated ? <IconCheck size={32} /> : !isCodeValid && isValidated && <IconX size={32} />}
                </Button>
              )}
            </motion.div>
          }
        />
      </div>

      {/* Animate error messages */}
      <AnimatePresence>
        {error && (
          <motion.p
            key="error-message"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-red-500 mt-2 max-w-60"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Animate success message */}
      <AnimatePresence>
        {isCodeValid && isValidated && (
          <motion.p
            key="success-message"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-success mt-2"
          >
            Promo code applied successfully
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromocodeInput;
