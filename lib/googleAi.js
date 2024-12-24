// /lib/googleAi.js // updated
import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "@/lib/logger";

export async function fetchFromGoogleAI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    logger.error("GEMINI_API_KEY is not defined in the environment.");
    throw new Error("Server configuration error. Missing API key.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContent(prompt);

    if (!result || !result.response || typeof result.response.text !== "function") {
      logger.error("Unexpected API response structure:", result);
      throw new Error("Unexpected response from the Generative AI service.");
    }

    return result.response.text();
  } catch (error) {
    logger.error("Google Generative AI API error:", error.message || error);
    throw new Error("The AI service is currently unavailable or exceeded usage limits. Please try again later.");
  }
}
