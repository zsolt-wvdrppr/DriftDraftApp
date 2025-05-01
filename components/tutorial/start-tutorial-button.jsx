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
    setStartTutorial(false);

    setTimeout(() => {
    setStartTutorial(true);
  }, 10);
  }

  return (
    <div {...props} className="fixed top-100 right-2 z-50 rounded-full backdrop-blur-sm flex items-center justify-center bg-secondary/10">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <Button
            className={className || "transition-all flex items-center justify-center duration-200 px-0 py-0 text-highlightOrange min-h-0 h-fit w-fit min-w-0"}
            onPress={handleOnPress}
            title="Start tutorial"
          >
            <motion.div
              animate={{ y: [0, -4, 0] }}
              className="flex items-center justify-center"
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatType: "loop",
                delay: 0.3
              }}
            >
              <IconLifebuoyFilled size={24} className="-mb-1"/>
            </motion.div>
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default StartTutorialButton;