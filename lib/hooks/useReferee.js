import { useState, useEffect } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";
import { getJWT } from "@/lib/utils/getJWT";

export const useReferee = (userId) => {
  const [agentRequestEmails, setAgentRequestEmails] = useState([]);
  const [referralEmail, setReferralEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   // ✅ Fetch agent emails & referral email securely
  const fetchRefereeData = async () => {
    setLoading(true);
    try {
      // ✅ Get JWT securely
      const token = await getJWT();

      if (!token) {
        throw new Error("Unauthorized - No valid token.");
      }
  
      // ✅ Fetch agent emails from API
      const response = await fetch("/api/referee/get-agent-request-emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Secure request
        },
      });
  
      const result = await response.json();
  
      if (response.ok) {
        setAgentRequestEmails(result.agentEmails.map(email => ({ key: email, label: email }))); // ✅ Store emails as objects
      } else {
        throw new Error(result.error || "Failed to fetch agent emails.");
      }
  
      // ✅ Fetch referral email from API
      const referralResponse = await fetch("/api/referee/get-agent-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
  
      const referralResult = await referralResponse.json();
  
      if (referralResponse.ok) {
        setReferralEmail(referralResult.referralEmail);
      } else {
        throw new Error(referralResult.error || "Failed to fetch referral email.");
      }
  
    } catch (err) {
      setError(err.message);
      toast.error("Error fetching referee data.");
    } finally {
      setLoading(false);
    }
  }; 

  useEffect(() => {
    if (!userId) return; 
    
    fetchRefereeData();
  }, [userId]);

  // ✅ Remove current referral agent (sets `referral_user_id = null`)
  const revokeAgent = async () => {
    if (!userId) return;
  
    try {
      const token = await getJWT();
      
      if (!token) {
        throw new Error("Unauthorized - No valid token.");
      }
  
      const response = await fetch("/api/referee/revoke-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      const result = await response.json();
  
      if (response.ok) {
        toast.success("Agent successfully revoked.");
        setReferralEmail(null); // ✅ Update UI
      } else {
        throw new Error(result.error || "Failed to revoke agent.");
      }
    } catch (err) {
      logger.error("❌ Error revoking agent:", err.message);
      toast.error("Failed to revoke agent.");
    }
  };
  

  // ✅ Assign a new agent to the user
const pickAgent = async (agentEmail) => {
  if (!userId || !agentEmail) return;

  try {
    const token = await getJWT();

    if (!token) {
      throw new Error("Unauthorized - No valid token.");
    }

    const response = await fetch("/api/referee/pick-agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ agentEmail }),
    });

    const result = await response.json();

    if (response.ok) {
      toast.success("Agent successfully assigned.");
      setReferralEmail(agentEmail); // ✅ Update UI with new agent
    } else {
      throw new Error(result.error || "Failed to assign agent.");
    }
  } catch (err) {
    logger.error("❌ Error selecting agent:", err.message);
    toast.error("Failed to select agent.");
  }
};


  return { agentRequestEmails, referralEmail, loading, error, revokeAgent, pickAgent, fetchRefereeData };
};
