"use client";

import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Button } from "@heroui/react";
import { useSearchParams } from "next/navigation";

import useToastSound from "@/lib/hooks/useToastSound";
import logger from "@/lib/logger";
import { useSessionContext } from "@/lib/SessionProvider";

import NewHintNotifierIcon from "./NewHintNotifierIcon";

const HintButton = ({
  hints: hint,
  handleToast,
  animationDuration = 500, // Animation duration in ms
}) => {
  const { sessionData, updateFormData } = useSessionContext();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [stepNumber, setStepNumber] = useState("unknown");

  const [newHintAvailable, setNewHintAvailable] = useState(false); // Track if new hint is available
  const [lastHint, setLastHint] = useState(""); // Last known hints
  const playSound = useToastSound();

  // Track mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only access searchParams after mounting
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      const step = searchParams.get("step") || "unknown";
      setStepNumber(step);

      // Set lastHint from sessionData
      const savedLastHint = sessionData?.formData?.[step]?.lastHint || "";
      setLastHint(savedLastHint);
    }
  }, [mounted, searchParams, sessionData]);

  const hintsChanged = useMemo(() => {
    logger.debug(`HintButton: hints=${hint}, lastHints=${lastHint}`);
    logger.debug(
      `HintButton: hintsChanged=${JSON.stringify(hint) !== JSON.stringify(lastHint)}`
    );
    if (!hint) return false;

    return JSON.stringify(hint) !== JSON.stringify(lastHint);
  }, [hint, lastHint]);

  // Detect hint changes and update state
  useEffect(() => {
    if (hintsChanged) {
      setNewHintAvailable(true);
      playSound();
    }
  }, [hint, sessionData]);

  const handleClick = () => {
    handleToast("hint");
    logger.debug("HintButton: handleClick");
    setNewHintAvailable(false);
    setLastHint(hint);
  };

  useEffect(() => {
    updateFormData("newHintAvailable", newHintAvailable);
  }, [newHintAvailable]);

  useEffect(() => {
    updateFormData("lastHint", lastHint);
  }, [lastHint]);

  return (
    <div className="flex flex-col justify-center items-center">
      <button
        aria-label="View AI Suggestion"
        className={`check-hint-btn ${!hint ? "cursor-not-allowed opacity-40 grayscale" : ""} relative inline-flex items-center justify-center p-0.5 me-2 overflow-hidden transition-all rounded-full duration-200 text-sm font-medium text-gray-900 group bg-gradient-to-br from-accentMint to-secondaryTeal group-hover:from-secondaryPersianGreen group-hover:to-blue-600 hover:text-white dark:text-white disabled:cursor-not-allowed focus:ring-4 focus:outline-none focus:ring-accentMint/20 dark:focus:ring-secondaryPersianGreen/55`}
        disabled={!hint}
        title={hint ? "View AI Suggestion" : "AI suggestion not available"}
        onClick={(e) => {
          e.preventDefault();
          handleClick();
        }}
      >
        <span className="relative transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-full group-hover:bg-transparent group-hover:dark:bg-transparent flex">
          <NewHintNotifierIcon
            className={
              "p-1 md:px-2.5 md:py-2.5 text-brandPink transition-colors duration-200 group-hover:text-white"
            }
            trigger={newHintAvailable}
          />
        </span>
      </button>
      <span className="hidden md:block text-sm mt-2 text-primary dark:text-slate-200">
        {hint ? "View Suggestion" : "Not Available"}
      </span>
    </div>
  );
};

HintButton.propTypes = {
  hints: PropTypes.bool.isRequired, // Whether hints are available
  handleToast: PropTypes.func.isRequired, // Function to handle the click
  animationDuration: PropTypes.number, // Duration of animations in ms
};

export default HintButton;
