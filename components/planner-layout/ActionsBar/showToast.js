// DEPRECATED COMPONENT
// This component is not used in the current version of the application

"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@heroui/react";
import { IconCopy, IconSquareRoundedX, IconWorldQuestion } from "@tabler/icons-react";

import withColorCode from "lib/utils/with-color-dots";
import logger from "lib/logger";

const CodeWithColor = withColorCode("code");
const LiWithColor = withColorCode("li");
const PWithColor = withColorCode("p");
const EMWithColor = withColorCode("em");
const StrongWithColor = withColorCode("strong");

export const showHintToast = (
  _hints,
  hintToastRef,
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

  const handleSelectedCopy = (content) => {
    navigator.clipboard.writeText(content);
    toast.dismiss(newToastId);
    toast.success("Copied to clipboard", {
      duration: 2000,
      classNames: { toast: "text-green-600" },
    });
  };

  let domainList = {};

  const getDomainPart = (url) => {
    const domain = url.replace(/(^\w+:|^)\/\//, "");

    return domain;
  };

  // Create mock domain check
  const handleCheckDomain = (_url) => {
    // fliter out the domain name
    const url = getDomainPart(_url);

    // Mock domain check
    if (url.includes("kitease.com")) {
      domainList[url] = true;
      toast.success(`${url} is available`, {
        duration: 2000,
        classNames: { toast: "text-green-600" },
      });
    } else {
      domainList[url] = false;
      toast.error(`${url} is not available`, {
        duration: 2000,
        classNames: { toast: "text-red-600" },
      });
  };

  // log domainlist
  logger.debug("domainList", domainList);


};

  

  const newToastId = toast.custom(
    () => (
      <div className="p-4 shadow-lg rounded-lg bg-neutralSnow dark:bg-zinc-900 md:bg-neutralSnow/95 dark:md:bg-zinc-900 max-h-[90vh] overflow-y-auto select-text">
        <h4 className="font-bold dark:text-neutralSnow">Suggestion</h4>
        <div className="prose py-6 dark:text-slate-200">
        <ReactMarkdown
          components={{
            a: ({ node, ...props }) => (
              <span className="relative flex flex-wrap">
                <a {...props} rel="noopener noreferrer" target="_blank">
                  {props.children}
                </a>
                {checkDomain && domainList[getDomainPart(props.href)] === undefined && (
                  <IconWorldQuestion
                    className="text-warning mx-1 cursor-pointer"
                    size={16}
                    onClick={() => handleCheckDomain(props.href)}
                  />
                )}
                {checkDomain && domainList[getDomainPart(props.href)] === true && (
                  <IconWorldQuestion
                    className="text-green-500 mx-1 cursor-pointer"
                    size={16}
                    onClick={() => handleCheckDomain(props.href)}
                  />
                )}
                 {checkDomain && domainList[getDomainPart(props.href)] === false && (
                  <IconWorldQuestion
                    className="text-danger mx-1 cursor-pointer"
                    size={16}
                    onClick={() => handleCheckDomain(props.href)}
                  />
                )}
                <IconCopy
                  className="text-primary dark:text-accent mx-1 cursor-copy"
                  size={16}
                  onClick={() => handleSelectedCopy(props.href)}
                />

              </span>
            ),
            code: CodeWithColor, // Apply color dots inside <code> blocks
            li: LiWithColor, // Apply color dots inside list items
            p: PWithColor, // Apply color dots inside paragraphs
            em: EMWithColor, // Apply color dots inside <em> tags
            strong: StrongWithColor, // Apply color dots inside <strong> tags
          }}
        >
          {`${hints}`}
        </ReactMarkdown>
        </div>
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

export const showWhyWeAskToast = (reason, whyToastRef, onDismiss) => {
  // Dismiss the existing why toast if it exists
  if (whyToastRef.current) {
    //toast.dismiss(whyToastRef.current);
    whyToastRef.current = null;
  }

  const newToastId = toast.custom(
    () => (
      <div className="p-4 prose shadow-lg rounded-lg bg-neutralSnow dark:bg-zinc-900 md:bg-neutralSnow/95 dark:md:bg-zinc-900 max-h-[90vh] overflow-y-auto select-text">
        <ReactMarkdown>{reason}</ReactMarkdown>
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
