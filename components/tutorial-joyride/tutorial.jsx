"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

export default function Tutorial({
  tutorialSteps,
  localStorageId,
  startTrigger = true,
}) {
  return null;

  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [currentStep, setCurrentStep] = useState(0);

  // Find and scroll to target element
  const scrollToTarget = useCallback((target) => {
    if (!target) return;

    // Try different selection methods
    let targetElement = null;

    if (typeof target === "string") {
      // Try querySelector
      targetElement = document.querySelector(target);

      // If not found, try getElementsByClassName
      if (!targetElement) {
        const elements = document.getElementsByClassName(
          target.replace(".", "")
        );
        targetElement = elements.length > 0 ? elements[0] : null;
      }
    } else if (target instanceof Element) {
      targetElement = target;
    }

    if (targetElement) {
      // Scroll to element
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Add highlight
      targetElement.classList.add("tour-highlight");

      // Create overlay
      const overlay = document.createElement("div");
      overlay.classList.add("tour-target-overlay");

      const rect = targetElement.getBoundingClientRect();
      Object.assign(overlay.style, {
        position: "absolute",
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        border: "3px solid #3b82f6",
        boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
        zIndex: "9999",
        pointerEvents: "none",
        boxSizing: "border-box",
      });

      document.body.appendChild(overlay);

      return () => {
        targetElement.classList.remove("tour-highlight");
        document.body.removeChild(overlay);
      };
    }
  }, []);

  // Trigger mechanism
  useEffect(() => {
    if (startTrigger) {
      onOpen();
    }
  }, [startTrigger, onOpen]);

  // Handle step changes and targeting
  useEffect(() => {
    if (isOpen && tutorialSteps[currentStep].target) {
      const cleanup = scrollToTarget(tutorialSteps[currentStep].target);
      return cleanup;
    }
  }, [isOpen, currentStep, tutorialSteps, scrollToTarget]);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem(localStorageId, "completed");
    onClose();
  };

  // If no steps, don't render
  if (!tutorialSteps || tutorialSteps.length === 0) {
    return null;
  }

  const currentStepData = tutorialSteps[currentStep];

  return (
    <>
      {/* Global styles for highlighting */}
      <style jsx global>{`
        .tour-highlight {
          position: relative;
          z-index: 10000;
          outline: 3px solid #3b82f6;
        }
      `}</style>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {currentStepData.title || "Tutorial Step"}
              </ModalHeader>

              <ModalBody>
                {currentStepData.content || "No content provided"}
              </ModalBody>

              <ModalFooter>
                {currentStep > 0 && (
                  <Button color="secondary" onPress={prevStep}>
                    Previous
                  </Button>
                )}

                <Button
                  color="primary"
                  onPress={
                    currentStep === tutorialSteps.length - 1
                      ? handleClose
                      : nextStep
                  }
                >
                  {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
                </Button>

                <Button color="danger" onPress={handleClose}>
                  Skip
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
