import { useEffect } from 'react';
import { toast } from 'sonner';

export const useUpdateTabName = (currentStep, steps, setTabName) => {
  useEffect(() => {
    setTabName(steps[currentStep]?.label || '');
    toast.dismiss();
  }, [currentStep, steps, setTabName]);
};