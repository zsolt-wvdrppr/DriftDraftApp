import { GoogleGenAI } from "@google/genai";

import logger from "@/lib/logger";

const apiKey = process.env.GEMINI_API_KEY;

export async function fetchFromGoogleAI(_prompt) {
  let prompt = _prompt;
  let useGoogleSearchGrounding = false;

  if (prompt.startsWith("[SEARCH-GROUNDING]")) {
    prompt = prompt.replace("[SEARCH-GROUNDING]", "").trim();
    useGoogleSearchGrounding = true;
    logger.debug("[googleAi] - SEARCH-GROUNDING tag detected and processed.");
  }

  logger.debug("[googleAi] - Prompt:", prompt);

  if (!apiKey) {
    logger.error("GEMINI_API_KEY is missing.");
    throw new Error("Server config error: Missing API key.");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const config = {
      ...(useGoogleSearchGrounding && {
        tools: [
          {
            googleSearch: {},
          },
        ],
      }),
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      ...(Object.keys(config).length > 0 && { config }),
    });

    logger.debug("[googleAi] - Full API response:", response);

    let finalResponseText = response.text;

    logger.debug("[googleAi] - Final Response Text:", finalResponseText);

    // Only remove outer backticks if the ENTIRE response is just a code block
    if (
      finalResponseText.startsWith("```") &&
      finalResponseText.endsWith("```") &&
      !finalResponseText.includes("\n```\n") &&
      !finalResponseText.includes("\n```")
    ) {
      finalResponseText = finalResponseText.slice(3, -3).trim();
    }

    return finalResponseText.trim();
  } catch (error) {
    logger.error("Google Generative AI API error:", error.message || error);
    throw new Error("AI service unavailable. Please try again.");
  }
}
