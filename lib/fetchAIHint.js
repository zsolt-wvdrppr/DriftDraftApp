export const fetchAIHint = async ({
  stepNumber,
  prompt,
  content,
  checkRateLimit,
  logger,
  incrementCounter,
  setAiHints,
  delay = 0, // Adding delay parameter with default value of 0
}) => {
  const cachedResponse = localStorage.getItem(`aiResponse_${stepNumber}`);
  const cachedPrompt = localStorage.getItem(`aiResponse_${stepNumber}_prompt`);

  // Check if the prompt matches the cached prompt
  if (cachedPrompt === prompt && cachedResponse) {
    logger.debug("Using cached response for identical prompt. Skipping delay.");
    setAiHints(cachedResponse);
    return;
  }

  // Apply delay only if the cached response condition is not met
  if (delay > 0) {
    logger.debug(`Applying a delay of ${delay}ms before proceeding.`);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // Check for rate limit
  if (checkRateLimit()) {
    logger.info("Rate limited");

    const lastAiGeneratedHint = cachedResponse
      ? `--- *Last AI generated hint* ---\n${cachedResponse}`
      : "";

    // Calculate remaining time for rate limit expiration
    const limitExpires = new Date(
      parseInt(localStorage.getItem(`aiResponse_${stepNumber}_timestamp`), 10) +
      3 * 60 * 60 * 1000
    );
    const limitExpiresInMinutes = Math.floor((limitExpires - new Date()) / 60000);

    // Set rate-limited hints
    setAiHints(
      `*AI assistance limit reached for this step. Try again in ${limitExpiresInMinutes} minutes.*\n\n${content.hints}\n\n${lastAiGeneratedHint}`
    );

    localStorage.setItem(`aiResponse_${stepNumber}_prompt`, prompt);
    //logger.debug("Cached prompt saved:", { stepNumber, prompt });

    return;
  }

  try {
    const response = await fetch("/api/googleAi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      throw new Error(errorData.error || "An unknown error occurred.");
    }

    const data = await response.json();
    const aiContent = `**Service description:**\n ${data.content}` || content.hints;

    // Cache the response and prompt
    localStorage.setItem(`aiResponse_${stepNumber}`, aiContent);
    localStorage.setItem(`aiResponse_${stepNumber}_prompt`, prompt);
    //logger.debug("Cached prompt saved:", { stepNumber, prompt });
    localStorage.setItem(
      `aiResponse_${stepNumber}_timestamp`,
      Date.now().toString()
    );
    setAiHints(aiContent);

    // Increment request count
    incrementCounter();
  } catch (error) {
    logger.warn("Error fetching content:", error);
    setAiHints(`An error occurred while generating content.\n\n${content.hints}`);
  }
};
