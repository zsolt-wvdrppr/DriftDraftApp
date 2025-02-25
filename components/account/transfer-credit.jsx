import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Input, Button, Form } from "@heroui/react";
import ConfirmationModal from "@/components/confirmation-modal";
import { useCreditTransfer } from "@/lib/hooks/useCreditTransfer";
import { toast } from "sonner";
import { useToastSound } from "@/lib/hooks/useToastSound";
import { IconSend } from "@tabler/icons-react";
import { Tooltip } from "react-tooltip";

const TransferCredit = ({ onSuccess, isDisabled }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const { doTransfer, message, error, loading } = useCreditTransfer();
  const [email, setEmail] = useState("");
  const [credits, setCredits] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const play = useToastSound();

  // Show toast message if there's a message
  useEffect(() => {
    if (message) {
      toast.success(message, {
        duration: 20000,
        position: "top-center",
        closeButton: true,
        classNames: { toast: "text-green-800", title: "text-md font-semibold" },
        onOpen: play(),
      });
    }
    if (error) {
      toast.error(error, {
        duration: 20000,
        position: "top-center",
        closeButton: true,
        classNames: { toast: "text-danger", title: "text-md font-semibold" },
        onOpen: play(),
      });
    }
  }, [message, error]);

  const handleConfirmChange = () => {
    setShowConfirmation(false);
    handleTransfer();
  };

  const handleTransfer = () => {
    if (!email || !credits) return;

    const toDoTransfer = async () => {
      await doTransfer(credits, email);

      setEmail("");
      setCredits("");
      onSuccess();
    };

    toDoTransfer();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <h3 className="text-lg text-primary font-semibold">
          Transfer credits to another user
        </h3>
      </div>
      <Form
        id="transfer-credit-form"
        className="flex md:flex-row gap-6 items-baseline"
        onSubmit={handleSubmit}
        validationBehavior="native"
      >
        <div className="flex flex-col md:flex-row flex-grow gap-4 w-full">
          <Input
            type="number"
            label="Amount"
            isRequired
            isDisabled={isDisabled}
            className="flex-grow md:max-w-24"
            placeholder="eg.: 50"
            min={1}
            value={credits}
            onChange={(e) => setCredits(parseInt(e.target.value, 10) || "")}
            onInvalid={(e) =>
              e.target.setCustomValidity("Minimum 1 credits required")
            }
            onInput={(e) => e.target.setCustomValidity("")} // Clear error on input
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "dark:!text-white",
              inputWrapper:
                "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
            }}
          />
          <Input
            type="email"
            isRequired
            isDisabled={isDisabled}
            label="Recipient's Email"
            placeholder="johndoe@mail.com"
            className="flex-grow"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onInvalid={(e) =>
              e.target.setCustomValidity("Please enter a valid email")
            }
            onInput={(e) => e.target.setCustomValidity("")} // Clear error on input
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "dark:!text-white",
              inputWrapper:
                "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
            }}
          />
        </div>

        <Button
          type="submit"
          variant="solid"
          isDisabled={isDisabled}
          color="warning"
          className="flex items-center gap-x-4 flex-grow min-w-fit w-full md:max-w-fit font-semibold min-h-full max-h-auto"
          isLoading={loading}
        >
          {loading ? "" : "Send"}
          <IconSend size={24} className="min-w-fit" />
        </Button>
      </Form>
      {isDisabled && (
        <Tooltip anchorSelect="#transfer-credit-form" place="top">
          <span className="text-amber-300">
            You don't have sufficient top-up credits to transfer.
          </span>
        </Tooltip>
      )}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Confirm Credit Transfer"
        message={
          <span>
            {`Are you sure you want to transfer `}
            <strong>{credits}</strong>
            {` ${credits > 1 ? "credits" : "credit"} to `}
            <strong>{email}</strong>
            {`?`}
          </span>
        }
        onConfirm={handleConfirmChange}
      />
    </div>
  );
};

export default TransferCredit;
