// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

import logger from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const createOrUpdateProfile = async () => {
  const { data: sessionData, error: userError } = await supabase.auth.getUser();

  const user = sessionData.user;
  
  if (userError || !user) {
    logger.error("User not available:", userError?.message);
    return;
  }

  if (user) {

    // Check if the profile already exists
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (fetchError || !profile) {
      logger.info("Creating profile for user:", user);

      // Insert the user's profile if it doesn't exist
      const fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Anonymous";

      const { error: insertError } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name: fullName,
      });

      if (insertError) {
        logger.error("Error inserting profile:", insertError.message);
      } else {
        logger.info("Profile created successfully");
      }
    } else {
      logger.info("Profile already exists:", profile);
    }
  }
};

export const associateSessionWithUser = async (newUserId) => {
  const localSessionId = localStorage.getItem('sessionId');

  if (!localSessionId) return;

  const session = JSON.parse(localStorage.getItem('sessionData'));

  session.userId = newUserId; // Update session with user ID
  localStorage.setItem('sessionData', JSON.stringify(session));

  // Update session in Supabase
  const { error } = await supabase.from('sessions').update({ userId: newUserId }).eq('sessionId', localSessionId);

  if (error) {
    logger.error('Error associating session with user:', error.message);
  }
};

