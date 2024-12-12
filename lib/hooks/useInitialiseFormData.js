import { useEffect } from 'react';

export const useInitialiseFormData = (setFormData, logger) => {
  useEffect(() => {
    const initialFormData = () => {
      const savedData = localStorage.getItem('formData');

      if (savedData) {
        try {
          return JSON.parse(savedData); // Restore from localStorage
        } catch (error) {
          logger.error("Error parsing saved formData:", error);

          if (process.env.NODE_ENV !== 'production') {
            localStorage.removeItem('formData'); // Clear invalid data
          }

          return {}; // Fallback to empty object
        }
      }

      return {}; // Default empty state
    };

    if (typeof window !== 'undefined') {
      const data = initialFormData();

      setFormData(data);
    }
    logger.debug('Initialised formData:', initialFormData());
  }, [setFormData, logger]);
};
