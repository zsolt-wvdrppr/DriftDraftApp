"use client";

import React, { useState, useEffect } from "react";
import Joyride from "react-joyride";

import logger from "@/lib/logger";

export default function Tutorial({
  tutorialSteps,
  startTrigger = false,
  localStorageId,
}) {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const completed = localStorage.getItem(localStorageId);
    if (!completed) {
      setRun(true); // Auto-start if not completed
    }
  }, [localStorageId]);

  useEffect(() => {
    if (startTrigger) {
      setRun(true);
      setStepIndex(0);
    }
  }, [startTrigger]);

  const handleJoyrideCallback = (data) => {
    const { action, status, type, index } = data;

    if (["finished", "skipped"].includes(status)) {
      localStorage.setItem(localStorageId, "completed");
      setRun(false);
      setStepIndex(0);
    }

    // Log more detailed information for debugging
    logger.debug("Joyride Callback Data:", {
      action,
      status,
      type,
      index,
      totalSteps: tutorialSteps.length,
    });

    // Ensure step progression works correctly
    if (type === "step:after") {
      if (action === "next" && index < tutorialSteps.length - 1) {
        setStepIndex(index + 1);
      } else if (action === "prev" && index > 0) {
        setStepIndex(index - 1);
      }
    }
  };

  return (
      <Joyride
        steps={tutorialSteps}
        run={run}
        stepIndex={stepIndex} // Controlled mode
        callback={handleJoyrideCallback}
        spotlightClicks={true} // Allow interactions inside spotlight
        showProgress={true}
        showSkipButton={true}
        continuous={true}
        disableOverlayClose={true} // Prevent accidental closing
        styles={{
        options: {
          arrowColor: '#FF006E',
          backgroundColor: '#FFFCFF',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          primaryColor: '#FF006E',
          textColor: '#05668D',
        },
      }}
      />
  );
}

/*
 highlightYellow: '#FFBE0B',
        highlightOrange: '#FB5607',
        highlightPink: '#FF006E',
        highlightPurple: '#8338EC',
        highlightBlue: '#3A86FF',


        primary: '#05668D',
        secondary: '#028090',
        secondaryTeal: '#028090',
        secondaryPersianGreen: '#00A896',
        accent: '#02C39A',
        accentMint: '#02C39A',
        accentRed: '#E83151',
        neutralDark: '#2E0219',
        neutralCream: '#F0F3BD',
        neutral: '#FFFCFF',
        neutralSnow: '#FFFCFF',
        navbarColor: 'rgba(254,254,254,0.8)',
        neutralGray: '#C9C5CB',
        default: {
          100: '#fffcff',
        },
*/
