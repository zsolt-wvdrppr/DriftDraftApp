import { useEffect } from 'react';
import { createOrUpdateProfile } from "@/lib/supabaseClient";

export const useProfileUpdater = (user) => {
  useEffect(() => {
    if (user) {
      createOrUpdateProfile();
    }
  }, [user, createOrUpdateProfile]);
};