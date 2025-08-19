// /api/trigger-ai-request/route.js

import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

import logger from "@/lib/logger";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Function to get the client IP
const getClientIp = (req) => {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
};

export async function POST(req) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || "unknown";
  const userId = req.headers.get("x-user-id") || null;
  const requiredCredits = req.headers.get("x-required-credits") || 1;
  const jwt = req.headers.get("Authorization")?.split(" ")[1];

  try {
    const body = await req.json();
    const {
      sessionId,
      prompt,
      clientData,
      pickedModel = "gemini-2.5-flash",
    } = body;

    if (!sessionId || !prompt) {
      return new Response(
        JSON.stringify({ error: "sessionId and prompt are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate unique request ID
    const requestId = uuidv4();

    logger.info(
      `[TRIGGER] Creating AI request ${requestId} for session ${sessionId}`
    );

    // Initialize Supabase
    const headers = jwt ? { Authorization: `Bearer ${jwt}` } : {};
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers },
    });

    // Create initial AI request record
    const { error: insertError } = await supabase.from("ai_requests").insert({
      request_id: requestId,
      user_id: userId,
      session_id: sessionId,
      prompt_text: prompt,
      model_used: pickedModel,
      status: "pending",
    });

    if (insertError) {
      logger.error(`[TRIGGER] Failed to create AI request:`, insertError);
      throw new Error(`Failed to create AI request: ${insertError.message}`);
    }

    // Prepare payload for background function
    const backgroundPayload = {
      requestId,
      userId,
      sessionId,
      prompt,
      clientData,
      userAgent,
      ip,
      pickedModel,
      requiredCredits,
      jwt,
    };

    // Trigger the background function
    const backgroundResponse = await fetch(
      `${process.env.URL}/.netlify/functions/ai-request-background`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backgroundPayload),
      }
    );

    if (!backgroundResponse.ok) {
      // Update the request status to failed
      await supabase
        .from("ai_requests")
        .update({
          status: "failed",
          error_message: `Background function failed: ${backgroundResponse.status}`,
        })
        .eq("request_id", requestId);

      throw new Error(
        `Background function failed: ${backgroundResponse.status}`
      );
    }

    logger.info(
      `[TRIGGER] Background function triggered successfully for request ${requestId}`
    );

    // Return immediate response with request ID
    return new Response(
      JSON.stringify({
        success: true,
        requestId,
        status: "pending",
        message: "AI request started",
      }),
      {
        status: 202, // Accepted
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    logger.error(`[TRIGGER] Error triggering AI request:`, error.message);

    return new Response(
      JSON.stringify({
        error: "Failed to start AI request",
        message: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
