import { useState } from "react";
import { Input, Button } from "@heroui/react";
import logger from "@/lib/logger";
import { IconCheck, IconSend, IconX } from "@tabler/icons-react";
import { useAuth } from "@/lib/AuthContext";

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
        body: JSON.stringify({ userId: user?.id ,code: promoCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setIsCodeValid(false);
        setError(data.error || "Something went wrong");
      } else {
        setIsCodeValid(true);
        logger.info(
          `Promo code valid. Credits awarded: ${data.creditsAwarded}`
        );
        // Signal to the parent that the promo code has been applied successfully
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
      <div className="flex items-center gap-4">
        <Input
          className=""
          label="Enter Promo Code"
          type="text"
          value={promoCode}
          classNames={{
            label: "!text-primary dark:!text-accentMint",
            input: "dark:!text-white",
            inputWrapper: `bg-primary/10 dark:bg-content1 border focus-within:!bg-content1`,
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
            (isChanged || isCodeValid) && (
              <Button
                onPress={handleUpdate}
                className={`${loading ? "bg-lime-600" : isCodeValid ? "bg-success" : !isCodeValid && isValidated ? "bg-danger" : "bg-warning"} text-white rounded-md w-11 h-full min-w-0 self-center px-2`}
                isLoading={loading}
              >
                {!loading && !isCodeValid && !isValidated && (
                  <IconSend size={32} />
                )}
                {isCodeValid && isValidated ? (
                  <IconCheck size={32} />
                ) : (
                  !isCodeValid && isValidated && <IconX size={32} />
                )}
              </Button>
            )
          }
        />
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {isCodeValid && isValidated && (
        <p className="text-success mt-2">Promo code applied successfully</p>
      )}
    </div>
  );
};

export default PromocodeInput;
