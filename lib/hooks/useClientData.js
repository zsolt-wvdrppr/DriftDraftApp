import { useMemo } from 'react';

// Utility function to get client data
export const getClientData = () => {
  if (typeof window === 'undefined') {
    return {
      screenResolution: 'unknown',
      language: 'unknown',
      timeZone: 'unknown',
    };
  }

  return {
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
};

// React hook for client data
export const useClientData = () => {
  const clientData = useMemo(() => getClientData(), []);
  return clientData;
};

export default useClientData;
