"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/react";
import { IconLifebuoyFilled } from "@tabler/icons-react";
import { motion } from "framer-motion";

/**
 * A custom hook that provides a tutorial button and control mechanism
 * 
 * @param {Object} options - Configuration options
 * @param {string} [options.className] - Custom class for the button
 * @param {number} [options.delayMs=1500] - Delay in ms before showing the button
 * @param {string} [options.buttonTitle="Start tutorial"] - Button title attribute
 * @param {Function} [options.onPress] - Additional callback when button is pressed
 * @returns {[JSX.Element, { trigger: Function, isVisible: boolean }]} 
 *          Returns the button element and a control object
 */
export const useTutorialButton = (options = {}) => {
  const {
    className,
    delayMs = 1500,
    buttonTitle = "Start tutorial",
    onPress: onPressCallback,
    ...otherProps
  } = options;

  // State for button visibility
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Ref to store the tutorial trigger function
  const tutorialTriggerRef = useRef(null);

  // Effect to handle mounting and visibility delay
  useEffect(() => {
    // Set mounted immediately on client-side
    setIsMounted(true);

    // Delay showing the button
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(showTimer);
  }, [delayMs]);

  // Handle button press
  const handleOnPress = () => {
    // Call the tutorial trigger function if available
    if (tutorialTriggerRef.current) {
      tutorialTriggerRef.current();
    }
    
    // Call additional callback if provided
    if (onPressCallback) {
      onPressCallback();
    }
  };

  // Function to register the tutorial trigger
  const setTutorialTrigger = (triggerFn) => {
    tutorialTriggerRef.current = triggerFn;
  };

  // Manual trigger function to expose
  const triggerTutorial = (options) => {
    if (tutorialTriggerRef.current) {
      tutorialTriggerRef.current(options);
    }
  };

  // The button component
  const TutorialButton = (
    <div {...otherProps} className="fixed top-100 right-0 z-50">
      {isMounted && isVisible && (
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.7 }}
        >
          <Button
            className={
              className ||
              "transition-all duration-200 text-highlightOrange pt-4 pr-2 rounded-r-none rounded-t-none rounded-bl-full min-w-0"
            }
            title={buttonTitle}
            onPress={handleOnPress}
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop",
                delay: 0.3,
              }}
            >
              <IconLifebuoyFilled size={24} />
            </motion.div>
          </Button>
        </motion.div>
      )}
    </div>
  );

  // Return both the button component and the control object
  return [
    TutorialButton,
    {
      trigger: triggerTutorial,
      setTrigger: setTutorialTrigger,
      isVisible,
      show: () => setIsVisible(true),
      hide: () => setIsVisible(false)
    }
  ];
};

export default useTutorialButton;