import { useState, useEffect } from "react";
import { toast } from "sonner";

export const useRefereesList = (userId) => {
  const [refereesList, setRefereesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchReferees = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/agent/referees?userId=${userId}`);
        const { refereesList, error } = await response.json();

        if (error) throw new Error(error);

        setRefereesList(refereesList);
      } catch (err) {
        setError(err.message);
        toast.error("Failed to fetch referees");
      } finally {
        setLoading(false);
      }
    };

    fetchReferees();
  }, [userId]);

  return { refereesList, loading, error };
};
