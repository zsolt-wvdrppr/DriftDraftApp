import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";
import { useAuth } from "@/lib/AuthContext";

// ✅ Hook to manage referees list and actions
export const useRefereesList = () => {
  const { user } = useAuth();
  const userId = user?.id
  const [refereesList, setRefereesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch referees - wrapped in useCallback for stability
  const fetchReferees = useCallback(async () => {

    logger.debug("🔍 Fetching Referees List...");

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
  }, [userId]);

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
    } catch (err) {
      logger.error("❌ Failed to revoke referee", err);
      toast.error("Error revoking referee.");
    }
  };

  return { refereesList, loading, error, revokeReferee, fetchReferees };
};
