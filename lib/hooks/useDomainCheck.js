'use client';

import { useState, useEffect } from 'react';

const useDomainCheck = (domain) => {
  const [isAvailable, setIsAvailable] = useState(null);
  const [suggestions, setSuggestions] = useState([]); // ✅ New state for suggestions
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!domain) return;

    const checkDomainAvailability = async () => {
      setIsChecking(true);
      setError(null);
      setSuggestions([]); // Reset suggestions on new check

      try {
        const response = await fetch(`/api/domain-check?domain=${domain}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        setIsAvailable(data.isAvailable);
        setSuggestions(data.suggestions || []); // ✅ Store suggestions if domain is unavailable
      } catch (err) {
        console.error('Domain check error:', err);
        setError(err.message);
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkDomainAvailability();
  }, [domain]);

  return { isAvailable, suggestions, isChecking, error }; // ✅ Now returning suggestions
};

export default useDomainCheck;
