import { calculateSimilarityPercentage } from "@/lib/hooks/useCompareStrings";
import logger from "@/lib/logger";
import { getClientData } from "@/lib/hooks/useClientData";
import { toast } from "sonner";

export const fetchAIHint = async ({
  stepNumber,
  prompt,
  content,
  setAiHint,
  setUserMsg,
  sessionData,
  updateFormData,
  executeRecaptcha,
  delay = 0,
}) => {
  const userId = sessionData?.userId || null;
  const clientData = getClientData();

  // Check for cached data to avoid redundant API calls
  const cachedResponse = sessionData?.formData?.[stepNumber]?.aiHint || null;
  const cachedPrompt = sessionData?.formData?.[stepNumber]?.prompt || null;

  if (cachedPrompt && calculateSimilarityPercentage(prompt, cachedPrompt) > 99.5) {
    logger.debug("Using cached response for similar prompt.");
    toast.dismiss();
    toast.error(
      `Your input hasn't changed significantly since the last hint. Try adjusting your answer further for a new suggestion.`,
      { classNames: { toast: "text-danger", title: "text-md font-semibold" } }
    );
    setAiHint(cachedResponse);
    setUserMsg("Using cached response for similar prompt.");
    return;
  }

  // Introduce optional delay if required for UX control
  if (delay > 0) {
    logger.debug(`Applying a delay of ${delay}ms before proceeding.`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  try {
    // Generate the reCAPTCHA token
    const token = await executeRecaptcha("submit_form");

    // Ensure token exists before proceeding
    if (!token) {
      throw new Error("Failed to generate a valid reCAPTCHA token. Please try again.");
    }

    // API request with reCAPTCHA token included
    const response = await fetch("/api/aiReqRateLimited", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId || "", 
      },
      body: JSON.stringify({ prompt, clientData, token }),
    });

    // Handle rate-limiting scenario
    if (response.status === 429) {
      const { message, remainingMinutes } = await response.json();
      const lastAiGeneratedHint = cachedResponse
        ? `--- *Last AI generated hint* ---\n${cachedResponse}`
        : "";

      setAiHint(`${content.hint}\n\n${lastAiGeneratedHint}\n`);
      setUserMsg(`\n\n${message} Upgrade for higher limits.`);
      return;
    }

    // Handle non-OK responses gracefully
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "An unknown error occurred.");
    }

    // Successful response handling
    const data = await response.json();
    const remainingRequestsYouHave = `\n\nYou have ${data.remainingRequests} credits remaining.`;
    const aiContent = `${data.content}` || content.hint;

    // Update UI and session state
    updateFormData(stepNumber, { aiHint: aiContent, prompt: prompt });
    setAiHint(`${aiContent}`);
    setUserMsg(remainingRequestsYouHave);

  } catch (error) {
    logger.warn("Error fetching AI hint:", error);
    setAiHint(content.hint);
    setUserMsg("An error occurred while generating content.");
  }
};
