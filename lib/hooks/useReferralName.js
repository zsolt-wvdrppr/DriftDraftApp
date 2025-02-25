import { useState, useEffect } from "react";

import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";

export const useReferralName = (userId) => {
  const [referralName, setReferralName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchReferralName();
    }
  }, [userId]);

  const fetchReferralName = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("referral_name")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      setReferralName(data?.referral_name || "");
    } catch (err) {
      setError("Failed to fetch referral name.");
      logger.error("❌ Error fetching referral name:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkReferralNameAvailability = async (name) => {
    if (!name || name.length < 5) {
      setIsAvailable(false);
      setError("Referral name must be at least 5 characters.");

      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/agent/check-referral-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referral_name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.available) {
        setIsAvailable(false);
        setError(data.error || "Name is already taken.");
      } else {
        setIsAvailable(true);
      }
    } catch (err) {
      setIsAvailable(false);
      setError("Network or server error.");
      logger.error("❌ Error checking referral name", err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateReferralName = async (newName) => {
    if (!userId || !newName || newName.length < 5) {
      setError("Invalid referral name.");

      return;
    }

    setLoading(true);
    setError(null);
    setIsUpdated(false);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ referral_name: newName })
        .eq("user_id", userId);

      if (updateError) {
        setError("Failed to update referral name.");
        logger.error("❌ Error updating referral name:", updateError);
      } else {
        logger.info(`✅ Referral name updated to: ${newName}`);
        setReferralName(newName);
        setIsUpdated(true);
      }
    } catch (err) {
      setError("Unexpected error occurred.");
      logger.error("❌ Error updating referral name:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    referralName,
    fetchReferralName,
    checkReferralNameAvailability,
    updateReferralName,
    isAvailable,
    loading,
    error,
    isUpdated,
    setReferralName,
  };
};
