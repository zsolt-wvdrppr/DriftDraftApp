import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";

// ✅ Hook to manage referees list and actions
export const useRefereesList = (userId) => {
  const [refereesList, setRefereesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch referees - wrapped in useCallback for stability
  const fetchReferees = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("referees")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      // ✅ Convert referees JSONB to an array format
      setRefereesList(
        data?.referees ? Object.entries(data.referees).map(([key, value]) => ({ key, ...value })) : []
      );

      logger.debug("🔍 Referees List Updated:", data?.referees);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch referees");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // ✅ Automatically fetch referees on component mount & userId change
  useEffect(() => {
    fetchReferees();
  }, [fetchReferees]);

  // ✅ Ensure refreshReferees always calls fetchReferees
  const refreshReferees = useCallback(() => {
    fetchReferees();
  }, [fetchReferees]);

  // ✅ Process a referee request (accept/reject)
  const processReferee = async (agentUserId, refereeEmail) => {
    try {
      const response = await fetch("/api/agent/process-referee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentUserId, refereeEmail }),
      });

      const result = await response.json();

      if (result.success) {
      
        refreshReferees(); // ✅ Refresh referees list after processing
      } 

      return { success: result.success, refereeUserId: result.refereeUserId || null };
    } catch (err) {
      logger.error("❌ Error processing referee:", err.message);

      return { success: false, refereeUserId: null };
    }
  };

  // ✅ Remove a referee from referees JSONB
  const revokeReferee = async (email) => {
    if (!userId || !email) return;
    try {
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("referees")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data?.referees) {
        toast.error("No referees found.");

        return;
      }

      let referees = data.referees;
      const updatedReferees = Object.fromEntries(
        Object.entries(referees).filter(([_, ref]) => ref.email !== email)
      );

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ referees: updatedReferees })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      toast.success("Referee revoked successfully.");
      refreshReferees(); // ✅ Refresh referees list after revoking
    } catch (err) {
      logger.error("❌ Failed to revoke referee", err);
      toast.error("Error revoking referee.");
    }
  };

  return { refereesList, loading, error, refreshReferees, processReferee, revokeReferee };
};
