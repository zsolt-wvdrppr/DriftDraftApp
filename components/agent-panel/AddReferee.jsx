import { Button, Input, Form, Textarea, Divider } from "@heroui/react";
import { useState } from "react";
import { useAddReferee } from "@/lib/hooks/useAddReferee";
import { useAuth } from "@/lib/AuthContext";
import { IconCopy, IconSend } from "@tabler/icons-react";
import logger from "@/lib/logger";
import { toast } from "sonner";
import { useReferralName } from "@/lib/hooks/useReferralName";

const AddReferee = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { referralName } = useReferralName(userId);
  const { addReferee, loading } = useAddReferee(userId);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Mock up email invitation
  const handleInvite = async (e) => {
    e.preventDefault();
    logger.info("Inviting", email);
    const invite = await addReferee(email, message);
    logger.info("Invite sent", invite);
    setEmail("");
  };

  // get url from env var
  const url = process.env.URL;

  const handleCopy = (agentId = 1234) => {
    navigator.clipboard.writeText(`https://driftdraft.app/signup?redirect=?referral/${referralName}`);
    toast.success("Referral link copied to clipboard", {classNames: { toast: "text-green-800"}});
  };

  return (
    <div className="space-y-4 flex flex-col justify-center items-center w-full">
      <div className="space-y-4 md:w-1/2">
        <div className="flex flex-row">
          <Input
            type="text"
            placeholder="Referral link"
            value={`https://driftdraft.app/signup?redirect=?referral/${referralName}`}
            readOnly
            endContent={
              <Button className="min-w-0" color="secondary" onPress={handleCopy}>
                <IconCopy size={24} />
              </Button>
            }
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "dark:!text-white",
              inputWrapper:
                "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1 pr-0",
            }}
          />
        </div>
        <Divider/>
        <h3 className="text-primary">Invite via email</h3>
        <Form
          className="flex"
          onSubmit={handleInvite}
          validationBehavior="native"
        >
          <Textarea
            placeholder="Personal message (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
            placeholder="Referee's email"
            endContent={
              <Button
                type="submit"
                variant="solid"
                className="min-w-0"
                color="primary"
                isLoading={loading}
              >
                {loading ? "" : <IconSend size={24} />}
              </Button>
            }
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
                "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1 pr-0",
            }}
          />
        </Form>
      </div>
    </div>
  );
};

export default AddReferee;
