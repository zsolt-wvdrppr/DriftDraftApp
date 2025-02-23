import { useState, useEffect } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabaseClient";

export const useRefereesList = (userId) => {
  const [refereesList, setRefereesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReferees = async () => {
    if (!userId) return;
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

  useEffect(() => {
    fetchReferees();
  }, [userId]);

  const revokeReferee = async (email) => {
    if (!userId || !email) return;
    try {
      const { data, error } = await supabase.rpc("revoke_referee_credit", {
        p_user_id: userId,
        p_referee_email: email,
      });
  
      if (error) throw error;
  
      if (!data) {
        toast.error("Failed to revoke referee. Referee not found.");
        
        return;
      }
  
      toast.success("Referee revoked successfully.");
      fetchReferees(); // Refresh the list after revoking
    } catch (err) {
      console.error("Failed to revoke referee", err);
      toast.error("Error revoking referee.");
    }
  };
  

  return { refereesList, loading, error, fetchReferees, revokeReferee };
};
