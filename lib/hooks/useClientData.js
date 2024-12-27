import { useMemo } from 'react';

export const useClientData = () => {
  const clientData = useMemo(() => {
    return {
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }, []);

  return clientData;
};

export default useClientData;
