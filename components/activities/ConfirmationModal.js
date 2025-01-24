import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";

const ConfirmationModal = ({
    isOpen,
    onOpenChange,
    handleAccept,
    title = "Modal title",
    body = "Modal body",
    rejectLabel = "Cancel",
    acceptLabel = "Confirm",
    isLoading = false
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {title}
              </ModalHeader>
              <ModalBody>
                {body}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {rejectLabel}
                </Button>
                <Button color="primary" isLoading={isLoading} onPress={handleAccept}>
                  {acceptLabel}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
  )
}

export default ConfirmationModal