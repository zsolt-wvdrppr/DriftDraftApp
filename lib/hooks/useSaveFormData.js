import { useEffect } from 'react';

export const useSaveFormData = (formData) => {
  useEffect(() => {
    if (!formData) return;
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);
};