// lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

import logger from "@/lib/logger";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Returns a configured Supabase client with optional JWT headers.
 * @param {string|null} jwt - The JWT token to use, or null if not needed.
 */

export const createOrUpdateProfile = async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    logger.error("User not available:", userError?.message);
    
    return;
  }

  const user = userData.user;

  try {
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const fullName =
      existingProfile?.full_name ??
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      "Anonymous";

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        [{ user_id: user.id, email: user.email, full_name: fullName }],
        { onConflict: ["user_id"] }
      )
      .single();

    if (upsertError) throw upsertError;

    logger.info("Profile created or updated successfully.");

    return true; // ✅ Indicate success
  } catch (error) {
    logger.error("Error creating or updating profile:", error.message);

    return false;
  }
};




/*export const associateSessionWithUser = async (newUserId) => {
  const localSessionId = localStorage.getItem("sessionId");

  if (!localSessionId) return;

  const session = JSON.parse(localStorage.getItem("sessionData"));

  session.userId = newUserId; // Update session with user ID
  localStorage.setItem("sessionData", JSON.stringify(session));

  // Update session in Supabase
  const { error } = await supabase
    .from("sessions")
    .update({ userId: newUserId })
    .eq("sessionId", localSessionId);

  if (error) {
    logger.error("Error associating session with user:", error.message);
  }
};*/
