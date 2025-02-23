import { useState, useEffect } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";

export const useReferee = (userId) => {
  const [agentRequestIds, setAgentRequestIds] = useState([]);
  const [referralEmail, setReferralEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch agent requests & referral email
  useEffect(() => {
    if (!userId) return;

    const fetchRefereeData = async () => {
      setLoading(true);
      try {
        // ✅ Fetch agent_requests & referral_user_id from client-side Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select("agent_requests")
          .eq("user_id", userId)
          .maybeSingle();

        if (error) throw error;

        // ✅ Convert agent_requests to dropdown format [{ key: agentId, label: agentId }]
        setAgentRequestIds((data?.agent_requests || []).map(id => ({ key: id, label: id })));

        // ✅ Fetch referral email from API
        const response = await fetch("/api/referee/get-agent-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const result = await response.json();

        if (response.ok) {
          setReferralEmail(result.referralEmail);
        } else {
          throw new Error(result.error || "Failed to fetch referral email.");
        }

      } catch (err) {
        setError(err.message);
        toast.error("Error fetching referee data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRefereeData();
  }, [userId]);

  // ✅ Remove current referral agent (sets `referral_user_id = null`)
  const revokeAgent = async () => {
    if (!userId) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ referral_user_id: null })
        .eq("user_id", userId);

      if (error) throw error;

      setReferralEmail(null); // ✅ Update state
      toast.success("Agent revoked successfully.");
    } catch (err) {
      logger.error("❌ Error revoking agent:", err.message);
      toast.error("Failed to revoke agent.");
    }
  };

  // ✅ Assign a new agent to the user
  const pickAgent = async (agentId) => {
    if (!userId || !agentId) return;
  
    try {
      // ✅ Fetch existing agent requests and referral_user_id
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("agent_requests, referral_user_id")
        .eq("user_id", userId)
        .maybeSingle();
  
      if (fetchError) throw fetchError;
  
      let updatedRequests = data?.agent_requests || [];
      const currentAgent = data?.referral_user_id;
  
      // ✅ Check if the user already has an assigned agent
      if (currentAgent) {
        toast.error("You must remove your current agent before selecting a new one.");
        return;
      }
  
      // ✅ Remove selected agentId from `agent_requests`
      updatedRequests = updatedRequests.filter(id => id !== agentId);
  
      // ✅ Update Supabase: Assign the new agent and update `agent_requests`
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          agent_requests: updatedRequests,
          referral_user_id: agentId, // ✅ Assign the selected agent
        })
        .eq("user_id", userId);
  
      if (updateError) throw updateError;
  
      // ✅ Update state immediately to reflect changes
      setAgentRequestIds(updatedRequests.map(id => ({ key: id, label: id })));
      setReferralEmail(null); // Refresh the UI so the API refetches the new agent's email
  
      toast.success("Agent successfully assigned.");
    } catch (err) {
      logger.error("❌ Error selecting agent:", err.message);
      toast.error("Failed to select agent.");
    }
  };
  

  return { agentRequestIds, referralEmail, loading, error, revokeAgent, pickAgent };
};
