import { useState, useEffect } from "react";
import { useUserProfile, useDeleteUser } from "@/lib/hooks/useProfile";
import { useAuth } from "@/lib/AuthContext";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { IconDeviceFloppy, IconHttpDeleteOff } from "@tabler/icons-react";

const ProfileSettings = () => {
  const { user, logout } = useAuth();
  const { fullName, email, loading, error, updateFullName } = useUserProfile(user?.id);
  const { deleteUser, loading: deleting, error: deleteError } = useDeleteUser();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [name, setName] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

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
    <div className="p-4 max-w-screen-lg mx-auto flex flex-col gap-10 max-w-screen-sm">
      <div className="flex items-center gap-4">
        <Input
          className=""
          label="Name"
          type="text"
          value={name}
          classNames={{
            label: "!text-primary dark:!text-accentMint",
            input: "dark:!text-white",
            inputWrapper: `dark:bg-content1 border focus-within:!bg-content1`,
          }}
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
                className="bg-accent text-white rounded-md w-fit h-full min-w-0 self-center px-2"
                isLoading={loading}
              >
                <IconDeviceFloppy size={32} />
              </Button>
            )
          }
        />
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <div className="flex flex-col items-center gap-4">
        <Input
          className=""
          label="Email Address"
          type="text"
          isDisabled={true}
          value={email || ""}
          classNames={{
            label: "!text-primary dark:!text-accentMint",
            input: "dark:!text-white",
            inputWrapper: `dark:bg-content1 border focus-within:!bg-content1`,
          }}
        />
        <p className="text-primary text-sm text-justify">If you need to change the email address you use to log in, please contact our support team.</p>
      </div>
      <Button
        onPress={onOpen}
        className="mt-4 px-4 py-2 text-red-600 rounded-md w-fit hover:bg-default-200 self-end"
        disabled={deleting}
        isLoading={deleting}
      >
        <IconHttpDeleteOff size={24} />
        {deleting ? "Deleting..." : "Delete Account"}
      </Button>
      {deleteError && <p className="text-red-500 mt-2">{deleteError}</p>}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Confirm Deletion</ModalHeader>
          <ModalBody>
            {"Are you sure you want to delete your account? "}
            <strong>{"This action cannot be undone."}</strong>
            <div className="mt-4">
              <Input
                label="Type DELETE to confirm"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full"
                classNames={{
                    label: "!text-primary dark:!text-accentMint",
                    input: "dark:!text-white",
                    inputWrapper: `dark:bg-content1 border focus-within:!bg-content1`,
                  }}
              />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onPress={onClose} className="bg-gray-500 text-white">
              Cancel
            </Button>
            <Button
              onPress={confirmDelete}
              className="bg-red-600 text-white"
              isLoading={deleting}
              isDisabled={deleteInput !== "DELETE"}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProfileSettings;
