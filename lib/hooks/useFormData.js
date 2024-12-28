import { useState, useEffect } from 'react';

export const useFormData = (sessionData) => {
  const [formData, setFormData] = useState(sessionData?.formData || {});

  useEffect(() => {
    setFormData(sessionData?.formData || {});
  }, [sessionData]);

  return [formData, setFormData];
}

export default useFormData;
