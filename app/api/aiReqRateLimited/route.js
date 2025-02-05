// /api/aiReqRateLimited/route.js

import crypto from "crypto";

import { rateLimiter } from "@/lib/rateLimiter";
import { fetchFromGoogleAI } from "@/lib/googleAi";
import logger from "@/lib/logger";
import { formatTimeToLocalAMPM } from '@/lib/utils/utils';

// Helper to hash IP securely
const hashIp = (ip) => {
  const safeIp = ip || "unknown"; // Fallback to 'unknown' if IP is null

  return crypto.createHash("sha256").update(safeIp).digest("hex");
};

// Function to get the client IP
const getClientIp = (req) => { 
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] || // First IP from x-forwarded-for
    req.headers["x-real-ip"] ||                     // Use x-real-ip if available
    req.connection?.remoteAddress ||               // Fallback to remoteAddress
    req.socket?.remoteAddress ||                   // Fallback to socket remoteAddress
    "unknown"                                      // Final fallback
  );
};

async function verifyReCaptcha(token) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  const res = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `secret=${secret}&response=${token}`,
  });

  const data = await res.json();

  return data.success;
}


export async function POST(req) {
  const ip = getClientIp(req); // Retrieve IP address
  const userAgent = req.headers.get('user-agent') || 'unknown'; // Extract User-Agent
  const userId = req.headers.get("x-user-id") || null; // Get userId for authenticated users
  const requiredCredits = req.headers.get("x-required-credits") || 1;
  const jwt = req.headers.get("Authorization")?.split(" ")[1]; // Extract the JWT token
  const type = userId ? "authenticated" : "anonymous";

  // debug required credits
  logger.debug(`[RATE LIMITER API]: Required credits: ${requiredCredits}`);

  if (!jwt) {
    logger.warn("No JWT token provided. Handling as anonymous.");
  }

  try {
    const body = await req.json();
    const { prompt, clientData, token, pickedModel = null } = body; // Extract prompt and clientData from the request body

    logger.debug(`[RATE LIMITER API]: Prompt received: ${prompt}`);
    logger.debug(`[RATE LIMITER API]: Client data: ${JSON.stringify(clientData)}`);
    logger.info('[RATE LIMITER API]: Picked model:', pickedModel);

     // Step 1: Validate reCAPTCHA Token
     const isHuman = await verifyReCaptcha(token);

     if (!isHuman) {
       logger.warn(`[RATE LIMITER API]: ReCaptcha validation failed for user (${userId || ip}).`);

       return new Response(
         JSON.stringify({ message: "ReCaptcha verification failed. Are you a bot?" }),
         { status: 403, headers: { "Content-Type": "application/json" } }
       );
     }


    // Check rate limits
    const { isRateLimited, remainingRequests } = await rateLimiter({
      userId,
      ip: hashIp(ip), // Hash the IP securely
      type,
      userAgent,
      clientData,
      jwt,
      limit: userId ? 60 : 2, // Higher limit for authenticated users
      requiredCredits,
    });

    logger.debug(`[RATE LIMITER API]: Remaining requests for ${type} user (${userId || ip}): ${remainingRequests}`);

    if (isRateLimited) {
      logger.warn(`[RATE LIMITER API]: Rate limit exceeded for ${type} user (${userId || ip}).`);

      return new Response(
        JSON.stringify({
          message: `Credits exhausted.`,
          remainingRequests,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch AI response
    let aiResponse;

    try {
      aiResponse = await fetchFromGoogleAI(prompt, pickedModel);
      logger.debug(`[RATE LIMITER API]: AI response generated for ${type} user (${userId || ip}).`);
    } catch (aiError) {
      logger.error(`[RATE LIMITER API]: AI model error: ${aiError.message}`);

      return new Response(
        JSON.stringify({
          message: "Error fetching AI response. Please try again later.",
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    logger.debug(`[RATE LIMITER API]: Successfully processed request for ${type} user (${userId || ip}).`);

    return new Response(
      JSON.stringify({
        content: aiResponse,
        remainingRequests, // Include remaining requests
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    logger.error(`[RATE LIMITER API]: Error processing request: ${error.message}`);

    return new Response(
      JSON.stringify({
        message: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
