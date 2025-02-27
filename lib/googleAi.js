// /lib/googleAi.js // updated
import { GoogleGenerativeAI } from "@google/generative-ai";

import logger from "@/lib/logger";

const apiKey = process.env.GEMINI_API_KEY;

export async function fetchFromGoogleAI(_prompt) {
  let prompt = _prompt;
  let useGoogleSearch = false;

  // If prompt starts with [SEARCH-MODE], remove it and set Grounding with Google Search
  if (prompt.startsWith("[SEARCH-MODE]")) {
    prompt = prompt.replace("[SEARCH-MODE]", "");
    useGoogleSearch = false;
  }

  //logger.debug("Search Mode:", useGoogleSearch);
  logger.debug("[googleAi] - Prompt:", prompt);

  if (!apiKey) {
    logger.error("GEMINI_API_KEY is not defined in the environment.");
    throw new Error("Server configuration error. Missing API key.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Define Google Search as a Tool
  const googleSearchTool = {
    function_declarations: [
      {
        name: "google_search",
        description: "Use Google Search to get information from the web.", // Added description
        parameters: { // Added parameters definition
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query to use.",
            },
          },
          required: ["query"], // 'query' is a required parameter
        },
      },
    ],
  };

  // Model configuration with search tool if needed
  const modelConfig = {
    model: useGoogleSearch ? "gemini-2.0-flash" : "gemini-2.0-flash-lite",
    //...(useGoogleSearch && { tools: [googleSearchTool] }), // Add search tool if search mode is enabled
  };

  const model = genAI.getGenerativeModel(modelConfig);

  try {
    const result = await model.generateContent(prompt);

    if (
      !result ||
      !result.response ||
      typeof result.response.text !== "function"
    ) {
      logger.error("Unexpected API response structure:", result);
      throw new Error("Unexpected response from the Generative AI service.");
    }

    // log response to console
    logger.debug("Response:", result.response);
    // log response text to console
    logger.debug("Response Text:", result.response.text());

    return result.response.text();
  } catch (error) {
    logger.error("Google Generative AI API error:", error.message || error);
    throw new Error(
      "The AI service is currently unavailable or exceeded usage limits. Please try again later."
    );
  }
}
