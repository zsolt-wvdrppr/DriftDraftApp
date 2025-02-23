import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";
import { useAuth } from "@/lib/AuthContext";

const checkUserExists = async (email) => {
  try {
    const response = await fetch("/api/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const { exists } = await response.json();

    return exists;
  } catch (err) {
    logger.error("Error checking user:", err);

    return false;
  }
};

const setAgentRequest = async (inviteeEmail, agentUserId) => {
  try {
    const response = await fetch("/api/agent/set-agent-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteeEmail, agentUserId }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to send agent request.");
    }

    return true;
  } catch (err) {
    toast.error(`Error: ${err.message}`);

    return false;
  }
};

// ✅ Mocked email sending function
const sendInvitationEmail = async (email, agentName, message) => {
  try {
    logger.info(`📧 Mock email sent to ${email}`);
    logger.info(`Agent: ${agentName}`);
    logger.info(`Message: ${message || "Join me on this platform!"}`);

    return true;
  } catch (err) {
    logger.error("Error sending invite email:", err);

    return false;
  }
};

export const useAddReferee = (userId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuth();
  const userEmail = user?.email;

  const addReferee = async (email, agentName, message = "Hello") => {
    if (email === userEmail) {
      toast.error("You cannot invite yourself.", {
        classNames: { toast: "text-danger" },
      });

      return;
    }

    if (!userId || !email) {
      toast.error("All fields are required.", {
        classNames: { toast: "text-danger" },
      });

      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ Check if the invitee exists
      const userExists = await checkUserExists(email);
      const autoAccept = !userExists;
      const timestamp = new Date().toISOString();

      // ✅ Fetch the agent's current referees JSONB
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("referees")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let referees = data?.referees || {};

      // ✅ Check if email already exists in referees JSONB
      const existingReferee = Object.values(referees).find(
        (ref) => ref.email === email
      );

      if (existingReferee) {
        toast.error("This user has already been invited.");
        setLoading(false);

        return;
      }

      // ✅ Generate a new referee key and add invitee
      const existingKeys = Object.keys(referees)
        .map((key) => parseInt(key.replace("user", ""), 10))
        .filter((num) => !isNaN(num));

      const nextKey =
        existingKeys.length > 0 ? Math.max(...existingKeys) + 1 : 1;
      const newKey = `user${nextKey}`;

      referees[newKey] = {
        email,
        accepted: false,
        auto_accept: autoAccept,
        rejected: false,
        timestamp,
      };

      // ✅ Update the agent's referees JSONB
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ referees })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      // ✅ Send an invitation email (mocked)
      const emailSent = await sendInvitationEmail(email, agentName, message);

      if (!emailSent) {
        toast.error("Failed to send invitation email.");
      }

      // ✅ If the user exists, send an agent request API call
      if (userExists) {
        const requestSent = await setAgentRequest(email, userId);

        if (!requestSent) {
          //toast.error("Failed to send agent request.");
          setLoading(false);

          return;
        }
      }

      toast.success("Agent request sent successfully.");
    } catch (err) {
      setError(err.message);
      toast.error("Failed to send agent request.");
    } finally {
      setLoading(false);
    }
  };

  return { addReferee, loading, error };
};
