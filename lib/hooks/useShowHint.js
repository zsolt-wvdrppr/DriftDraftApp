"use client";

import React, { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@heroui/react";
import {
  IconCopy,
  IconSquareRoundedX,
  IconWorldQuestion,
  IconCircleDashedCheck,
  IconWorldCheck,
  IconWorldCancel,
} from "@tabler/icons-react";

import withColorCode from "lib/utils/with-color-dots";
import logger from "lib/logger";
import { checkDomainAvailability } from "@/lib/utils/checkDomainAvailability";

const CodeWithColor = withColorCode("code");
const LiWithColor = withColorCode("li");
const PWithColor = withColorCode("p");
const EMWithColor = withColorCode("em");
const StrongWithColor = withColorCode("strong");

export function useHintToast() {
  const [domainList, setDomainList] = useState({});
  const hintToastRef = useRef(null);
  const whyToastRef = useRef(null);

  const handleSelectedCopy = (content) => {
    navigator.clipboard.writeText(content);
    toast.dismiss();
    toast.success("Copied to clipboard", {
      duration: 2000,
      classNames: { toast: "text-green-600" },
    });
  };

  /* CHECKING DOMAIN PART */

  const getDomainPart = (url) => {
    const domain = url.replace(/(^\w+:|^)\/\//, "");
    logger.debug("domain", domain);
    logger.debug(domainList);
    return domain;
  };

  const handleCheckDomain = async (_url) => {
    const url = getDomainPart(_url);

    // Store toast ID to dismiss it later
    const checkingToastId = toast.info(`Checking availability of ${url}...`, {
      duration: Infinity, // Keep it until manually dismissed
      classNames: { toast: "text-highlightPurple" },
    });

    try {
      const { isAvailable, suggestions, error } =
        await checkDomainAvailability(url);

      // Dismiss "Checking availability" toast
      toast.dismiss(checkingToastId);

      if (error) {
        toast.error(`Error checking ${url}: ${error}`, {
          duration: 2000,
          classNames: { toast: "text-red-600" },
        });

        return;
      }

      // ✅ Use functional update to ensure the latest state is used
      setDomainList((prevList) => ({
        ...prevList,
        [url]: {
          available: isAvailable,
          suggestions: isAvailable ? [] : suggestions,
        },
      }));

      if (isAvailable) {
        toast.success(`Good news! ${url} is available`, {
          delay: 1000,
          duration: 2000,
          classNames: { toast: "text-green-600" },
        });
      } else {
        toast.error(`Sorry, ${url} is not available`, {
          delay: 1000,
          duration: 2000,
          classNames: { toast: "text-red-600" },
        });

        setTimeout(() => {
          if (suggestions && suggestions.length > 0) {
            toast.custom(
              () => (
                <div className="flex flex-col p-4 bg-white shadow-lg rounded-md border">
                  <p className="text-md font-semibold">
                    We found similar domains that are available:
                  </p>
                  <ul className="mt-2 list-disc pl-4 text-sm text-gray-700 flex flex-col gap-y-2 py-4">
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
              {
                duration: Infinity,
              }
            );
          }
        }, 3000);
      }
    } catch (err) {
      // Dismiss "Checking availability" toast
      toast.dismiss(checkingToastId);

      toast.error(`Unexpected error: ${err.message}`, {
        duration: 2000,
        classNames: { toast: "text-red-600" },
      });
    }

    logger.debug("domainList after update", domainList);
  };

  /* SHOW HINT TOAST */

  const showHintToast = (
    _hints,
    onCopySuccess,
    onDismiss,
    userMsg,
    copyToClipboard = null,
    checkDomain = false
  ) => {
    // Dismiss the existing hint toast if it exists
    if (hintToastRef.current) {
      //toast.dismiss(hintToastRef.current);
      hintToastRef.current = null;
    }

    // if ``` is present in the hints, remove it
    const hints = _hints.replace(/```/g, "");

    const handleCopyClick = () => {
      if (copyToClipboard) {
        copyToClipboard(hints);
        return;
      }
      // Copy hint to clipboard
      navigator.clipboard.writeText(hints);
      // Show success toast
      toast.success("Hints copied to clipboard", {
        duration: 2000,
        classNames: { toast: "text-green-600" },
      });
    };

    const newToastId = toast.custom(
      () => (
        <div className="p-4 shadow-lg rounded-lg bg-neutralSnow dark:bg-zinc-900 md:bg-neutralSnow/95 dark:md:bg-zinc-900 max-h-[90vh] overflow-y-auto select-text border">
          <h4 className="font-bold dark:text-neutralSnow">Hint</h4>
          <ReactMarkdown
            className="prose py-6 dark:text-slate-200"
            components={{
              a: ({ node, ...props }) => {
                const domainPart = getDomainPart(props.href);
                return (
                  <span className="relative flex flex-wrap">
                    <a {...props} rel="noopener noreferrer" target="_blank">
                      {props.children}
                    </a>
                    {checkDomain &&
                      !domainList[domainPart] && (
                        <IconWorldQuestion
                          className="text-highlightOrange mx-1 cursor-pointer animate-pulse"
                          size={16}
                          title="Check domain availability"
                          onClick={() => {
                            toast.dismiss();
                            handleCheckDomain(props.href);
                          }}
                        />
                      )}
                    {checkDomain &&
                      domainList[domainPart]?.available === true && (
                        <IconWorldCheck
                          className="text-green-500 mx-1 cursor-pointer"
                          size={16}
                          title="Available domain"
                          onClick={() => {
                            toast.dismiss();
                            handleCheckDomain(props.href);
                          }}
                        />
                      )}
                    {checkDomain &&
                      domainList[domainPart]?.available === false && (
                        <IconWorldCancel
                          className="text-danger mx-1 cursor-pointer"
                          size={16}
                          title="Unavailable domain"
                          onClick={() => {
                            toast.dismiss();
                            handleCheckDomain(props.href);
                          }}
                        />
                      )}
                    <IconCopy
                      className="text-primary dark:text-accent mx-1 cursor-copy"
                      size={16}
                      title="Copy domain name to clipboard"
                      onClick={() => handleSelectedCopy(props.href)}
                    />
                  </span>
                );
              },
              code: CodeWithColor, // Apply color dots inside <code> blocks
              li: LiWithColor, // Apply color dots inside list items
              p: PWithColor, // Apply color dots inside paragraphs
              em: EMWithColor, // Apply color dots inside <em> tags
              strong: StrongWithColor, // Apply color dots inside <strong> tags
            }}
          >
            {`${hints}`}
          </ReactMarkdown>
          {userMsg && <p className="text-sm pb-6 text-right">{userMsg}</p>}
          <div className="flex justify-between">
            <Button
              color="secondary"
              variant="bordered"
              onPress={() => {
                handleCopyClick();
                toast.dismiss(newToastId);
                onCopySuccess?.(); // Call optional onCopySuccess callback
              }}
            >
              <IconCopy size={20} />
              Copy
            </Button>
            <Button
              color="danger"
              variant="bordered"
              onPress={() => {
                toast.dismiss(newToastId);
                hintToastRef.current = null;
                onDismiss?.(); // Call optional onDismiss callback
              }}
            >
              <IconSquareRoundedX size={20} />
              Close
            </Button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        onDismiss: () => {
          hintToastRef.current = null;
          onDismiss?.(); // Call optional onDismiss callback
        },
      }
    );

    hintToastRef.current = newToastId;
  };

  const showWhyWeAskToast = (reason, onDismiss) => {
    // Dismiss the existing why toast if it exists
    if (whyToastRef.current) {
      //toast.dismiss(whyToastRef.current);
      whyToastRef.current = null;
    }

    const newToastId = toast.custom(
      () => (
        <div className="p-4 shadow-lg rounded-lg bg-neutralSnow dark:bg-zinc-900 md:bg-neutralSnow/95 dark:md:bg-zinc-900 max-h-[90vh] overflow-y-auto select-text">
          <ReactMarkdown className="prose">{reason}</ReactMarkdown>
          <div className="flex justify-end">
            <Button
              className="mt-4"
              color="danger"
              variant="bordered"
              onPress={() => {
                toast.dismiss();
                whyToastRef.current = null;
                onDismiss?.(); // Call optional onDismiss callback
              }}
            >
              <IconSquareRoundedX size={20} />
              Close
            </Button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        onDismiss: () => {
          whyToastRef.current = null;
          onDismiss?.(); // Call optional onDismiss callback
        },
      }
    );

    whyToastRef.current = newToastId;
  };

  return {
    showHintToast,
    showWhyWeAskToast,
    domainList,
  };
}