// netlify/functions/ai-request-background.js

import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

import { fetchFromGoogleAI } from "../../lib/googleAi.js";
import { rateLimiter } from "../../lib/rateLimiter.js";
import logger from "../../lib/logger.js";

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Gemini pricing per 1M tokens (as of 2024 - update as needed)
const GEMINI_PRICING = {
  "gemini-2.5-flash": { input: 0.30, output: 2.50 },
  "gemini-2.0-flash": { input: 0.10, output: 0.40 },
  "gemini-1.5-flash": { input: 0.075, output: 0.30 },
};

// Rate limiter hash function
const hashValue = (value) => {
  return crypto.createHash("sha256").update(value).digest("hex");
};

// Helper to hash IP securely
const hashIp = (ip) => {
  const safeIp = ip || "unknown"; // Fallback to 'unknown' if IP is null
  return crypto.createHash("sha256").update(safeIp).digest("hex");
};

// Calculate token count for Gemini (approximation until official counting is available)
const estimateTokenCount = (text) => {
  // Rough estimation: ~4 characters per token for English text
  // This is approximate - Gemini doesn't provide exact token counting yet
  return Math.ceil(text.length / 4);
};

// Calculate cost based on model and token usage
const calculateCost = (model, inputTokens, outputTokens) => {
  const pricing = GEMINI_PRICING[model] || GEMINI_PRICING["gemini-2.5-flash"];

  const inputCost = (inputTokens / 1000000) * pricing.input;
  const outputCost = (outputTokens / 1000000) * pricing.output;

  return {
    inputCost: parseFloat(inputCost.toFixed(6)),
    outputCost: parseFloat(outputCost.toFixed(6)),
    totalCost: parseFloat((inputCost + outputCost).toFixed(6)),
  };
};

// Main background function
const main = async (req, context) => {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const {
      requestId,
      userId,
      sessionId,
      prompt,
      clientData,
      userAgent,
      ip,
      pickedModel = "gemini-2.5-flash",
      requiredCredits = 1,
      jwt,
    } = body;

    logger.info(`[AI-BG] Starting request ${requestId} for user ${userId}`);

    // Initialize Supabase with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update request status to processing
    await supabase
      .from("ai_requests")
      .update({
        status: "processing",
        model_used: pickedModel,
      })
      .eq("request_id", requestId);

    // Check rate limits using your existing function
    const { isRateLimited, remainingRequests } = await rateLimiter({
      userId,
      ip: hashIp(ip), // Hash the IP securely like in your original
      type: userId ? "authenticated" : "anonymous",
      userAgent,
      clientData,
      jwt, // Pass the actual JWT
      limit: 2,
      requiredCredits, // Use the actual required credits
    });

    if (isRateLimited) {
      await supabase
        .from("ai_requests")
        .update({
          status: "failed",
          error_message: `Rate limit exceeded. ${remainingRequests} requests remaining.`,
        })
        .eq("request_id", requestId);

      logger.info(`[AI-BG] Rate limited for request ${requestId}`);
      return;
    }

    // Estimate input tokens
    const inputTokens = estimateTokenCount(prompt);

    // Generate AI response using your existing function
    const aiContent = await fetchFromGoogleAI(prompt, pickedModel);

    if (!aiContent || aiContent.trim() === "") {
      throw new Error("Empty response from AI service");
    }

    // Estimate output tokens
    const outputTokens = estimateTokenCount(aiContent);

    // Calculate costs
    const costs = calculateCost(pickedModel, inputTokens, outputTokens);

    const processingTime = Date.now() - startTime;

    // Update ai_requests table
    await supabase
      .from("ai_requests")
      .update({
        status: "completed",
        result_content: aiContent,
        completed_at: new Date().toISOString(),
        processing_time_ms: processingTime,
      })
      .eq("request_id", requestId);

    // Insert usage tracking
    await supabase.from("usage_tracking").insert({
      user_id: userId,
      session_id: sessionId,
      request_id: requestId,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      model_used: pickedModel,
      input_cost_estimate: costs.inputCost,
      output_cost_estimate: costs.outputCost,
    });

    // Update rate limits - same logic as your original API
    try {
      await rateLimiter({
        userId,
        ip: hashIp(ip),
        type: userId ? "authenticated" : "anonymous",
        userAgent,
        clientData,
        jwt,
        limit: 2,
        requiredCredits: 1, // This call is to update the counter after successful processing
      });
    } catch (rateLimitError) {
      logger.warn(
        `[AI-BG] Rate limit update failed: ${rateLimitError.message}`
      );
      // Don't throw error since the main AI processing succeeded
    }

    logger.info(
      `[AI-BG] Successfully completed request ${requestId} in ${processingTime}ms`
    );
    logger.info(
      `[AI-BG] Tokens - Input: ${inputTokens}, Output: ${outputTokens}, Cost: ${costs.totalCost}`
    );
  } catch (error) {
    logger.error(`[AI-BG] Error processing request:`, error.message);

    const processingTime = Date.now() - startTime;

    try {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from("ai_requests")
        .update({
          status: "failed",
          error_message: error.message,
          completed_at: new Date().toISOString(),
          processing_time_ms: processingTime,
        })
        .eq("request_id", body?.requestId);
    } catch (updateError) {
      logger.error(
        `[AI-BG] Failed to update error status:`,
        updateError.message
      );
    }
  }
};

export default main;
