// File: lib/hooks/usePromptExecutor.js
// Enhanced version with reliable section markers and structured output

"use client";
import { useState } from "react";

import logger from "@/lib/logger";
import { getClientData } from "@/lib/hooks/useClientData";

const usePromptExecutor = ({ executeRecaptcha, pickedModel, jwt }) => {
  const [executedPrompts, setExecutedPrompts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState([]); // Backward compatibility
  const [structuredOutput, setStructuredOutput] = useState([]); // NEW: Structured sections
  const [userMsg, setUserMsg] = useState("");
  const [hasCredits, setHasCredits] = useState(true);

  const validateDependencies = (prompts) => {
    for (let i = 0; i < prompts.length; i++) {
      const { dependsOn } = prompts[i];

      if (dependsOn !== undefined) {
        if (Array.isArray(dependsOn)) {
          for (const dep of dependsOn) {
            if (typeof dep !== "number" || dep < 0 || dep >= i) {
              throw new Error(
                `Invalid dependency: Prompt ${i} cannot depend on prompt ${dep}. Dependencies must reference earlier prompts only.`
              );
            }
          }
        } else if (typeof dependsOn === "number") {
          if (dependsOn < 0 || dependsOn >= i) {
            throw new Error(
              `Invalid dependency: Prompt ${i} cannot depend on prompt ${dependsOn}. Dependencies must reference earlier prompts only.`
            );
          }
        } else {
          throw new Error(
            `Invalid dependency format for prompt ${i}: ${dependsOn}. Must be number or array of numbers.`
          );
        }
      }
    }

    return true;
  };

  const buildContextString = (dependsOn, results, prompts) => {
    if (dependsOn === undefined || results.length === 0) {
      return "";
    }

    let dependencies = [];

    if (Array.isArray(dependsOn)) {
      dependencies = dependsOn;
    } else if (typeof dependsOn === "number") {
      dependencies = Array.from({ length: dependsOn + 1 }, (_, i) => i);
    }

    const contextParts = dependencies
      .filter((dep) => dep < results.length && results[dep] != null)
      .map((dep) => {
        const label = prompts[dep]?.label || `Prompt ${dep + 1}`;
        const content =
          typeof results[dep] === "string" ? results[dep] : results[dep];

        if (!content) return null;

        return `=== ${label.toUpperCase()} ANALYSIS ===\n${content}`;
      })
      .filter(Boolean);

    return contextParts.length > 0 ?
        `\n\n=== CONTEXT FROM PREVIOUS ANALYSIS ===\n${contextParts.join("\n\n")}\n=== END CONTEXT ===`
      : "";
  };

  const calculateRequiredCredits = (prompts, maxDepth = 3) => {
    const baseCredits = prompts.length;
    const selfGeneratedCredits =
      prompts.filter((p) => p.generateNewPrompts).length * maxDepth;

    return baseCredits + selfGeneratedCredits;
  };

  // Extract summary from section content
  const extractSummary = (content) => {
    // Look for bullet points or first few sentences
    const lines = content.split("\n").filter((line) => line.trim());

    // Find first bullet point or first substantial line
    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith("- ") && trimmed.length > 10) {
        return trimmed.replace("- ", "").substring(0, 100) + "...";
      }
      if (
        trimmed.length > 20 &&
        !trimmed.startsWith("#") &&
        !trimmed.startsWith("**")
      ) {
        return trimmed.substring(0, 100) + "...";
      }
    }

    return "Strategic analysis and recommendations";
  };

  const executePrompts = async (prompts, userId, maxDepth = 3) => {
    setLoading(true);
    setError(null);
    setUserMsg("");
    setOutput([]);
    setStructuredOutput([]);
    setExecutedPrompts(0);

    try {
      validateDependencies(prompts);
    } catch (validationError) {
      logger.error("Dependency validation failed:", validationError);
      setError(validationError.message);
      setLoading(false);

      return [];
    }

    const requiredCredits = calculateRequiredCredits(prompts, maxDepth);
    const clientData = getClientData();
    const results = []; // For backward compatibility
    const structuredResults = []; // NEW: Store structured sections

    logger.debug("Starting prompt execution", {
      totalPrompts: prompts.length,
      requiredCredits,
    });

    for (let index = 0; index < prompts.length; index++) {
      const { prompt, dependsOn, generateNewPrompts, label } = prompts[index];
      const promptLabel = label || `Section ${index + 1}`;

      try {
        const contextString = buildContextString(dependsOn, results, prompts);
        const finalPrompt = prompt + contextString;

        logger.debug(
          `Executing ${promptLabel} (${index + 1}/${prompts.length})`
        );

        const token = await executeRecaptcha("submit_form");

        if (!token) {
          throw new Error(
            "Failed to generate reCAPTCHA token. Please try again."
          );
        }

        // Timeout and retry logic
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

        const response = await fetch("/api/aiReqRateLimited", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: jwt ? `Bearer ${jwt}` : "",
            "x-user-id": userId,
            "x-required-credits": requiredCredits - index,
          },
          body: JSON.stringify({
            prompt: finalPrompt,
            clientData,
            token,
            pickedModel: pickedModel || "gemini-2.5-flash", // Use faster model as default
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle timeout responses
        if (response.status === 504 || response.status === 502) {
          throw new Error(
            "Request timed out."
          );
        }

        if (response.status === 429) {
          const { message } = await response.json();

          setError("Exhausted Credits");
          setUserMsg(`Rate limit exceeded: ${message}`);
          setHasCredits(false);
          throw new Error("no credits");
        }

        if (!response.ok) {
          // Check if response is HTML (error page) instead of JSON
          const contentType = response.headers.get("content-type");

          if (contentType && contentType.includes("text/html")) {
            throw new Error(
              "Server timeout. Please try again with a shorter prompt."
            );
          }

          const errorData = await response.json();

          throw new Error(
            errorData.error || "An error occurred processing the prompt."
          );
        }

        const data = await response.json();

        setHasCredits(true);

        // Store results
        results.push(data.content); // Backward compatibility

        // NEW: Create structured section
        const structuredSection = {
          id: `section_${index}`,
          label: promptLabel,
          content: data.content,
          summary: extractSummary(data.content),
          order: index,
          timestamp: new Date().toISOString(),
        };

        structuredResults.push(structuredSection);

        setExecutedPrompts((prev) => prev + 1);
        setUserMsg(`${promptLabel} executed successfully.`);

        logger.debug(`${promptLabel} completed`);

        // Handle self-generated prompts if needed
        if (generateNewPrompts && maxDepth > 0) {
          // Keep existing self-generation logic if you use it
        }
      } catch (error) {
        logger.error(`Error executing ${promptLabel}:`, error);

        if (error.name === "AbortError") {
          setError(
            `${promptLabel} timed out.`
          );
          setUserMsg(
            `Request was too slow and timed out.`
          );
          break;
        }

        if (error.message === "recaptcha_failed") {
          setError(
            `Security verification failed for ${promptLabel}. Please try again.`
          );
          setUserMsg(
            `ReCAPTCHA validation failed. The page will reload to retry.`
          );
          setTimeout(() => {
            window.location.reload();
          }, 3000);
          break;
        } else if (error.message === "no credits") {
          break;
        } else {
          setError(`Failed at ${promptLabel}: ${error.message}`);
          setUserMsg(
            `Error in ${promptLabel}. You can try refreshing the page.`
          );
        }
        break;
      }
    }

    setOutput(results); // Backward compatibility
    setStructuredOutput(structuredResults); // NEW: Structured sections
    setLoading(false);

    logger.debug("Prompt execution completed", {
      totalResults: results.length,
      structured: structuredResults.length,
      successful: results.length === prompts.length,
    });

    return results; // Keep backward compatibility
  };

  // NEW: Get combined output with clear section markers for storage
  const getCombinedOutputWithMarkers = () => {
    return structuredOutput
      .map((section) => {
        return `<!-- SECTION_START: ${section.id} | ${section.label} -->
# ${section.label}

${section.content}

<!-- SECTION_END: ${section.id} | ${section.label} -->`;
      })
      .join("\n\n");
  };

  // NEW: Get legacy combined output (for backward compatibility)
  const getLegacyCombinedOutput = () => {
    return output.join("\n\n");
  };

  return {
    executePrompts,
    executedPrompts,
    output, // Backward compatibility
    structuredOutput, // NEW: Structured sections for new UI
    getCombinedOutputWithMarkers, // NEW: For storage with markers
    getLegacyCombinedOutput, // NEW: For backward compatibility
    loading,
    error,
    userMsg,
    hasCredits,
  };
};

export default usePromptExecutor;
