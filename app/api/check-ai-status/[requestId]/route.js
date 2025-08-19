// /api/check-ai-status/[requestId]/route.js

import { createClient } from "@supabase/supabase-js";

import logger from "@/lib/logger";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(req, { params }) {
  const { requestId } = await params;
  const userId = req.headers.get("x-user-id") || null;
  const jwt = req.headers.get("Authorization")?.split(" ")[1];

  try {
    if (!requestId) {
      return new Response(JSON.stringify({ error: "requestId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Initialize Supabase
    const headers = jwt ? { Authorization: `Bearer ${jwt}` } : {};
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers },
    });

    // Fetch AI request status
    let query = supabase
      .from("ai_requests")
      .select(
        `
        request_id,
        status,
        result_content,
        error_message,
        processing_time_ms,
        created_at,
        completed_at,
        model_used
      `
      )
      .eq("request_id", requestId);

    // If user is authenticated, add user filter for security
    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") {
        return new Response(
          JSON.stringify({
            error: "Request not found",
            requestId,
          }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      logger.error(`[CHECK-STATUS] Database error:`, error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      return new Response(
        JSON.stringify({
          error: "Request not found",
          requestId,
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Prepare response based on status
    const response = {
      requestId: data.request_id,
      status: data.status,
      createdAt: data.created_at,
      modelUsed: data.model_used,
    };

    // Add completed data if finished
    if (data.status === "completed") {
      response.result = data.result_content;
      response.completedAt = data.completed_at;
      response.processingTimeMs = data.processing_time_ms;
    }

    // Add error data if failed
    if (data.status === "failed") {
      response.error = data.error_message;
      response.completedAt = data.completed_at;
      response.processingTimeMs = data.processing_time_ms;
    }

    // Optionally fetch usage data for completed requests
    if (data.status === "completed" && userId) {
      const { data: usageData } = await supabase
        .from("usage_tracking")
        .select(
          `
          input_tokens,
          output_tokens,
          total_tokens,
          input_cost_estimate,
          output_cost_estimate,
          total_cost_estimate
        `
        )
        .eq("request_id", requestId)
        .eq("user_id", userId)
        .single();

      if (usageData) {
        response.usage = usageData;
      }
    }

    logger.debug(`[CHECK-STATUS] Request ${requestId} status: ${data.status}`);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error(
      `[CHECK-STATUS] Error checking request status:`,
      error.message
    );

    return new Response(
      JSON.stringify({
        error: "Failed to check request status",
        message: error.message,
        requestId,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
