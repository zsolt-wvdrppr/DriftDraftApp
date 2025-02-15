// /lib/rateLimiter.js
import crypto from "crypto";

import { createClient } from '@supabase/supabase-js';

import logger from "@/lib/logger";

import handleAuthenticatedUserRateLimit from "./utils/handleUserRateLimit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Helper to securely hash strings
const hashValue = (value) => {
  return crypto.createHash("sha256").update(value).digest("hex");
};

// Enhanced helper to generate a unique key
const generateRateLimitKey = ({ userId, ip, userAgent, clientData }) => {
  if (userId) {
    // Authenticated user key
    return `${userId}`;
  }

  // For anonymous users, use IP + User-Agent + Device

  const fingerprint = `${ip || "unknown"}-${userAgent || "unknown"}-${clientData || "unknown"}`;

  return hashValue(fingerprint);
};

// Rate limiter function
export const rateLimiter = async ({
  userId,
  ip,
  type,
  userAgent,
  clientData,
  jwt,
  limit,
  requiredCredits,
}) => {
  const key = generateRateLimitKey({ userId, ip, userAgent, clientData });

  const headers = jwt ? { Authorization: `Bearer ${jwt}` } : {};

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers,
    },
  });

  let profileCredits = 0;

  try {
    if (userId) {
      logger.debug("Rate limiting for authenticated user:", userId);

      const authResult = await handleAuthenticatedUserRateLimit(userId, supabase, requiredCredits);

      if (authResult.isRateLimited) {
        return { isRateLimited: true, remainingRequests: 0, message: authResult.message };
      }

      profileCredits = authResult.profileCredits;
    }

    // Step 3: Query the rate limit for both authenticated and anonymous users
    const { data: existingRecords, error: selectError } = await supabase
      .from("rate_limits")
      .select("id, request_count")
      .eq("key", key)
      .eq("type", type)
      .limit(1);

    if (selectError) {
      logger.error("Error querying rate limits:", selectError.message);
      throw new Error("Failed to check rate limit");
    }

    const existingRecord = existingRecords?.[0];

    if (existingRecord) {

      const updatedCount = existingRecord.request_count + 1;

      if (!userId && updatedCount > limit) {
        return {
          isRateLimited: true,
          remainingRequests: 0,
        };
      }

      // Update the existing record's request count
      const { error: updateError } = await supabase
        .from("rate_limits")
        .update({ request_count: updatedCount })
        .eq("id", existingRecord.id);

      if (updateError) {
        logger.error("Error updating rate limit:", updateError.message);
        throw new Error("Failed to update rate limit");
      }

      return { isRateLimited: false, remainingRequests: !userId ? (limit - updatedCount) : profileCredits };
    } else {
      // Insert a new rate limit record
      const { error: insertError } = await supabase.from("rate_limits").insert({
        key,
        type,
        request_count: 1,
      });

      if (insertError) {
        logger.error("Error logging rate limit:", insertError.message);
        throw new Error("Failed to log rate limit");
      }

      return { isRateLimited: false, remainingRequests: !userId ? (limit - 1) : profileCredits };
    }
  } catch (error) {
    logger.error("Rate limiter error:", error.message);
    throw error;
  }
};
