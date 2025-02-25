import { useState, useCallback } from 'react';

import getJWT from '@/lib/utils/getJWT';

export function useAgentEligibility() {
  const [isEligible, setIsEligible] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkEligibility = useCallback(async () => {
    try {
        setLoading(true);
      const token = await getJWT();

      if (!token) {
        setIsEligible(false);
        setLoading(false);

        return;
      }

      const response = await fetch('/api/check-agent-eligibility', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Secure request
          },
      });

      const data = await response.json();

      setIsEligible(data.isEligible || false);
        setLoading(false);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setIsEligible(false);
        setLoading(false);
    }
  }, []);

  return { isEligible, checkEligibility, loading };
}
