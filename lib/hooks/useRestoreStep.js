import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useRestoreStep = (formData, setCurrentStep, basePath) => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const searchParams = new URLSearchParams(window.location.search);
    const step = searchParams.get('step') || undefined;

    if (step) {
      const parsedStep = parseInt(step, 10);

      // Validate and enforce the step
      if (!formData || typeof formData !== 'object') return;

      const totalSteps = Object.keys(formData).length; // Count the number of steps

      // Redirect if the parsed step is invalid
      if (parsedStep > totalSteps) {
        const redirectPath = `${basePath}${totalSteps > 0 ? `?step=${totalSteps-1}` : ''}`;
        
        // Perform redirection
        router.replace(redirectPath); // Use replace to avoid polluting browser history
      } else {
        // If valid, set the current step
        setCurrentStep(parsedStep);
      }
    } else {
      return;
    }
  }, [formData, setCurrentStep, basePath, router]);
};
