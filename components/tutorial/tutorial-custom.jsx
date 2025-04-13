"use client";

import { useState, useEffect, useRef, use } from "react";
import { Button } from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import logger from "@/lib/logger";
import { saveUserPreference } from "@/lib/utils/utils";

export default function Tutorial({
  tutorialSteps,
  localStorageId,
  startTrigger = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0, placement: "bottom" });
  const tooltipRef = useRef(null);
  const overlayRef = useRef(null);
  const targetRef = useRef(null);
  const [initialRenderComplete, setInitialRenderComplete] = useState(false);

  // log if startTrigger changes
  useEffect(() => {
    logger.info("startTrigger changed", { startTrigger });
  }, [startTrigger]);

  const checkIfTutorialCompleted = () => {
    const tutorialCompleted =
      localStorage.getItem(localStorageId) === "completed" || sessionStorage.getItem(localStorageId) === "completed";
    if ((!tutorialCompleted || startTrigger) && isOpen === false) {
      // First set a timer to open the tutorial
      const timer = setTimeout(() => {
        // When opening, don't show the tooltip yet
        setIsOpen(true);
        // Give time for initial positioning before showing
        setTimeout(() => {
          setInitialRenderComplete(true);
        }, 1000); // Wait a bit longer than your positioning timeout
      }, 100);
      return () => clearTimeout(timer);
    }
  };

  // Check if tutorial has been completed
  useEffect(() => {
    if (isOpen) return;
    checkIfTutorialCompleted();
  }, [startTrigger, localStorageId]);

  // Create spotlight overlay
  function createOverlay(target) {
    // Remove existing overlay
    if (overlayRef.current && document.body.contains(overlayRef.current)) {
      document.body.removeChild(overlayRef.current);
    }

    // Create new overlay
    const overlay = document.createElement("div");
    overlay.classList.add("tour-overlay");

    const rect = target.getBoundingClientRect();
    Object.assign(overlay.style, {
      position: "fixed",
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      border: "3px solid #3b82f6",
      boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
      zIndex: 9998,
      borderRadius: "4px",
      pointerEvents: "none",
      transition: "all 0.15s ease",
    });

    document.body.appendChild(overlay);
    overlayRef.current = overlay;
  }

  // Position tooltip with beacon precisely at border
  function positionTooltip() {
    if (!targetRef.current || !tooltipRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // Window dimensions
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Arrow size for positioning (size of the beacon/arrow)
    const arrowSize = 8; // Based on border-*-8 classes

    // Choose best placement that doesn't overlap the target
    let bestPlacement = "bottom";
    let x = 0;
    let y = 0;

    // Check which position would work best
    const spaceBelow = windowHeight - targetRect.bottom;
    const spaceAbove = targetRect.top;
    const spaceRight = windowWidth - targetRect.right;
    const spaceLeft = targetRect.left;

    // Calculate positions for each placement
    const positions = {
      bottom: {
        x: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
        y: targetRect.bottom + arrowSize, // Position so arrow touches border
        fits: spaceBelow >= tooltipRect.height + arrowSize,
      },
      top: {
        x: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
        y: targetRect.top - tooltipRect.height - arrowSize,
        fits: spaceAbove >= tooltipRect.height + arrowSize,
      },
      right: {
        x: targetRect.right + arrowSize,
        y: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
        fits: spaceRight >= tooltipRect.width + arrowSize,
      },
      left: {
        x: targetRect.left - tooltipRect.width - arrowSize,
        y: targetRect.top + targetRect.height / 2 - tooltipRect.height / 2,
        fits: spaceLeft >= tooltipRect.width + arrowSize,
      },
    };

    // Try to use position in this order if they fit
    const placementOrder = ["bottom", "top", "right", "left"];

    // Find first position that fits
    const fittingPlacement = placementOrder.find((p) => positions[p].fits);

    if (fittingPlacement) {
      bestPlacement = fittingPlacement;
      x = positions[bestPlacement].x;
      y = positions[bestPlacement].y;
    } else {
      // If no position fits perfectly, use the one with most space
      const spaces = {
        bottom: spaceBelow,
        top: spaceAbove,
        right: spaceRight,
        left: spaceLeft,
      };

      bestPlacement = Object.keys(spaces).reduce((a, b) =>
        spaces[a] > spaces[b] ? a : b
      );
      x = positions[bestPlacement].x;
      y = positions[bestPlacement].y;
    }

    // Ensure tooltip stays within viewport
    if (x < 10) x = 10;
    if (x + tooltipRect.width > windowWidth - 10)
      x = windowWidth - tooltipRect.width - 10;
    if (y < 10) y = 10;
    if (y + tooltipRect.height > windowHeight - 10)
      y = windowHeight - tooltipRect.height - 10;

    // Check if our adjustments would cause the arrow to not align with the target
    const finalTooltipRect = {
      left: x,
      right: x + tooltipRect.width,
      top: y,
      bottom: y + tooltipRect.height,
    };

    // Does this tooltip position overlap with the target?
    const overlaps = !(
      finalTooltipRect.left > targetRect.right ||
      finalTooltipRect.right < targetRect.left ||
      finalTooltipRect.top > targetRect.bottom ||
      finalTooltipRect.bottom < targetRect.top
    );

    // If there's overlap, force a position away from the target
    if (overlaps) {
      // Find the best non-overlapping corner
      if (spaceBelow > tooltipRect.height + 10) {
        bestPlacement = "bottom";
        y = targetRect.bottom + arrowSize;
        x = (windowWidth - tooltipRect.width) / 2; // Center horizontally
      } else if (spaceRight > tooltipRect.width + 10) {
        bestPlacement = "right";
        x = targetRect.right + arrowSize;
        y = 10; // Top of screen
      } else {
        // Last resort - bottom right corner
        bestPlacement = "bottom";
        x = windowWidth - tooltipRect.width - 10;
        y = windowHeight - tooltipRect.height - 10;
      }
    }

    setPosition({ x, y, placement: bestPlacement });

    // Update overlay
    if (overlayRef.current) {
      Object.assign(overlayRef.current.style, {
        top: `${targetRect.top}px`,
        left: `${targetRect.left}px`,
        width: `${targetRect.width}px`,
        height: `${targetRect.height}px`,
      });
    }
  }

  // Find target element and position tooltip
  function findTarget(target) {
    if (!target) return;

    // Find element
    let element = null;
    if (typeof target === "string") {
      element = document.querySelector(target);
      if (!element && target.startsWith(".")) {
        const className = target.substring(1);
        const elements = document.getElementsByClassName(className);
        if (elements.length > 0) element = elements[0];
      }
    } else if (target instanceof Element) {
      element = target;
    }

    if (element) {
      // Save reference
      targetRef.current = element;

      // Scroll element into view
      element.scrollIntoView({ behavior: "smooth", block: "center" });

      // Add highlight class
      element.classList.add("tour-highlight");

      // First position offscreen to prevent flash
      setPosition({
        x: -1000,
        y: -1000,
        placement: "bottom",
      });

      // Create overlay
      setTimeout(() => {
      createOverlay(element);
      }, 1000);
    

      // Position tooltip with delay to allow scroll
      setTimeout(() => {
        positionTooltip();
      }, 300);
    }
  }

  // Handle step changes
  useEffect(() => {
    if (isOpen && tutorialSteps[currentStep]?.target) {
      findTarget(tutorialSteps[currentStep].target);
    }

    function handleResize() {
      if (targetRef.current) {
        positionTooltip();
      }
    }

    function handleScroll() {
      if (targetRef.current) {
        // Update overlay immediately
        if (overlayRef.current) {
          const rect = targetRef.current.getBoundingClientRect();
          Object.assign(overlayRef.current.style, {
            top: `${rect.top}px`,
            left: `${rect.left}px`,
          });
        }

        // Position tooltip with requestAnimationFrame for smoothness
        requestAnimationFrame(positionTooltip);
      }
    }

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);

      // Clean up highlight
      if (targetRef.current) {
        targetRef.current.classList.remove("tour-highlight");
      }
    };
  }, [isOpen, currentStep, tutorialSteps]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (overlayRef.current && document.body.contains(overlayRef.current)) {
        document.body.removeChild(overlayRef.current);
      }

      document.querySelectorAll(".tour-highlight").forEach((el) => {
        el.classList.remove("tour-highlight");
      });
    };
  }, []);

  // Close tutorial
  function handleClose() {
    saveUserPreference(localStorageId, `completed`);
    setIsOpen(false);

    if (overlayRef.current && document.body.contains(overlayRef.current)) {
      document.body.removeChild(overlayRef.current);
    }

    if (targetRef.current) {
      targetRef.current.classList.remove("tour-highlight");
    }
  }

  // Handle next/previous
  function handleNext() {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  }

  function handlePrevious() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  // Don't render if not open or no steps
  if (!isOpen || !tutorialSteps || tutorialSteps.length === 0) {
    return null;
  }

  const currentStepData = tutorialSteps[currentStep];

  // Animation variants
  const tooltipVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y:
        position.placement === "top"
          ? -20
          : position.placement === "bottom"
            ? 20
            : 0,
      x:
        position.placement === "left"
          ? -20
          : position.placement === "right"
            ? 20
            : 0,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Button animation
  const buttonPulse = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  // Get arrow classes based on position
  function getArrowClasses() {
    const baseClasses = "absolute w-0 h-0";

    switch (position.placement) {
      case "top":
        return `${baseClasses} bottom-0 left-1/2 -translate-x-1/2 -mb-2 border-l-8 border-r-8 border-t-8 border-transparent border-t-white`;
      case "bottom":
        return `${baseClasses} top-0 left-1/2 -translate-x-1/2 -mt-2 border-l-8 border-r-8 border-b-8 border-transparent border-b-white`;
      case "left":
        return `${baseClasses} right-0 top-1/2 -translate-y-1/2 -mr-2 border-t-8 border-b-8 border-l-8 border-transparent border-l-white`;
      case "right":
        return `${baseClasses} left-0 top-1/2 -translate-y-1/2 -ml-2 border-t-8 border-b-8 border-r-8 border-transparent border-r-white`;
      default:
        return baseClasses;
    }
  }

  
  return (
    <motion.div
      className="fixed"
      style={{
        top: position.y,
        left: position.x,
        zIndex: 10000,
        opacity: initialRenderComplete ? 1 : 0,
        maxWidth: "calc(100vw - 20px)",
      }}
      ref={tooltipRef}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          className="w-72 max-w-full mx-auto"
          key={`step-${currentStep}`}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={tooltipVariants}
        >
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className={getArrowClasses()}></div>

            <motion.div
              className="p-4 pb-2 border-b border-gray-100"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-800">
                {currentStepData.title || "Tutorial Step"}
              </h3>
            </motion.div>

            <motion.div
              className="p-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {currentStepData.content || "No content provided"}
            </motion.div>

            <motion.div
              className="p-4 pt-2 border-t border-gray-100 flex justify-between"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="button"
                className="px-3 py-2 text-default-800 dark:text-default-200 border rounded text-sm font-medium"
                onPress={handleClose}
              >
                Skip
              </Button>

              <div className="space-x-2">
                {currentStep > 0 && (
                  <Button
                    type="button"
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium"
                    onPress={handlePrevious}
                  >
                    Previous
                  </Button>
                )}

                <motion.div
                  variants={buttonPulse}
                  animate={
                    currentStep === tutorialSteps.length - 1 ? "pulse" : ""
                  }
                  className="inline-block"
                >
                  <Button
                    type="button"
                    className="px-3 py-2 bg-highlightPink text-white rounded text-sm font-medium"
                    onPress={handleNext}
                  >
                    {currentStep === tutorialSteps.length - 1
                      ? "Finish"
                      : "Next"}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
