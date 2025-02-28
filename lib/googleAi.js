import { GoogleGenerativeAI } from "@google/generative-ai";

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

  const genAI = new GoogleGenerativeAI(apiKey);
  const googleSearchTool = {
    function_declarations: [
      {
        name: "google_search",
        description: "Search web using Google.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query." },
          },
          required: ["query"],
        },
      },
    ],
  };

  const modelConfig = {
    model: useGoogleSearchGrounding
      ? "gemini-2.0-flash"
      : "gemini-2.0-flash-lite",
    ...(useGoogleSearchGrounding && { tools: [googleSearchTool] }),
    response_modalities: ["TEXT"],
  };

  const model = genAI.getGenerativeModel(modelConfig);
  const chat = model.startChat();

  try {
    let result = await chat.sendMessage(prompt);
    let finalResponseText = "";

    while (true) {
      if (
        !result ||
        !result.response ||
        typeof result.response.text !== "function"
      ) {
        logger.error("Unexpected API response:", result);
        throw new Error("AI service response error.");
      }

      const response = result.response;

      logger.debug("[googleAi] - Full API response:", response);

      if (
        response.candidates &&
        response.candidates[0].content &&
        response.candidates[0].content.parts
      ) {
        const parts = response.candidates[0].content.parts;
        const numberOfParts = parts.length;

        logger.debug("[googleAi] - Number of response parts:", numberOfParts);
        logger.debug("[googleAi] - Response parts present. Processing...");

        // Track all function calls before responding
        const functionCalls = [];

        for (const part of parts) {
          logger.debug("[googleAi] - Part:", part);
          if (part.functionCall) {
            const functionName = part.functionCall.name;
            const functionArgs = part.functionCall.args;

            logger.debug(`[googleAi] - Tool Call Detected: ${functionName}`);
            logger.debug(`[googleAi] - Tool Arguments:`, functionArgs);

            if (functionName === "google_search") {
              logger.debug("[googleAi] - Calling GoogleSearch...");
              const searchQuery = functionArgs.query;
              const searchResults = await fetchGoogleSearch(searchQuery);

              logger.debug("[googleAi] - Search Results:", searchResults);
              
              // Collect all function calls before responding
              functionCalls.push({
                name: functionName,
                response: { content: searchResults }
              });
            } else {
              logger.warn(`[googleAi] - Unknown Tool Function: ${functionName}. Ignoring.`);
            }
          } else if (part.text) {
            logger.debug("[googleAi] - Regular text response part found.");
            finalResponseText += part.text;
          } else {
            logger.warn("[googleAi] - Unknown response part type:", part);
          }
        }

        // After processing all parts, respond to ALL function calls at once
        if (functionCalls.length > 0) {
          logger.debug("[googleAi] - Sending tool responses back to model...");
          const functionResponses = functionCalls.map(call => ({
            functionResponse: {
              name: call.name,
              response: call.response
            }
          }));
          
          result = await chat.sendMessage(functionResponses);
          logger.debug("[googleAi] - Tool responses sent, waiting for model follow-up...");
          continue; // Process the model's response in the next iteration
        }
      } else {
        logger.debug("[googleAi] - No parts in response (likely final text response).");

        if (response && response.text) {
          finalResponseText += response.text();
        }
      }

      if (
        result &&
        result.response &&
        result.response.candidates[0].finishReason === "STOP"
      ) {
        logger.debug("[googleAi] - Response finished with STOP reason.");
        logger.debug("[googleAi] - Result:", result);
        logger.debug("[googleAi] - Response:", result.response);
        logger.debug("[googleAi] - Final Response Text:", result.response.text());

        if (result?.response?.text()) {
          finalResponseText += result.response.text();
        }

        break; // Exit loop when response is finished
      } else if (!result || !result.response) {
        logger.warn("[googleAi] - No more response or result is invalid, exiting loop.");
        break; // Exit loop if no valid response
      }
    }

    logger.debug("[googleAi] - Final Response Text:", finalResponseText);

    return finalResponseText.trim();
  } catch (error) {
    logger.error("Google Generative AI API error:", error.message || error);
    throw new Error("AI service unavailable. Please try again.");
  }
}

async function fetchGoogleSearch(query) {
  try {
    const res = await fetch(`${process.env.URL}/api/google-search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Error fetching search results.");

    return data.results.map((r) => `${r.title}: ${r.link}`).join("\n");
  } catch (error) {
    console.error("[googleAi] - Google Search Fetch Error:", error.message);

    return "Error fetching search results.";
  }
}