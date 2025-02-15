import { useState } from "react";
import { Input, Button } from "@heroui/react";
import logger from "@/lib/logger";
import { IconCheck, IconSend, IconX } from "@tabler/icons-react";

export const PromocodeInput = () => {
  const [promoCode, setPromoCode] = useState("");
  const [isChanged, setIsChanged] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCodeValid, setIsCodeValid] = useState(false);
    const [isValidated, setIsValidated] = useState(false);

  // Mock validatPromoCode function
  const validatePromoCode = async (promoCode) => {
    logger.info(`Validating promo code: ${promoCode}`);
    // Mock API call with timout
    setLoading(true);
    setIsValidated(false);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsCodeValid(true);
    setLoading(false);
    setIsValidated(true);
    return true;
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleUpdate();
    }
  };

  const handleUpdate = async () => {
    if (promoCode.trim()) {
      await validatePromoCode(promoCode);
      setIsChanged(false);
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
            inputWrapper: `dark:bg-content1 border focus-within:!bg-content1`,
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
            (isChanged  || isCodeValid) && (
              <Button
                onPress={handleUpdate}
                className={`${loading ? "bg-lime-600" : (isCodeValid) ? "bg-success" : (!isCodeValid && isValidated) ? "bg-danger" : "bg-warning"} text-white rounded-md w-11 h-full min-w-0 self-center px-2`}
                isLoading={loading}
              >
                {(!loading && !isCodeValid && !isValidated) && <IconSend size={32} />}
                {(isCodeValid && isValidated) ? (<IconCheck size={32} />) : ((!isCodeValid && isValidated) && <IconX size={32} />)}
              </Button>
            )
          }
        />
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default PromocodeInput;
