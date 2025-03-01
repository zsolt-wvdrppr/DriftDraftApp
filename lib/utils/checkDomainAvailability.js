// utils/checkDomainAvailability.js
export const checkDomainAvailability = async (domain) => {
    if (!domain) return { isAvailable: null, suggestions: [], error: 'Domain is required' };
  
    try {
      const response = await fetch(`/api/domain-check?domain=${domain}`);
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const { isAvailable, suggestions } = await response.json();

      return { isAvailable, suggestions, error: null };
    } catch (error) {
      console.error('Domain check error:', error);

      return { isAvailable: null, suggestions: [], error: error.message };
    }
  };
  