import { useState, useEffect } from "react";
import { useSessionContext } from "@/lib/SessionProvider";
import {
  Button,
  Card,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
  SelectItem,
} from "@heroui/react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import logger from "@/lib/logger";
import PromocodeInput from "./promocode_input";
import usePlanTiers from "@/lib/hooks/usePlanTiers";
import { IconStack, IconStack2, IconStack3 } from "@tabler/icons-react";

// AnimatedNumber component to animate numeric changes
const AnimatedNumber = ({ value }) => {
  const motionValue = useMotionValue(value);
  const springValue = useSpring(motionValue, { stiffness: 100, damping: 20 });
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // When the value changes, update the motion value
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    // Subscribe to changes on the spring and update the display value (rounded)
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return <span>{displayValue}</span>;
};

const SubscriptionAndTopup = () => {
  const { planTiers: plans, loading, error } = usePlanTiers();
  const [selectedPlan, setSelectedPlan] = useState(new Set([]));

  useEffect(() => {
    logger.debug("selected Plan", selectedPlan);
  }, [selectedPlan]);

  // Assumes that your session context now includes a refreshCredits function
  const { topUpCredits, allowanceCredits, refreshCredits } = useSessionContext();

  const {
    isOpen: isPlanOpen,
    onOpen: onPlanOpen,
    onClose: onPlanClose,
  } = useDisclosure();
  const {
    isOpen: isTopupOpen,
    onOpen: onTopupOpen,
    onClose: onTopupClose,
  } = useDisclosure();

  const icons = {
    starter: <IconStack size={24} className="text-highlightOrange" />,
    advanced: <IconStack2 size={24} className="text-highlightBlue" />,
    pro: <IconStack3 size={24} className="text-highlightPurple" />,
  };

  // Callback to handle promo code application
  const handlePromoApplied = (data) => {
    logger.info("Promo code applied, refreshing credits", data);
    // Refresh the credits from the session context so that the new balances are fetched
    refreshCredits();
  };

  return (
    <div className="pt-4 pb-8 max-w-sm mx-auto flex flex-col gap-4 items-stretch">
      <Card className="p-4 mb-4 grid grid-cols-2 gap-4 items-center">
        <p className="text-lg">Allowance Credits:</p>
        <p className="text-lg text-right text-secondary">
          <strong>
            <AnimatedNumber value={allowanceCredits} />
          </strong>
        </p>
        <p className="text-lg">Top-up Credits:</p>
        <p className="text-lg text-right text-primary">
          <strong>
            <AnimatedNumber value={topUpCredits} />
          </strong>
        </p>
      </Card>

      <div className="flex gap-4 justify-between">
        <Button
          onPress={onPlanOpen}
          className="bg-blue-500 text-white w-36 font-semibold"
        >
          Change Plan
        </Button>
        <Button
          onPress={onTopupOpen}
          className="bg-green-500 text-white w-36 font-semibold"
        >
          Top-up Credits
        </Button>
      </div>

      {/* Pass the promo code applied callback to the PromocodeInput component */}
      <PromocodeInput onPromoCodeApplied={handlePromoApplied} />

      {/* Plan Selection Modal */}
      <Modal isOpen={isPlanOpen} onClose={onPlanClose}>
        <ModalContent>
          <ModalHeader>Choose Your Plan</ModalHeader>
          <ModalBody>
            <Select
              aria-label="Select a plan"
              variant="underlined"
              items={plans}
              isMultiline={true}
              placeholder="Select a plan"
              classNames={{
                trigger: "min-h-24",
              }}
              onSelectionChange={setSelectedPlan}
              renderValue={(items) => {
                // Map the selected keys back to the full plan objects
                const selectedPlans = items.map((item) =>
                  plans.find((plan) => plan.key === item.key)
                );

                return selectedPlans.map((plan) => (
                  <div key={plan.key} className="flex items-center gap-4">
                    {icons[plan.key]}{" "}
                    <div className="flex flex-col justify-between">
                      <p className="font-semibold">{plan.label}</p>
                      <p>{plan.description}</p>
                      <p>£{plan.price}/month</p>
                    </div>
                  </div>
                ));
              }}
            >
              {(plan) => (
                <SelectItem key={plan.key} aria-label={plan.label}>
                  <div className="flex items-center gap-4 border-b-1 pb-3 border-default-200 dark:border-default-200">
                    {icons[plan.key]}{" "}
                    <div className="flex flex-col justify-between">
                      <p className="font-semibold">{plan.label}</p>
                      <p>{plan.description}</p>
                      <p>£{plan.price}/month</p>
                    </div>
                  </div>
                </SelectItem>
              )}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button onPress={onPlanClose} className="bg-gray-500 text-white">
              Cancel
            </Button>
            <Button className="bg-blue-500 text-white w-44 font-semibold">
              Upgrade
              {selectedPlan.size === 0 ? (
                ""
              ) : (
                <span className="-ml-1">
                  to <span className="capitalize">{selectedPlan.currentKey}</span>
                </span>
              )}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Top-up Credits Modal */}
      <Modal isOpen={isTopupOpen} onClose={onTopupClose}>
        <ModalContent>
          <ModalHeader>Top-up Credits</ModalHeader>
          <ModalBody>
            <p>Select a top-up amount.</p>
          </ModalBody>
          <ModalFooter>
            <Button onPress={onTopupClose} className="bg-gray-500 text-white">
              Cancel
            </Button>
            <Button className="bg-green-500 text-white">Confirm Top-up</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SubscriptionAndTopup;
