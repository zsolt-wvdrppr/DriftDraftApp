import { useEffect } from 'react';

export const useRestoreStep = (setCurrentStep) => {
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const step = searchParams.get('step') || undefined;

    if (step) {
      setCurrentStep(parseInt(step, 10));
    }
  }, [setCurrentStep]);
};