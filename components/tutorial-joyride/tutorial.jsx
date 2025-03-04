"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export default function Tutorial({
  tutorialSteps,
  localStorageId,
  startTrigger = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipArrowPosition, setTooltipArrowPosition] = useState("bottom");
  const tooltipRef = useRef(null);
  const overlayRef = useRef(null);

  const calculatePosition = useCallback((targetElement) => {
    if (!targetElement || !tooltipRef.current) return;

    const targetRect = targetElement.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    // Window dimensions
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    
    // Calculate positions for different placements
    const positions = {
      top: {
        top: targetRect.top + window.scrollY - tooltipRect.height - 15,
        left: targetRect.left + window.scrollX + (targetRect.width / 2) - (tooltipRect.width / 2)
      },
      bottom: {
        top: targetRect.bottom + window.scrollY + 15,
        left: targetRect.left + window.scrollX + (targetRect.width / 2) - (tooltipRect.width / 2)
      },
      left: {
        top: targetRect.top + window.scrollY + (targetRect.height / 2) - (tooltipRect.height / 2),
        left: targetRect.left + window.scrollX - tooltipRect.width - 15
      },
      right: {
        top: targetRect.top + window.scrollY + (targetRect.height / 2) - (tooltipRect.height / 2),
        left: targetRect.right + window.scrollX + 15
      }
    };
    
    // Check which position has the most space
    const spaces = {
      top: targetRect.top,
      bottom: windowHeight - targetRect.bottom,
      left: targetRect.left,
      right: windowWidth - targetRect.right
    };
    
    // Determine best position (use specified position from step or calculate best fit)
    let bestPosition = tutorialSteps[currentStep].position || "bottom";
    
    if (!tutorialSteps[currentStep].position) {
      // Find the position with maximum space
      bestPosition = Object.keys(spaces).reduce((a, b) => spaces[a] > spaces[b] ? a : b);
    }
    
    // Apply the position
    setTooltipPosition(positions[bestPosition]);
    setTooltipArrowPosition(bestPosition);
    
    // Ensure tooltip stays within viewport bounds
    setTimeout(() => {
      if (tooltipRef.current) {
        const updatedTooltipRect = tooltipRef.current.getBoundingClientRect();
        
        // Check if tooltip is out of viewport and adjust if needed
        let updatedPosition = { ...positions[bestPosition] };
        
        // Adjust horizontally if needed
        if (updatedTooltipRect.right > windowWidth) {
          updatedPosition.left = windowWidth - updatedTooltipRect.width - 10;
        } else if (updatedTooltipRect.left < 0) {
          updatedPosition.left = 10;
        }
        
        // Adjust vertically if needed
        if (updatedTooltipRect.bottom > windowHeight) {
          updatedPosition.top = windowHeight - updatedTooltipRect.height - 10;
        } else if (updatedTooltipRect.top < 0) {
          updatedPosition.top = 10;
        }
        
        setTooltipPosition(updatedPosition);
      }
    }, 0);
  }, [currentStep, tutorialSteps]);

  // Find and scroll to target element
  const scrollToTarget = useCallback((target) => {
    if (!target) return null;

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

      // Add highlight class for targeting
      targetElement.classList.add("tour-highlight");

      // Remove existing overlay safely
      if (overlayRef.current && document.body.contains(overlayRef.current)) {
        try {
          document.body.removeChild(overlayRef.current);
        } catch (e) {
          console.warn("Error removing overlay:", e);
        }
      }
      
      // Create new overlay
      const overlay = document.createElement("div");
      overlay.classList.add("tour-target-overlay");
      overlayRef.current = overlay;

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
        borderRadius: "4px"
      });

      document.body.appendChild(overlay);
      
      // Calculate tooltip position
      calculatePosition(targetElement);

      return targetElement;
    }
    return null;
  }, [calculatePosition]);

  // Trigger mechanism
  useEffect(() => {
    // Check if tutorial has been completed
    const tutorialCompleted = localStorage.getItem(localStorageId) === "completed";
    
    // Auto-start if not completed, or if startTrigger is true (even if completed)
    if (!tutorialCompleted || startTrigger) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [startTrigger, localStorageId]);

  // Handle step changes and targeting
  useEffect(() => {
    let targetElement = null;
    
    if (isOpen && tutorialSteps[currentStep]?.target) {
      targetElement = scrollToTarget(tutorialSteps[currentStep].target);
    }

    // Handle window resize
    const handleResize = () => {
      if (targetElement) {
        calculatePosition(targetElement);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Cleanup - safely remove highlight
      if (targetElement) {
        targetElement.classList.remove("tour-highlight");
      }
      
      // Safely remove overlay if component unmounts or step changes
      if (overlayRef.current && document.body.contains(overlayRef.current)) {
        try {
          document.body.removeChild(overlayRef.current);
          overlayRef.current = null;
        } catch (e) {
          console.warn("Error cleaning up overlay:", e);
        }
      }
    };
  }, [isOpen, currentStep, tutorialSteps, scrollToTarget, calculatePosition]);

  const nextStep = useCallback(() => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  }, [currentStep, tutorialSteps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleClose = useCallback(() => {
    localStorage.setItem(localStorageId, "completed");
    setIsOpen(false);
    
    // Final cleanup - safely remove overlay
    if (overlayRef.current && document.body.contains(overlayRef.current)) {
      try {
        document.body.removeChild(overlayRef.current);
        overlayRef.current = null;
      } catch (e) {
        console.warn("Error removing overlay during close:", e);
      }
    }
    
    // Remove any highlight classes
    const highlightedElements = document.querySelectorAll('.tour-highlight');
    highlightedElements.forEach(el => {
      el.classList.remove('tour-highlight');
    });
  }, [localStorageId]);

  // If no steps or not open, don't render
  if (!isOpen || !tutorialSteps || tutorialSteps.length === 0) {
    return null;
  }

  const currentStepData = tutorialSteps[currentStep];
  
  // Arrow styles based on position
  const getArrowClasses = () => {
    const baseClasses = "absolute w-0 h-0";
    
    switch (tooltipArrowPosition) {
      case 'top':
        return `${baseClasses} bottom-0 left-1/2 -translate-x-1/2 -mb-2 border-l-8 border-r-8 border-t-8 border-transparent border-t-white`;
      case 'bottom':
        return `${baseClasses} top-0 left-1/2 -translate-x-1/2 -mt-2 border-l-8 border-r-8 border-b-8 border-transparent border-b-white`;
      case 'left':
        return `${baseClasses} right-0 top-1/2 -translate-y-1/2 -mr-2 border-t-8 border-b-8 border-l-8 border-transparent border-l-white`;
      case 'right':
        return `${baseClasses} left-0 top-1/2 -translate-y-1/2 -ml-2 border-t-8 border-b-8 border-r-8 border-transparent border-r-white`;
      default:
        return baseClasses;
    }
  };

  return (
    <div 
      className="fixed" 
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
        zIndex: 10001
      }}
      ref={tooltipRef}
    >
      <div className="bg-white rounded-lg shadow-lg w-72 max-w-[90vw] transition-all duration-300">
        <div className={getArrowClasses()}></div>
        
        <div className="p-4 pb-2 border-b border-gray-100">
          <h3 className="font-semibold text-lg text-gray-800">
            {currentStepData.title || "Tutorial Step"}
          </h3>
        </div>

        <div className="p-4 text-sm text-gray-600 leading-relaxed">
          {currentStepData.content || "No content provided"}
        </div>

        <div className="p-4 pt-2 border-t border-gray-100 flex justify-between">
          <div className="space-x-2">
            {currentStep > 0 && (
              <button 
                type="button"
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  prevStep();
                }}
              >
                Previous
              </button>
            )}
            
            <button 
              type="button"
              className="px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium"
              onClick={(e) => {
                e.preventDefault();
                currentStep === tutorialSteps.length - 1 ? handleClose() : nextStep();
              }}
            >
              {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
          
          <button 
            type="button"
            className="px-3 py-2 bg-red-400 text-white rounded text-sm font-medium"
            onClick={(e) => {
              e.preventDefault();
              handleClose();
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}