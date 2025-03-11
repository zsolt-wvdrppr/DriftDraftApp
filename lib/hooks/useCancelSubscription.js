import { useState } from "react";

export function useCancelSubscription(userId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cancelSubscription = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const { success, message, error } = await response.json();

      if (!success) {
        setError(error || "Failed to cancel subscription.");

        return;
      }

      //alert(message);

    } catch (err) {
      setError("An unexpected error occurred.", err);
    } finally {
      setLoading(false);
    }
  };

  return { cancelSubscription, loading, error };
}

export default useCancelSubscription;