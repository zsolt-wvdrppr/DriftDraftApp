import { useSessionContext } from "@/lib/SessionProvider";
import { Button, Card, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";

const SubscriptionAndTopup = () => {
  const { topUpCredits, allowanceCredits } = useSessionContext();
  const { isOpen: isPlanOpen, onOpen: onPlanOpen, onClose: onPlanClose } = useDisclosure();
  const { isOpen: isTopupOpen, onOpen: onTopupOpen, onClose: onTopupClose } = useDisclosure();

  return (
    <div className="pt-4 pb-8 max-w-sm mx-auto flex flex-col gap-4 items-strecth"> 
      
      <Card className="p-4 mb-4 grid grid-cols-2 gap-4 items-center">
        <p className="text-lg">Allowance Credits:</p><p className="text-lg text-right"><strong>{allowanceCredits}</strong></p>
        <p className="text-lg">Top-up Credits:</p><p className="text-lg text-right"><strong>{topUpCredits}</strong></p>
      </Card>

      <div className="flex gap-4 justify-between">
        <Button onPress={onPlanOpen} className="bg-blue-500 text-white w-36 font-semibold">Change Plan</Button>
        <Button onPress={onTopupOpen} className="bg-green-500 text-white w-36 font-semibold">Top-up Credits</Button>
      </div>

      {/* Plan Selection Modal */}
      <Modal isOpen={isPlanOpen} onClose={onPlanClose}>
        <ModalContent>
          <ModalHeader>Choose Your Plan</ModalHeader>
          <ModalBody>
            <p>Upgrade to Pro for more benefits.</p>
          </ModalBody>
          <ModalFooter>
            <Button onPress={onPlanClose} className="bg-gray-500 text-white">Cancel</Button>
            <Button className="bg-blue-500 text-white">Upgrade to Pro</Button>
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
            <Button onPress={onTopupClose} className="bg-gray-500 text-white">Cancel</Button>
            <Button className="bg-green-500 text-white">Confirm Top-up</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default SubscriptionAndTopup;
