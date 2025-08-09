/** ⚠️ WARNING! This API route bypasses request limiter */
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

import logger from "@/lib/logger";

export async function POST(req) {
  try {
    // Parse the request body
    const { prompt, pickedModel = null } = await req.json();

    // Ensure prompt is provided
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    // Check if API key exists
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      logger.error("GEMINI_API_KEY is not defined in the environment.");

      return NextResponse.json(
        { error: "Server configuration error. Missing API key." },
        { status: 500 }
      );
    }

    // Initialise the Google Generative AI client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: pickedModel !== null ? "gemini-2.5-flash" : "gemini-2.5-flash" });
   
    logger.info(`[GOOGLE AI] Using model: ${model.model}`);

    try {
      // Generate content from the API
      const result = await model.generateContent(prompt);

      // Validate the response structure
      if (!result || !result.response || typeof result.response.text !== "function") {
        logger.error("Unexpected API response structure:", result);

        return NextResponse.json(
          { error: "Unexpected response from the Generative AI service." },
          { status: 502 }
        );
      }

      // Return the generated content
      return NextResponse.json({ content: result.response.text() });
    } catch (apiError) {
      // Handle API-specific errors, such as rate limits or other service issues
      logger.error("Google Generative AI API error:", apiError.message || apiError);

      // Return a user-friendly error message
      return NextResponse.json(
        {
          error: "The AI service is currently unavailable or exceeded usage limits. Please try again later.",
        },
        { status: 503 } // 503 Service Unavailable is appropriate for server-side issues
      );
    }
  } catch (error) {
    // Handle general server-side errors
    logger.error("Unexpected server error:", error.message || error);

    return NextResponse.json(
      { error: "An unexpected error occurred on the server." },
      { status: 500 }
    );
  }
}
