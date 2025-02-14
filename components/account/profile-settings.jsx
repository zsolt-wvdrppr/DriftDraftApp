import { useState, useEffect } from "react";
import { useUserProfile, useDeleteUser } from "@/lib/hooks/useProfile";
import { useAuth } from "@/lib/AuthContext";
import { Button, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { IconDeviceFloppy } from "@tabler/icons-react";

const ProfileSettings = () => {
  const { user, logout } = useAuth();
  const { fullName, loading, error, updateFullName } = useUserProfile(user?.id);
  const { deleteUser, loading: deleting, error: deleteError } = useDeleteUser();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [name, setName] = useState("");
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if (fullName) setName(fullName);
  }, [fullName]);

  const handleUpdate = async () => {
    if (name.trim() && name !== fullName) {
      await updateFullName(name);
      setIsChanged(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleUpdate();
    }
  };

  const confirmDelete = async () => {
    await logout();
    await deleteUser(user.id);
    onClose();
  };

  return (
    <div className="p-4 max-w-screen-lg mx-auto">
      <div className="flex items-center gap-2">
        <Input
          className="w-fit p-2 border rounded-md"
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setIsChanged(e.target.value !== fullName);
          }}
          onKeyDown={handleKeyDown}
          disabled={loading}
          endContent={
            isChanged && (
              <Button
                onPress={handleUpdate}
                className="bg-accent text-white rounded-md w-fit min-w-0"
                isLoading={loading}
              >
                <IconDeviceFloppy size={34} />
              </Button>
            )
          }
        />
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <Button
        onPress={onOpen}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
        disabled={deleting}
      >
        {deleting ? "Deleting..." : "Delete Account"}
      </Button>
      {deleteError && <p className="text-red-500 mt-2">{deleteError}</p>}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            Are you sure you want to delete your account? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button onPress={onClose} className="bg-gray-500 text-white">Cancel</Button>
            <Button onPress={confirmDelete} className="bg-red-600 text-white" isLoading={deleting}>
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProfileSettings;
