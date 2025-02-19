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

export const CancelSubscriptionModal = ({ isOpen, onClose, onConfirm, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <h2 className="text-lg font-semibold text-primary">Cancel Subscription</h2>
        </ModalHeader>
        <ModalBody>
          <p className="text-md text-neutralDark">
            Are you sure you want to cancel your subscription? Your plan will remain active until the end of the billing cycle.
          </p>
        </ModalBody>
        <ModalFooter className="flex justify-end gap-4">
          <Button onPress={onClose} className="font-semibold" color="primary">
            Keep Plan
          </Button>
          <Button onPress={onConfirm} color="danger" className="font-semibold" isLoading={loading}>
            Yes, Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CancelSubscriptionModal;
