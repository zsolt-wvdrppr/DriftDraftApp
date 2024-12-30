'use client'; // Needed because this component uses client-side hooks like useState and useEffect

import { useState, useEffect, useTransition } from 'react';
import { showAnchoredToast } from './toastUtils';
import logger from '@/lib/logger';

import { toast } from 'sonner';

const Tutorial = ({ steps, localStorageKey = 'tutorialCompleted', onRestart }) => {
    const [currentStep, setCurrentStep] = useState(0); // Tracks the current step in the tutorial
    const [isPending, startTransition] = useTransition(); // Handles smooth transitions

    useEffect(() => {
        const tutorialCompleted = localStorage.getItem(localStorageKey);
        if (!tutorialCompleted && steps.length > 0) {
            logger.debug(`[TUTORIAL] - Initializing tutorial with steps:`, steps);
            setTimeout(() => startTransition(() => showStep(0)), 300);
        }
    }, [steps]); // Only re-run if `steps` changes
    
    /**
     * Shows a specific step in the tutorial.
     * @param {number} stepIndex - The index of the step to display.
     */
    let isStepInProgress = false; // Track step execution

    const showStep = (stepIndex) => {
        if (isStepInProgress) {
            logger.debug(`[TUTORIAL] - Step ${stepIndex + 1} is already in progress.`);
            return;
        }
        isStepInProgress = true;
    
        const { title, message, targetClass } = steps[stepIndex];
    
        let timeout;
    
        const checkElement = setInterval(() => {
            const element = document.querySelector(`.${targetClass}`);
            if (element) {
                clearInterval(checkElement);
                clearTimeout(timeout);
                logger.debug(`[TUTORIAL] - Found target element with class "${targetClass}"`);
    
                showAnchoredToast(title, message, targetClass, {
                    previous: stepIndex > 0,
                    next: stepIndex < steps.length - 1,
                    end: stepIndex === steps.length - 1,
                    onPrevious: () => {
                        dismissStep();
                        showStep(stepIndex - 1);
                    },
                    onNext: () => {
                        dismissStep();
                        showStep(stepIndex + 1);
                    },
                    onEnd: () => {
                        dismissStep();
                        localStorage.setItem(localStorageKey, true); // Mark tutorial as completed
                    },
                    onDismiss: () => {
                        if (stepIndex === steps.length - 1) {
                            localStorage.setItem(localStorageKey, true);
                        }
                    },
                });
    
                setCurrentStep(stepIndex);
                isStepInProgress = false;
            };
        }, 100);
    
        timeout = setTimeout(() => {
            clearInterval(checkElement);
            logger.error(`[TUTORIAL] - Target element with class "${targetClass}" not found after timeout.`);
            isStepInProgress = false;
        }, 5000);

    };
    
    

    /**
     * Dismisses the current step.
     */
    const dismissStep = () => {
        toast.dismiss();
        // Add any additional cleanup logic here if necessary
    };

    const restartTutorial = () => {
        setCurrentStep(0);
        showStep(0);
    };

    // Pass restartTutorial function to parent via callback
    useEffect(() => {
        if (onRestart) {
            onRestart(restartTutorial);
        }
    }, [onRestart]);

    return null; // This component doesn't render anything directly
};

export default Tutorial;
