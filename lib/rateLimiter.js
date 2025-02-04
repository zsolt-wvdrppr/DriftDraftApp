// /lib/rateLimiter.js
import crypto from "crypto";

import { createClient } from '@supabase/supabase-js';

import logger from "@/lib/logger";

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
  windowMs,
}) => {
  const key = generateRateLimitKey({ userId, ip, userAgent, clientData });
  const now = new Date().getTime();
  const windowStart = new Date(now - windowMs).toISOString();

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,  // Attach the user's JWT for RLS
      },
    },
  });

  try {
    if (userId) {
      logger.debug("Rate limiting for authenticated user:", userId);
      // Step 1: Check user's tier and credits
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("tier, credits")
        .eq("user_id", userId.trim())
        .single();

        if (profileError) {
          logger.error(`Error fetching user profile: ${profileError.message}`);
        } else if (!profile) {
          logger.warn(`Profile not found for userId: '${userId}'`);
        } else {
          logger.debug(`Found profile: ${JSON.stringify(profile)}`);
        }

      // Step 2: Handle rate limiting based on tier and credits, first check if user profile exists
      if (!profile) {
        logger.warn(`User profile not found for userId: ${userId}`);

        return {
          isRateLimited: true,
          remainingRequests: 0,
          message: 'User profile not found. Please register or check your credentials.',
        };
      }
      
      if (profile.tier === "free" && profile.credits <= 0) {
        return {
          isRateLimited: true,
          remainingRequests: 0,
          message: "No credits available. Please purchase more credits.",
        };
      }

      if (profile.tier === "free") {
        // Deduct 1 credit if on a free plan
        const { error: creditError } = await supabase
          .from("profiles")
          .update({ credits: profile.credits - 1 })
          .eq("user_id", userId);

        if (creditError) {
          logger.error("Error deducting user credit:", creditError.message);
          throw new Error("Failed to deduct credit");
        }
      }
    }

    // Step 3: Query the rate limit for both authenticated and anonymous users
    const { data: existingRecords, error: selectError } = await supabase
      .from("rate_limits")
      .select("id, request_count, timestamp")
      .eq("key", key)
      .eq("type", type)
      .gte("timestamp", windowStart)
      .limit(1);

    if (selectError) {
      logger.error("Error querying rate limits:", selectError.message);
      throw new Error("Failed to check rate limit");
    }

    const existingRecord = existingRecords?.[0];

    if (existingRecord) {
      const updatedCount = existingRecord.request_count + 1;
      const remainingMinutes = Math.ceil(
        (windowMs - (now - new Date(existingRecord.timestamp).getTime())) /
          60000
      );
      const limitResetTimeAt = new Date(
        now + remainingMinutes * 60000
      ).toISOString();

      logger.debug(
        `remainingMinutes: ${remainingMinutes}, try again after: ${limitResetTimeAt}`
      );

      if (updatedCount > limit) {
        return {
          isRateLimited: true,
          remainingRequests: 0,
          remainingMinutes,
          limitResetTimeAt,
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

      return { isRateLimited: false, remainingRequests: limit - updatedCount };
    } else {
      // Insert a new rate limit record
      const { error: insertError } = await supabase.from("rate_limits").insert({
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
    logger.error("Rate limiter error:", error.message);
    throw error;
  }
};
