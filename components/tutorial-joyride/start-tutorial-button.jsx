'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { IconFlagQuestion } from "@tabler/icons-react";

export const StartTutorialButton = ({ setStartTutorial, ...props }) => {
    const [showButton, setShowButton] = useState(false);
  
    useEffect(() => {
      if (typeof window === "undefined" || setStartTutorial === undefined) return;
  
      const timeout = setTimeout(() => {
        setShowButton(true);
      }, 1000); // Delay by 3 seconds
  
      return () => clearTimeout(timeout);
    }, []);
  
    if (!showButton) return null; // Hide button until timeout completes
  
    return (
      <div {...props}>
        <Button
          className="transition-all duration-200 text-highlightPink"
          onPress={() => setStartTutorial(true)}
          title="Start tutorial"
        >
          <IconFlagQuestion size={34} className="" />
        </Button>
      </div>
    );
  };

  export default StartTutorialButton;