import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/lib/supabaseClient";

const allocateRefereeCredit = async (userId, credits) => {
  
  const { data, error } = await supabase.rpc("allocate_referee_credit", {
    p_user_id: userId,
    p_amount: credits,
  });

  if (error) throw error;

  return data;
};

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
    console.error("Error checking user:", err);

    return false;
  }
};

export const useAddReferee = (userId) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addReferee = async (email, credits) => {
    if (!userId || !email || !credits || credits < 5) {
      toast.error("All fields are required.");

      return;
    }

    setLoading(true);
    setError(null);

    try {

       // ✅ Check if user exists before proceeding
       const userExists = await checkUserExists(email);

       if (userExists) {
         toast.error("This email is already registered.");
         setLoading(false);

         return;
       }

      // Check if the user has enough credit and move it to pending_credits
      const success = await allocateRefereeCredit(userId, credits);

      if (!success) {
        toast.error("Insufficient credits. You must have at least the amount you're allocating available.");
        setLoading(false);
        
        return;
      }

      // Fetch existing referees
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("referees")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let referees = data?.referees || {};

      // Check if email already exists in referees
      if (Object.values(referees).some((ref) => ref.email === email)) {
        toast.error("This email has already been allocated credits.");
        setLoading(false);

        return;
      }

      // Generate a new referee key
      const newKey = `user${Object.keys(referees).length + 1}`;
      
      referees[newKey] = {
        email,
        allocated_credits: credits,
        transfer_completion_date: null,
      };

      // Update referees column in Supabase
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ referees })
        .eq("user_id", userId);

      if (updateError) throw updateError;

      toast.success("Referee added successfully.");
    } catch (err) {
      setError(err.message);
      toast.error("Failed to add referee.");
    } finally {
      setLoading(false);
    }
  };

  return { addReferee, loading, error };
};
