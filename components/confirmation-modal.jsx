import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@heroui/react";

const ConfirmationModal = ({ isOpen, onClose, title, message, onConfirm, ...props }) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} {...props}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <p>{message}</p>
        </ModalBody>
        <ModalFooter>
          <Button onPress={onClose} variant="light">Cancel</Button>
          <Button onPress={onConfirm} color="primary">Confirm</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationModal;
