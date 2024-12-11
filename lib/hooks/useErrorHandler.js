import { useEffect } from 'react';
import { toast } from 'sonner';

export const useErrorHandler = (error, setError, setFormData, currentStep) => {
  useEffect(() => {
    if (error) {
      toast.error(error, { duration: 5000, closeButton: true, classNames: { toast: "text-danger" } });

      setFormData((prev) => ({
        ...prev,
        [currentStep]: { ...prev?.[currentStep], isValid: false },
      }));

      const timeout = setTimeout(() => setError(null), 5000);

      return () => clearTimeout(timeout);
    }
  }, [error, setError, setFormData, currentStep]);
};