import { calculateSimilarityPercentage } from "@/lib/hooks/useCompareStrings";
import logger from "@/lib/logger";
import { getClientData } from "@/lib/hooks/useClientData";

export const fetchAIHint = async ({
  stepNumber,
  prompt,
  content,
  setAiHint,
  setUserMsg,
  sessionData,
  updateFormData,
  delay = 0,
}) => {
  const userId = sessionData?.userId || null;

  const clientData = getClientData();

  const cachedResponse = sessionData?.formData?.[stepNumber]?.aiHint || null;
  const cachedPrompt = sessionData?.formData?.[stepNumber]?.prompt || null;

  if (cachedPrompt && calculateSimilarityPercentage(prompt, cachedPrompt) > 99.5) {
    logger.debug('prompt', prompt);
    logger.debug('cachedPrompt', cachedPrompt);
    logger.debug('similarity', calculateSimilarityPercentage(prompt, cachedPrompt));
    logger.debug("Using cached response for similar prompt. Skipping delay.");
    setAiHint(cachedResponse);
    setUserMsg("Using cached response for similar prompt.");
    logger.debug('[StepPurpose] Session data:', sessionData);
    return;
  }

  if (delay > 0) {
    logger.debug(`Applying a delay of ${delay}ms before proceeding.`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  try {
    const response = await fetch("/api/aiHintRateLimited", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId || "", // Pass userId if logged in
      },
      body: JSON.stringify({ prompt, clientData }),
    });

    if (response.status === 429) {
      const { message, remainingMinutes } = await response.json();
      const lastAiGeneratedHint = cachedResponse
        ? `--- *Last AI generated hint* ---\n${cachedResponse}`
        : "";

      setAiHint(
        `${content.hint}\n\n${lastAiGeneratedHint}\n`
      );
      setUserMsg(
        `\n\n${message} Upgrade for higher limits.`
      );
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "An unknown error occurred.");
    }

    const data = await response.json();
    const remainingRequestsYouHave = `\n\nYou have ${data.remainingRequests} requests remaining.`;
    const aiContent = `${data.content}` || content.hint;
    const userMsg = remainingRequestsYouHave;

    // Log remaining requests to the console
    logger.debug(`Remaining requests: ${data.remainingRequests}`);

    // Optionally, display remaining requests in the UI
    updateFormData(stepNumber, { aiHint: aiContent, prompt: prompt });
    setAiHint(`${aiContent}`);
    setUserMsg(userMsg);

    // Cache the response and prompt only on the client
    /*if (isBrowser) {
      localStorage.setItem(`aiResponse_${stepNumber}`, aiContent);
      localStorage.setItem(`aiResponse_${stepNumber}_prompt`, prompt);
    }*/
  } catch (error) {
    logger.warn("Error fetching AI hint:", error);
    setAiHint(content.hint);
    setUserMsg(`An error occurred while generating content.`);
  }
};
