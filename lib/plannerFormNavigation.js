import { toast } from "sonner";

import logger from "./logger";


const errorToast = (message, duration = 5000) => {
  toast.error(message, {
    duration,
    closeButton: true,
    classNames: { toast: "text-danger" },
  });
};

export const updateUrlParams = (currentStep) => {
  const newUrl = `${window.location.pathname}?step=${currentStep}`;

  window.history.replaceState(null, "", newUrl);
};

let suggestionFired = false; // Flag to track if AI suggestion has been made

export const setSuggestionFired = (value) => {
  suggestionFired = value; // Update the suggestion flag
};

const suggestToUseAI = (stepNumber, formData, exceptionsArr = []) => {
  const exceptionSteps = exceptionsArr; // Steps where AI suggestion is applicable

  logger.debug("[WIZZ] Exception steps:", exceptionSteps);

  if (exceptionSteps.includes(stepNumber)) {
    return true; // No suggestion needed for this step
  }

  if (suggestionFired) {
    return true; // AI hint already suggested, no need to suggest again
  }

  const stepData = formData[stepNumber] || {};

  logger.debug("[WIZZ] Step data:", stepData);

  if (stepData.aiHint) {
    return true; // AI hint already provided, no need to suggest again
  }

  const errorMessage =
    "You haven’t used ‘Refine with AI’ yet. For better answers, try it now. Or click ‘Next’ again to skip.";

  errorToast(errorMessage, 15000); // Show error message for 15 seconds
  setSuggestionFired(true); // Set flag to prevent further suggestions

  return false;
};

export const handleValidation = (
  stepRef,
  currentStep,
  formData,
  updateFormData,
  exceptionsArr
) => {
  if (
    !stepRef ||
    !stepRef.current ||
    typeof stepRef.current.validateStep !== "function"
  ) {
    logger.error("Invalid stepRef passed to handleValidation.");

    return false; // Validation cannot proceed
  }

  if (stepRef.current.validateStep()) {

    if (!suggestToUseAI(currentStep, formData, exceptionsArr)) {
      return;
    } else {
      setSuggestionFired(false); // Reset suggestion flag
    }

    updateFormData("isValid", true);

    return true;
  }

  return false;
};

export const goToNextStep = (
  currentStep,
  steps,
  handleValidation,
  stepRef,
  formData,
  updateFormData,
  setCurrentStep,
  updateUrlParams,
  router,
  exceptionsArr,
) => {
  const _isValid = handleValidation(
    stepRef,
    currentStep,
    formData,
    updateFormData,
    exceptionsArr
  );

  if (_isValid) {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      updateUrlParams(currentStep + 1, router);
    }
  }
};

export const goToPreviousStep = (
  currentStep,
  setCurrentStep,
  updateUrlParams,
  router
) => {
  if (currentStep > 0) {
    setCurrentStep((prev) => prev - 1);
    updateUrlParams(currentStep - 1, router);
  }
};

export const handleSubmit = async (
  loading,
  user,
  router,
  currentStep,
  steps,
  stepRef,
  formData,
  updateFormData,
  clearLocalStorage,
  setError,
  setIsSubmitted,
  startTransition,
  pathname
) => {
  if (loading) return;

  if (!user) {
    const redirectPath = `/login?redirect=${pathname}?step=${currentStep}`;

    router.push(redirectPath);

    return;
  }

  const isCurrentStepValid = stepRef?.current?.validateStep();

  if (!isCurrentStepValid) {
    setError(`Please complete the current step: ${steps[currentStep]?.label}`);

    return;
  }

  const updatedFormData = { ...formData };
  let allStepsValid = true;

  for (const step of steps) {
    const stepId = step.id;

    if (!updatedFormData[stepId]?.isValid) {
      const isValid = stepRef?.current?.validateStep();

      updateFormData(stepId, { isValid });

      if (!isValid) {
        allStepsValid = false;
      }
    }
  }

  if (allStepsValid) {
    startTransition(async () => {
      try {
        const response = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFormData),
        });

        if (response.ok) {
          clearLocalStorage();
          setIsSubmitted(true);
        } else {
          alert("Submission failed!");
        }
      } catch (error) {
        logger.error("Error:", error);
        alert("An error occurred while submitting.");
      }
    });
  } else {
    setError(`Please complete all steps before submitting.`);
  }
};

export const handleSectionPicker = (
  index,
  currentStep,
  handleValidation,
  formData,
  setCurrentStep,
  updateUrlParams,
  setError,
  router
) => {
  const _isValid = handleValidation();

  if (_isValid) {
    if (index <= currentStep + 1) {
      setCurrentStep(index);
      updateUrlParams(index, router);

      return;
    }
    if (formData && formData[index - 1]?.isValid) {
      setCurrentStep(index);
      updateUrlParams(index, router);

      return;
    }
  } else {
    if (index < currentStep) {
      setCurrentStep(index);
      updateUrlParams(index);

      return;
    }
  }
  const errorMsg = `Don't jump ahead! Make sure to properly complete the current step.`;

  if (index > currentStep + 1) {
    setError(errorMsg);
  }
};
