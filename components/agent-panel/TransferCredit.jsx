import { useState } from 'react'
import { useAddReferee } from '@/lib/hooks/useAddReferee'
import { useAuth } from '@/lib/AuthContext'
import { Input, Button, Form } from '@heroui/react'

const TransferCredit = () => {
    const { user } = useAuth();
    const userId = user?.id;
    const { addReferee, loading } = useAddReferee(userId);
    const [email, setEmail] = useState("");
    const [credits, setCredits] = useState("");
  
    const handleAllocate = (e) => {
      e.preventDefault();
  
      addReferee(email, credits);
      setEmail("");
      setCredits("");
    };
  
    return (
      <div className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Referral link"
            value="https://app.com/referral/agent123"
            readOnly
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "dark:!text-white",
              inputWrapper:
                "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
            }}
          />
          <Button variant="solid" color="secondary">
            Copy
          </Button>
        </div>
        <Form
          className="flex flex-row space-x-2"
          onSubmit={handleAllocate}
          validationBehavior="native"
        >
          <Input
            type="number"
            isRequired
            placeholder="Credits to allocate"
            min={5}
            value={credits}
            onChange={(e) => setCredits(parseInt(e.target.value, 10) || "")}
            onInvalid={(e) =>
              e.target.setCustomValidity("Minimum 5 credits required")
            }
            onInput={(e) => e.target.setCustomValidity("")} // Clear error on input
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
                "bg-primary/10 dark:bg-content1 border focus-within:!bg-content1",
            }}
          />
          <Button
            type="submit"
            variant="solid"
            color="primary"
            isLoading={loading}
          >
            {loading ? "" : "Allocate"}
          </Button>
        </Form>
      </div>
    );
  };

export default TransferCredit