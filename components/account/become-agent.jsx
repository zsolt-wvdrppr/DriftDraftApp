import { useState, useEffect } from "react";
import { Input, Button, Spinner } from "@heroui/react";
import logger from "@/lib/logger";
import {
  IconCheck,
  IconSend,
  IconX,
  IconDeviceFloppy,
} from "@tabler/icons-react";
import { useAuth } from "@/lib/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useReferralName } from "@/lib/hooks/useReferralName";
import ConfirmationModal from "@/components/confirmation-modal";
import { useAgentEligibility } from "@/lib/hooks/useAgentEligibility";

export const BecomeAgentInput = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const {
    referralName,
    fetchReferralName,
    checkReferralNameAvailability,
    updateReferralName,
    isAvailable,
    loading,
    error,
    isUpdated,
    setReferralName,
  } = useReferralName(userId);
  const [newReferralName, setNewReferralName] = useState(referralName);
  const [isChanged, setIsChanged] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [readyToCheckAvilability, setReadyToCheckAvilability] = useState(false);
  const [isNameAvailable, setIsNameAvailable] = useState(false);
  const [isNameUpdated, setIsNameUpdated] = useState(false);
  const {
    isEligible,
    checkEligibility,
    loading: loadingCheck,
  } = useAgentEligibility();

  useEffect(() => {
    setNewReferralName(referralName || "");
  }, [referralName]);

  const handleBlur = () => {
    // ✅ Only check availability if the name actually changed
    if (isChanged && newReferralName.length >= 5) {
      setReadyToCheckAvilability(true);
    }
  };

  const handleNameUpdate = () => {
    setShowConfirmation(true);
  };

  const handleNameAvailabilityCheck = async () => {
    const result = await checkReferralNameAvailability(newReferralName);
    setIsNameUpdated(false);
    setIsNameAvailable(result);
  };

  const handleConfirmChange = async () => {
    const result = await updateReferralName(newReferralName);
    setShowConfirmation(false);
    setIsNameUpdated(result);
  };

  useEffect(() => {
    if (!isAgentMode) return;

    const handleCheckEligibility = async () => {
      await checkEligibility();
    };

    handleCheckEligibility();
  }, [isAgentMode]);

  const handleAgentNameChange = async (e) => {
    const value = e.target.value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, "") // Remove non-alphanumeric and non-hyphen characters
      .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens

    setNewReferralName(value);
    if (e.target.value.length >= 5) {
      setReadyToCheckAvilability(true);
    }
    setIsChanged(true);
    setIsNameUpdated(false);
    setIsNameAvailable(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Button
        color={"primary"}
        className="min-w-32"
        onPress={() => setIsAgentMode(!isAgentMode)}
      >
        {isAgentMode ? "Hide" : "Agent Mode"}
      </Button>
      <AnimatePresence>
        {isAgentMode && loadingCheck && (
          <motion.div
            className="flex gap-4 flex-col"
            key="agent-eligibility"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <Spinner />
          </motion.div>
        )}
        {isAgentMode && !isEligible && !loadingCheck && (
          <motion.div
            className="flex gap-4 flex-col"
            key="agent-eligibility"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg">Become an agent</h3>
            <p className="text-justify">{`You are currently not eligible to become an agent. To be eligible, you must have a payment method, and a subscription or a minimum of 10 top-up credits in your account.`}</p>
          </motion.div>
        )}
        {isAgentMode && isEligible && !loadingCheck && (
          <motion.div
            className="flex gap-4 flex-col"
            key="agent-dashboard"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
          >
            {referralName && (
              <>
                <h3 className="text-lg">Agent Panel</h3>
                <p className="text-justify">{`Welcome, ${referralName}! You can change your referral name below.`}</p>
              </>
            )}
            {!referralName && (
              <>
                <h3 className="text-lg">Become an agent</h3>
                <p className="text-justify">{`Set a unique agent name to get started. As an agent, you can invite users to connect with you and view their AI-generated plans in the agent panel below. Your agent name must be unique and will be used for referrals.`}</p>
              </>
            )}
            <Input
              label="Your Agent Name"
              type="text"
              value={newReferralName}
              classNames={{
                label: "text-primary dark:text-accentMint",
                input: "dark:text-white",
                inputWrapper:
                  "bg-primary/10 dark:bg-default-200/50 border dark:border-default-200 focus-within:!bg-content1",
              }}
              onChange={handleAgentNameChange}
              onBlur={handleBlur}
              disabled={loading}
              endContent={
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center h-full pt-0.5"
                >
                  {}
                  {readyToCheckAvilability &&
                    isChanged &&
                    !isNameUpdated &&
                    !isNameAvailable && (
                      <Button
                        isDisabled={!readyToCheckAvilability}
                        isLoading={loading}
                        onPress={handleNameAvailabilityCheck}
                        className="bg-warning text-white rounded-md min-w-0 self-center px-2"
                      >
                        <IconCheck size={32} />
                      </Button>
                    )}
                  {!isNameUpdated && isNameAvailable && (
                    <Button
                      isLoading={loading}
                      onPress={handleNameUpdate}
                      className="bg-success text-white rounded-md min-w-0 self-center px-2"
                    >
                      <IconDeviceFloppy size={32} />
                    </Button>
                  )}
                </motion.div>
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
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

      <AnimatePresence>
        {isNameUpdated ? (
          <motion.p
            key="updated-message"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-success mt-2"
          >
            ✅ Your agent name has been successfully updated!
          </motion.p>
        ) : (
          !isNameUpdated &&
          isNameAvailable && (
            <motion.p
              key="success-message"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-success mt-2"
            >
              ✅ This agent name is available! Click the button to save.
            </motion.p>
          )
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Confirm Name Change"
        message="Changing your agent name will update it for all referrals. Are you sure?"
        onConfirm={handleConfirmChange}
      />
    </motion.div>
  );
};

export default BecomeAgentInput;
