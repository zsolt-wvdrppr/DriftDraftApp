// /lib/rateLimiter.js
import { supabase } from '@/lib/supabaseClient';
import crypto from 'crypto';

// Helper to hash IP securely
const hashIp = (ip) => {
  const safeIp = ip || 'unknown'; // Fallback to 'unknown' if IP is null
  return crypto.createHash('sha256').update(safeIp).digest('hex');
};

// Rate limiter function
export const rateLimiter = async ({ userId, ip, type, limit, windowMs }) => {
  const key = userId || hashIp(ip); // Use userId for authenticated users, hashed IP for anonymous
  const now = new Date().getTime();
  const windowStart = new Date(now - windowMs).toISOString();

  try {
    const { data: existingRecords, error: selectError } = await supabase
      .from("rate_limits")
      .select("id, request_count")
      .eq("key", key)
      .eq("type", type)
      .gte("timestamp", windowStart)
      .limit(1); // Ensure we check the latest record

    if (selectError) {
      logger.error("Error querying rate limits:", selectError.message);
      throw new Error("Failed to check rate limit");
    }

    const existingRecord = existingRecords?.[0];

    if (existingRecord) {
      const updatedCount = existingRecord.request_count + 1;

      if (updatedCount > limit) {
        return { isRateLimited: true, remainingRequests: 0 };
      }

      // Update the request_count
      const { error: updateError } = await supabase
        .from("rate_limits")
        .update({ request_count: updatedCount })
        .eq("id", existingRecord.id);

      if (updateError) {
        logger.error("Error updating rate limit:", updateError.message);
        throw new Error("Failed to update rate limit");
      }

      return { isRateLimited: false, remainingRequests: limit - updatedCount };
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from("rate_limits")
        .insert({
          key,
          type,
          timestamp: new Date().toISOString(),
          request_count: 1,
        });

      if (insertError) {
        logger.error("Error logging rate limit:", insertError.message);
        throw new Error("Failed to log rate limit");
      }

      return { isRateLimited: false, remainingRequests: limit - 1 };
    }
  } catch (error) {
    logger.error('Rate limiter error:', error.message);
    throw error;
  }
};
