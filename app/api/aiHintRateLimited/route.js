import { rateLimiter } from "@/lib/rateLimiter";
import { fetchFromGoogleAI } from "@/lib/googleAi";
import crypto from "crypto";
import logger from "@/lib/logger";

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

export async function POST(req) {
  const ip = getClientIp(req); // Retrieve IP address
  const userAgent = req.headers.get('user-agent') || 'unknown'; // Extract User-Agent
  const userId = req.headers.get("x-user-id") || null; // Get userId for authenticated users
  const type = userId ? "authenticated" : "anonymous";
  const oneHour = 60 * 60 * 1000; // 1-hour window

  logger.debug(`[RATE LIMITER API]: Received request from ${type} user (${userId || ip}).`);

  try {
    const body = await req.json();
    const { prompt, clientData } = body; // Extract prompt and clientData from the request body

    logger.debug(`[RATE LIMITER API]: Prompt received: ${prompt}`);
    logger.debug(`[RATE LIMITER API]: Client data: ${JSON.stringify(clientData)}`);

    // Check rate limits
    const { isRateLimited, remainingRequests } = await rateLimiter({
      userId,
      ip: hashIp(ip), // Hash the IP securely
      type,
      userAgent,
      clientData,
      limit: userId ? 60 : 18, // Higher limit for authenticated users
      windowMs: oneHour, // 1-hour window
    });

    logger.debug(`[RATE LIMITER API]: Remaining requests for ${type} user (${userId || ip}): ${remainingRequests}`);

    if (isRateLimited) {
      logger.warn(`[RATE LIMITER API]: Rate limit exceeded for ${type} user (${userId || ip}).`);
      return new Response(
        JSON.stringify({
          message: "Rate limit exceeded.",
          remainingRequests,
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch AI response
    let aiResponse;
    try {
      aiResponse = await fetchFromGoogleAI(prompt);
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
