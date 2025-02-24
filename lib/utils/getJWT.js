import { supabase } from '@/lib/supabaseClient';
import logger from '@/lib/logger';

export const getJWT = async () => {
  try {
    const { data: sessionData, error } = await supabase.auth.getSession();

    const jwt = sessionData?.session?.access_token;

    logger.debug("jwt data:", jwt);

    if (error) {
      logger.error('Error fetching session:', error);

      return null;
    }

    return jwt || null;
  } catch (err) {
    logger.error('Unexpected error fetching JWT:', err);

    return null;
  }
};

export default getJWT;