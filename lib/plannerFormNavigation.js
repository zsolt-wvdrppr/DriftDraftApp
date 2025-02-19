import logger from './logger';

export const updateUrlParams = (currentStep) => {
  const currentUrl = new URL(window.location.href);
  
  // Preserve existing query parameters (except step)
  currentUrl.searchParams.set('step', currentStep);
  
  // Clean up possible double slashes
  const cleanUrl = currentUrl.origin + currentUrl.pathname.replace(/([^:]\/)\/+/g, "$1") + currentUrl.search;

  window.history.replaceState(null, '', cleanUrl);
};
  
  export const handleValidation = (stepRef, currentStep, formData, updateFormData) => {
    if (!stepRef || !stepRef.current || typeof stepRef.current.validateStep !== 'function') {
      logger.error('Invalid stepRef passed to handleValidation.');

      return false; // Validation cannot proceed
    }
  
    if (stepRef.current.validateStep()) {
      /*setFormData((prev) => ({
        ...prev,
        [currentStep]: { ...prev[currentStep], isValid: true },
      }));*/
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
    updateUrlParams
  ) => {
    
    const _isValid = handleValidation(stepRef, currentStep, formData, updateFormData);

    if (_isValid) {
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
        updateUrlParams(currentStep + 1);
      }
    }
  };
  
  export const goToPreviousStep = (currentStep, setCurrentStep, updateUrlParams) => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      updateUrlParams(currentStep - 1);
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
      const redirectPath = `/login?redirect=/${pathname}?step=${currentStep}`;

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
          const response = await fetch('/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedFormData),
          });
  
          if (response.ok) {
            clearLocalStorage();
            setIsSubmitted(true);
          } else {
            alert('Submission failed!');
          }
        } catch (error) {
          logger.error('Error:', error);
          alert('An error occurred while submitting.');
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
    setError
  ) => {
    const _isValid = handleValidation();
  
    if (_isValid) {
      if (index <= currentStep + 1) {
        setCurrentStep(index);
        updateUrlParams(index);

        return;
      }
      if (formData && formData[index - 1]?.isValid) {
        setCurrentStep(index);
        updateUrlParams(index);

        return;
      }
    } else {
      if (index < currentStep) {
        setCurrentStep(index);
        updateUrlParams(index);

        return;
      }
    }
    const errorMsg = `Don't jump ahead! Please navigate to the next question.`;
  
    if (index > currentStep + 1) {
      setError(errorMsg);
    }
  };
  