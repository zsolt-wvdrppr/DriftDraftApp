'use client';

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import { IconLifebuoyFilled } from "@tabler/icons-react";
import { motion } from "framer-motion";

export const StartTutorialButton = ({ setStartTutorial, className, ...props }) => {
  // Use two states - one for mounting and one for animation
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set mounted immediately on client-side
    setIsMounted(true);
    
    // Delay showing the button
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 1500); // Give extra time to ensure positioning is stable
    
    return () => clearTimeout(showTimer);
  }, []);

  // Skip rendering entirely if not mounted
  if (!isMounted) {
    return null;
  }

  const handleOnPress = () => {
    setStartTutorial(true);
    setTimeout(() => {
      setStartTutorial(false);
    }, 1000);
  }

  return (
    <div {...props} className="fixed top-100 right-0 z-50">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Button
            className={className || "transition-all duration-200 text-highlightOrange pt-4 pr-2 rounded-r-none rounded-t-none rounded-bl-full min-w-0"}
            onPress={handleOnPress}
            title="Start tutorial"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatType: "loop",
                delay: 0.3
              }}
            >
              <IconLifebuoyFilled size={24} />
            </motion.div>
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default StartTutorialButton;