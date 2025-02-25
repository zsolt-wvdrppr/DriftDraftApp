import { useState } from "react";

import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";
import { getJWT } from "@/lib/utils/getJWT";
import { useAuth } from "@/lib/AuthContext";

export const useCreditTransfer = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const doTransfer = async (creditAmount, recipientEmail) => {
    setMessage(null);
    setError(null);
    setLoading(true);

    // ✅ Get JWT securely
    const token = await getJWT();

    if (!token) {
      setLoading(false);
      throw new Error("Unauthorized - No valid token.");
    }

    // Step 1: Validate recipient existence
    const checkUserResponse = await fetch("/api/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: recipientEmail }),
    });

    const { exists } = await checkUserResponse.json();

    if (!exists) {
      setError("Can't find user registered with us.");
      setLoading(false);

      return;
    }

    // Log recipient existence for debugging
    logger.debug("Recipient exists:", exists);

    // Step 2: Fetch sender's profile and ensure no ongoing transfer
    const { data: senderProfile, error } = await supabase
      .from("profiles")
      .select("top_up_credits, pending_credits, transfer_recipient_email")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      setError("Error fetching profile data.");
      setLoading(false);

      return;
    }

    // Log the sender's profile for debugging
    logger.debug("Sender profile:", senderProfile);

    if (
      senderProfile.pending_credits > 0 ||
      senderProfile.transfer_recipient_email
    ) {
      setError("Ongoing transfer in progress, try again later. If issue persists, contact support.");
      setLoading(false);

      return;
    }

    if (senderProfile.top_up_credits < creditAmount) {
      setError("Insufficient credits.");
      setLoading(false);

      return;
    }

    // Step 3: Move credits to pending
    const { error: transferError } = await supabase.rpc(
      "prepare_for_transfer",
      {
        p_user_id: userId,
        p_transfer_amount: creditAmount,
        p_recipient_email: recipientEmail,
      }
    );

    if (transferError) {
      setError("Error moving credits to pending.", transferError);
      setLoading(false);

      return;
    }

    // Step 4: Call API to process the final transfer
    const processResponse = await fetch("/api/process-credit-transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Secure request
      },
    });

    const processData = await processResponse.json();

    if (processData.success) {
      setMessage("Transfer completed successfully.");
    } else {
      setError("Transfer failed: " + processData.error);
    }

    setLoading(false);
  };

  return { doTransfer, message, error, loading };
};

export default useCreditTransfer;
