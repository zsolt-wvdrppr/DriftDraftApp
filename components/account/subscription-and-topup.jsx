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
import { IconStack, IconStack2, IconStack3 } from "@tabler/icons-react";

import logger from "@/lib/logger";
import PromocodeInput from "./promocode_input";

const plans = [
  {
    key: "starter",
    label: "Starter",
    description: "20 credits per month",
    price: 3,
  },
  { key: "pro", label: "Pro", description: "100 credits per month", price: 10 },
  {
    key: "agency",
    label: "Agency",
    description: "200 credits per month",
    price: 20,
  },
];

const SubscriptionAndTopup = () => {
  const [selectedPlan, setSelectedPlan] = useState(new Set([]));

  useEffect(() => {
    logger.debug("selected Plan", selectedPlan);
  }, [selectedPlan]);

  const { topUpCredits, allowanceCredits } = useSessionContext();
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
    pro: <IconStack2 size={24} className="text-highlightBlue" />,
    agency: <IconStack3 size={24} className="text-highlightPurple" />,
  };

  return (
    <div className="pt-4 pb-8 max-w-sm mx-auto flex flex-col gap-4 items-strecth">
      <Card className="p-4 mb-4 grid grid-cols-2 gap-4 items-center">
        <p className="text-lg">Allowance Credits:</p>
        <p className="text-lg text-right">
          <strong>{allowanceCredits}</strong>
        </p>
        <p className="text-lg">Top-up Credits:</p>
        <p className="text-lg text-right">
          <strong>{topUpCredits}</strong>
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

      <PromocodeInput />

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
                  {
                    <div className="flex items-center gap-4 border-b-1 pb-3 border-default-200 dark:border-default-200">
                      {icons[plan.key]}{" "}
                      <div className="flex flex-col justify-between">
                        <p className="font-semibold">{plan.label}</p>
                        <p>{plan.description}</p>
                        <p>£{plan.price}/month</p>
                      </div>
                    </div>
                  }
                </SelectItem>
              )}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button onPress={onPlanClose} className="bg-gray-500 text-white">
              Cancel
            </Button>
            <Button className="bg-blue-500 text-white w-44 font-semibold">
              {"Upgrade"}
              {selectedPlan.size === 0 ? (
                ""
              ) : (
                <span className="-ml-1">
                  {"to "}<span className="capitalize">{selectedPlan.currentKey}</span>
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
