// /lib/rateLimiter.js
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';
import logger from '@/lib/logger';

// Helper to securely hash strings
const hashValue = (value) => {
  return crypto.createHash('sha256').update(value).digest('hex');
}; 

// Enhanced helper to generate a unique key
const generateRateLimitKey = ({ userId, ip, userAgent, clientData }) => {
  if (userId) {
    // Authenticated user key
    return `${userId}`;
  }

  // For anonymous users, use IP + User-Agent + Device fingerprint
  const fingerprint = `${ip || 'unknown'}-${userAgent || 'unknown'}-${clientData || 'unknown'}`;
  return hashValue(fingerprint);
};

// Rate limiter function
export const rateLimiter = async ({ userId, ip, type, userAgent, clientData, limit, windowMs }) => {
  const key = generateRateLimitKey({ userId, ip, userAgent, clientData });
  const now = new Date().getTime();
  const windowStart = new Date(now - windowMs).toISOString();

  try {
    // Query the existing record within the time window
    const { data: existingRecords, error: selectError } = await supabase
      .from('rate_limits')
      .select('id, request_count, timestamp')
      .eq('key', key)
      .eq('type', type)
      .gte('timestamp', windowStart)
      .limit(1);

    if (selectError) {
      logger.error('Error querying rate limits:', selectError.message);
      throw new Error('Failed to check rate limit');
    }

    const existingRecord = existingRecords?.[0];

    if (existingRecord) {
      const updatedCount = existingRecord.request_count + 1;
      const remainingMinutes = Math.ceil((windowMs - (now - new Date(existingRecord.timestamp).getTime())) / 60000);
      const limitResetTimeAt = new Date(now + (remainingMinutes * 60000)).toISOString();
      logger.debug(`remainingMinutes: ${remainingMinutes}, try again after: ${limitResetTimeAt}`);

      if (updatedCount > limit) {
        return { isRateLimited: true, remainingRequests: 0, remainingMinutes, limitResetTimeAt };
      }

      // Update the existing record's request count
      const { error: updateError } = await supabase
        .from('rate_limits')
        .update({ request_count: updatedCount })
        .eq('id', existingRecord.id);

      if (updateError) {
        logger.error('Error updating rate limit:', updateError.message);
        throw new Error('Failed to update rate limit');
      }

      return { isRateLimited: false, remainingRequests: limit - updatedCount };
    } else {
      // Insert a new rate limit record
      const { error: insertError } = await supabase
        .from('rate_limits')
        .insert({
          key,
          type,
          timestamp: new Date().toISOString(),
          request_count: 1,
        });

      if (insertError) {
        logger.error('Error logging rate limit:', insertError.message);
        throw new Error('Failed to log rate limit');
      }

      return { isRateLimited: false, remainingRequests: limit - 1 };
    }
  } catch (error) {
    logger.error('Rate limiter error:', error.message);
    throw error;
  }
};
