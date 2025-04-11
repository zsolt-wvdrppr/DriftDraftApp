import { useState, useEffect } from "react";
import { Input, Button } from "@heroui/react";
import { toast } from "sonner";
import {
  IconCircleDashedCheck,
  IconProgressHelp,
  IconCopy,
  IconInfoCircle,
} from "@tabler/icons-react";

const validateDomain = (domain) => {
  // Remove protocol and www if present
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");

  // This regex allows for multiple TLD segments (like .co.uk, .com.au, etc.)
  const domainRegex = /^(?!-)(?:[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,}$/;

  return domainRegex.test(domain) ? domain : null;
};

const DomainChecker = () => {
  const [domain, setDomain] = useState("");
  const [checkedDomain, setCheckedDomain] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSelectedCopy = (content) => {
    navigator.clipboard.writeText(content);
    toast.dismiss();
    toast.success("Copied to clipboard", {
      duration: 2000,
      classNames: { toast: "text-green-600" },
    });
  };

  const handleCheckDomain = () => {
    const validatedDomain = validateDomain(domain);

    if (!validatedDomain) {
      toast.error(
        "Invalid domain! Please enter a valid domain name (e.g., example.com).",
        {
          duration: 3000,
        }
      );

      return;
    }

    setCheckedDomain(validatedDomain);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevents the parent form from submitting
      handleCheckDomain();
    }
  };

  useEffect(() => {
    if (!checkedDomain) return;

    const fetchDomainAvailability = async () => {
      setIsChecking(true);
      toast.info(`Checking availability of ${checkedDomain}...`, {
        id: "checking",
        duration: Infinity,
        classNames: { toast: "text-highlightPurple" },
      });

      try {
        const response = await fetch(
          `/api/domain-check?domain=${checkedDomain}`
        );

        if (!response.ok)
          throw new Error(`Error: ${response.status} ${response.statusText}`);

        const data = await response.json();

        setIsAvailable(data.isAvailable);
        setSuggestions(data.suggestions || []);
        setMessage(data.message || null);
      } catch (err) {
        setError(err.message);
        toast.error(
          `Error checking ${checkedDomain}: Invalid domain or network issue.`,
          {
            duration: 3000,
          }
        );
      } finally {
        setIsChecking(false);
        toast.dismiss("checking");
      }
    };

    fetchDomainAvailability();
  }, [checkedDomain]);

  useEffect(() => {
    // Handle .uk domain special case first
    if (isAvailable === null && message) {
      toast.dismiss();
      toast.custom(
        () => (
          <div className="flex flex-col p-4 bg-white shadow-lg rounded-md border">
            <div className="flex items-center gap-2">
            <IconInfoCircle className="text-primary" size={20} />
              <p className="text-md font-semibold text-primary">{message}</p>
            </div>
            <ul className="mt-2 list-disc pl-4 text-sm flex flex-col gap-y-2 py-4">
              {suggestions.map((s) => (
                <li key={s.domain} className="flex flex-row">
                  <Button
                    className="min-w-0 hover:scale-110 transition-all font-semibold text-secondary"
                    title="Copy domain name to clipboard"
                    onPress={() => handleSelectedCopy(s.domain)}
                  >
                    <IconCopy
                      className="text-primary dark:text-accent mx-1 cursor-copy"
                      size={16}
                    />
                    {s.domain}
                  </Button>
                </li>
              ))}
            </ul>
            <Button
              className="font-semibold self-end"
              color="primary"
              variant="bordered"
              onPress={() => toast.dismiss()}
            >
              Close
            </Button>
          </div>
        ),
        { duration: Infinity }
      );
    } 
    // Normal domain availability handling
    else if (isAvailable === true) {
      toast.success(`Good news! ${checkedDomain} is available!`, {
        duration: 10000,
        closeButton: true,
        classNames: { toast: "text-green-600" },
      });
    } else if (isAvailable === false) {
      toast.error(`Sorry, ${checkedDomain} is not available.`, {
        duration: 3000,
        classNames: { toast: "text-danger" },
      });

      if (suggestions.length > 0) {
        setTimeout(() => {
          toast.custom(
            () => (
              <div className="flex flex-col p-4 bg-white shadow-lg rounded-md border">
                <p className="text-md font-semibold">
                  We found similar domains that are available:
                </p>
                <ul className="mt-2 list-disc pl-4 text-sm flex flex-col gap-y-2 py-4">
                  {suggestions.map((s) => (
                    <li key={s.domain} className="flex flex-row">
                      <Button
                        className="min-w-0 hover:scale-110 transition-all font-semibold text-green-600"
                        title="Copy domain name to clipboard"
                        onPress={() => handleSelectedCopy(s.domain)}
                      >
                        <IconCopy
                          className="text-primary dark:text-accent mx-1 cursor-copy"
                          size={16}
                        />
                        {s.domain}
                        <IconCircleDashedCheck
                          size={16}
                          title="Available domain"
                        />
                      </Button>
                    </li>
                  ))}
                </ul>
                <Button
                  className="font-semibold self-end"
                  color="danger"
                  variant="bordered"
                  onPress={() => toast.dismiss()}
                >
                  Close
                </Button>
              </div>
            ),
            { duration: Infinity }
          );
        }, 1000);
      }
    }
  }, [isAvailable, suggestions, message, checkedDomain]);

  return (
    <Input
      className="pt-4"
      classNames={{
        label: "!text-primary dark:!text-accentMint",
        inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border pr-0`,
      }}
      endContent={
        <Button
          className="min-w-0 py-2 -mb-2 pr-2 h-13 text-warning rounded-md"
          title="Click to check domain availability"
          type="button"
          onPress={handleCheckDomain}
        >
          <IconProgressHelp size={34} />
        </Button>
      }
      label="Check domain availability"
      placeholder="Enter domain (e.g., example.com)"
      value={domain}
      onChange={(e) => setDomain(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
};

export default DomainChecker;