// /api/aiReqRateLimited/route.js

import crypto from "crypto";

import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

import { rateLimiter } from "@/lib/rateLimiter";
import { fetchFromGoogleAI } from "@/lib/googleAi";
import logger from "@/lib/logger";

// Add after existing imports
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Gemini pricing per 1M tokens
const GEMINI_PRICING = {
  "gemini-2.5-flash": { input: 0.3, output: 2.5 },
  "gemini-2.0-flash": { input: 0.1, output: 0.4 },
  "gemini-1.5-flash": { input: 0.075, output: 0.3 },
};

// Token estimation function
const estimateTokenCount = (text) => Math.ceil(text.length / 4);

// Cost calculation function
const calculateCost = (model, inputTokens, outputTokens) => {
  const pricing = GEMINI_PRICING[model] || GEMINI_PRICING["gemini-2.5-flash"];
  const inputCost = (inputTokens / 1000000) * pricing.input;
  const outputCost = (outputTokens / 1000000) * pricing.output;

  return {
    inputCost: parseFloat(inputCost.toFixed(6)),
    outputCost: parseFloat(outputCost.toFixed(6)),
  };
};

// Helper to hash IP securely
const hashIp = (ip) => {
  const safeIp = ip || "unknown"; // Fallback to 'unknown' if IP is null

  return crypto.createHash("sha256").update(safeIp).digest("hex");
};

// Function to get the client IP
const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] || // First IP from x-forwarded-for
    req.headers["x-real-ip"] || // Use x-real-ip if available
    req.connection?.remoteAddress || // Fallback to remoteAddress
    req.socket?.remoteAddress || // Fallback to socket remoteAddress
    "unknown" // Final fallback
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
  const userAgent = req.headers.get("user-agent") || "unknown"; // Extract User-Agent
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
    const { prompt, clientData, token, pickedModel = null, sessionId } = body; // Extract prompt and clientData from the request body

    const requestId = uuidv4();

    logger.debug(`[RATE LIMITER API]: Session ID: ${sessionId}`);

    logger.debug(`[RATE LIMITER API]: Prompt received: ${prompt}`);
    logger.debug(
      `[RATE LIMITER API]: Client data: ${JSON.stringify(clientData)}`
    );
    logger.info("[RATE LIMITER API]: Picked model:", pickedModel);

    // Step 1: Validate reCAPTCHA Token - Removed due to recurring issues with reCAPTCHA during plan generation
    /*const isHuman = await verifyReCaptcha(token);

     if (!isHuman) {
       logger.warn(`[RATE LIMITER API]: ReCaptcha validation failed for user (${userId || ip}).`);

       return new Response(
         JSON.stringify({ message: "ReCaptcha verification failed. Are you a bot?" }),
         { status: 403, headers: { "Content-Type": "application/json" } }
       );
     }*/

    // Check rate limits
    const { isRateLimited, remainingRequests } = await rateLimiter({
      userId,
      ip: hashIp(ip), // Hash the IP securely
      type,
      userAgent,
      clientData,
      jwt,
      limit: 2, // Limit for unauthenticated users
      requiredCredits,
    });

    logger.debug(
      `[RATE LIMITER API]: Remaining requests for ${type} user (${userId || ip}): ${remainingRequests}`
    );

    if (isRateLimited) {
      logger.warn(
        `[RATE LIMITER API]: Rate limit exceeded for ${type} user (${userId || ip}).`
      );

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
      logger.debug(
        `[RATE LIMITER API]: AI response generated for ${type} user (${userId || ip}).`
      );
    } catch (aiError) {
      logger.error(`[RATE LIMITER API]: AI model error: ${aiError.message}`);

      return new Response(
        JSON.stringify({
          message: "Error fetching AI response. Please try again later.",
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const headers = jwt ? { Authorization: `Bearer ${jwt}` } : {};
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers },
    });

    // First create an ai_requests record (completed since it's synchronous)
    await supabase.from("ai_requests").insert({
      request_id: requestId,
      user_id: userId,
      session_id: sessionId,
      prompt_text: prompt,
      status: "completed",
      result_content: aiResponse,
      model_used: pickedModel || "gemini-2.5-flash",
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      processing_time_ms: 0, // Could track actual time if needed
    });

    // Track usage in database
    try {
      const inputTokens = estimateTokenCount(prompt);
      const outputTokens = estimateTokenCount(aiResponse);
      const costs = calculateCost(
        pickedModel || "gemini-2.5-flash",
        inputTokens,
        outputTokens
      );

      logger.debug(
        `[RATE LIMITER API]: userId: ${userId}, sessionId: ${sessionId}`
      );
      logger.debug(
        `[RATE LIMITER API]: Will attempt tracking: ${!!(userId && sessionId)}`
      );

      if (userId && sessionId) {
        logger.debug(`[RATE LIMITER API]: Starting usage tracking...`);

        const insertData = {
          user_id: userId,
          session_id: sessionId,
          request_id: requestId,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          model_used: pickedModel || "gemini-2.5-flash",
          input_cost_estimate: costs.inputCost,
          output_cost_estimate: costs.outputCost,
        };

        logger.debug(`[RATE LIMITER API]: Inserting data:`, insertData);

        const { data, error } = await supabase
          .from("usage_tracking")
          .insert(insertData);

        if (error) {
          logger.error(`[RATE LIMITER API]: Supabase insert error:`, error);
          throw new Error(`Database insert failed: ${error.message}`);
        }

        logger.info(
          `[RATE LIMITER API]: Usage tracked successfully - Input: ${inputTokens}, Output: ${outputTokens}, Cost: $${(costs.inputCost + costs.outputCost).toFixed(6)}`
        );
      } else {
        logger.warn(
          `[RATE LIMITER API]: Skipping usage tracking - missing userId: ${!!userId}, sessionId: ${!!sessionId}`
        );
      }
    } catch (trackingError) {
      logger.error(
        `[RATE LIMITER API]: Usage tracking failed:`,
        trackingError.message
      );
      logger.error(`[RATE LIMITER API]: Full tracking error:`, trackingError);
      // Don't fail the request if tracking fails
    }

    logger.debug(
      `[RATE LIMITER API]: Successfully processed request for ${type} user (${userId || ip}).`
    );

    // error if reponse is empty
    if (!aiResponse || aiResponse.trim() === "") {
      return new Response(
        JSON.stringify({
          content:
            "Policy violation detected by Generative AI. Please rephrase your answer.",
          remainingRequests,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        content: aiResponse,
        remainingRequests, // Include remaining requests
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    logger.error(
      `[RATE LIMITER API]: Error processing request: ${error.message}`
    );

    return new Response(
      JSON.stringify({
        message: "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
