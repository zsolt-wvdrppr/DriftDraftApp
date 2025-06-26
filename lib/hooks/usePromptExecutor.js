// File: lib/hooks/usePromptExecutor.js
// This file provides an enhanced hook to execute multiple AI prompts sequentially with advanced features

"use client";
import { useState } from "react";

import logger from "@/lib/logger";
import { getClientData } from "@/lib/hooks/useClientData";

/**
 * Enhanced hook to execute multiple prompts sequentially with:
 * - Multiple dependencies support (array or single number)
 * - Optional self-generated prompts
 * - Rate limit management
 * - Backward compatibility with old hook
 */
const usePromptExecutor = ({ executeRecaptcha, pickedModel, jwt }) => {
  const [executedPrompts, setExecutedPrompts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [output, setOutput] = useState([]);
  const [userMsg, setUserMsg] = useState("");
  const [hasCredits, setHasCredits] = useState(true);

  /**
   * Validates dependencies to prevent circular references
   */
  const validateDependencies = (prompts) => {
    for (let i = 0; i < prompts.length; i++) {
      const { dependsOn } = prompts[i];

      if (dependsOn !== undefined) {
        if (Array.isArray(dependsOn)) {
          // New format: array of specific dependencies
          for (const dep of dependsOn) {
            if (typeof dep !== "number" || dep < 0 || dep >= i) {
              throw new Error(
                `Invalid dependency: Prompt ${i} cannot depend on prompt ${dep}. Dependencies must reference earlier prompts only.`
              );
            }
          }
        } else if (typeof dependsOn === "number") {
          // Legacy format: single number (includes all previous up to that index)
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

  /**
   * Resolves dependencies and builds context string
   */
  const buildContextString = (dependsOn, results, prompts) => {
    if (dependsOn === undefined || results.length === 0) {
      return "";
    }

    let dependencies = [];

    if (Array.isArray(dependsOn)) {
      // New format: specific dependencies
      dependencies = dependsOn;
    } else if (typeof dependsOn === "number") {
      // Legacy format: all prompts from 0 to dependsOn (inclusive)
      dependencies = Array.from({ length: dependsOn + 1 }, (_, i) => i);
    }

    const contextParts = dependencies
      .filter((dep) => dep < results.length && results[dep] != null)
      .map((dep) => {
        const label = prompts[dep]?.label || `Prompt ${dep + 1}`;
        // Handle both string results (old format) and object results (new format)
        const content =
          typeof results[dep] === "string" ?
            results[dep]
          : results[dep]?.content || results[dep];

        if (!content) return null;

        return `=== ${label.toUpperCase()} ANALYSIS ===\n${content}`;
      })
      .filter(Boolean);

    return contextParts.length > 0 ?
        `\n\n=== CONTEXT FROM PREVIOUS ANALYSIS ===\n${contextParts.join("\n\n")}\n=== END CONTEXT ===`
      : "";
  };

  /**
   * Calculate total credits needed
   */
  const calculateRequiredCredits = (prompts, maxDepth = 3) => {
    const baseCredits = prompts.length;
    const selfGeneratedCredits =
      prompts.filter((p) => p.generateNewPrompts).length * maxDepth;

    return baseCredits + selfGeneratedCredits;
  };

  /**
   * Main function to execute prompts
   */
  const executePrompts = async (prompts, userId, maxDepth = 3) => {
    setLoading(true);
    setError(null);
    setUserMsg("");
    setOutput([]);
    setExecutedPrompts(0);

    // Validate dependencies
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
    const results = []; // Store all results as strings for backward compatibility

    logger.debug("Starting prompt execution", {
      totalPrompts: prompts.length,
      requiredCredits,
      dependencies: prompts.map((p) => ({
        label: p.label,
        dependsOn: p.dependsOn,
      })),
    });

    for (let index = 0; index < prompts.length; index++) {
      const { prompt, dependsOn, generateNewPrompts, label } = prompts[index];
      const promptLabel = label || `Prompt ${index + 1}`;

      try {
        // Build context from dependencies
        const contextString = buildContextString(dependsOn, results, prompts);
        const finalPrompt = prompt + contextString;

        logger.debug(
          `Executing ${promptLabel} (${index + 1}/${prompts.length})`
        );

        // Get reCAPTCHA token
        const token = await executeRecaptcha("submit_form");

        if (!token) {
          throw new Error(
            "Failed to generate reCAPTCHA token. Please try again."
          );
        }

        // Make API call
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
            pickedModel,
          }),
        });

        // Handle rate limiting
        if (response.status === 429) {
          const { message } = await response.json();

          setError("Exhausted Credits");
          setUserMsg(`Rate limit exceeded: ${message}`);
          setHasCredits(false);
          throw new Error("no credits");
        }

        if (!response.ok) {
          const errorData = await response.json();

          throw new Error(
            errorData.error || "An error occurred processing the prompt."
          );
        }

        const data = await response.json();

        setHasCredits(true);

        // Store result as string (backward compatibility)
        results.push(data.content);
        setExecutedPrompts((prev) => prev + 1);
        setUserMsg(`${promptLabel} executed successfully.`);

        logger.debug(`${promptLabel} completed`, {
          contentLength: data.content?.length || 0,
          hasContent: !!data.content,
        });

        // Handle self-generated prompts
        if (generateNewPrompts && maxDepth > 0) {
          const expansionPrompt = `Based on the following ${promptLabel.toLowerCase()} results, generate three additional focused prompts that would enhance this analysis:\n\n${data.content}\n\nGenerate prompts that would add valuable insights or address potential gaps in this analysis.`;

          logger.info(`Executing self-generated prompts for ${promptLabel}`);

          try {
            const selfGeneratedResults = await executePrompts(
              [
                {
                  prompt: expansionPrompt,
                  generateNewPrompts: false,
                  label: `${promptLabel} - Self-Generated`,
                },
              ],
              userId,
              maxDepth - 1
            );

            if (selfGeneratedResults.length > 0) {
              results.push(...selfGeneratedResults);
            }
          } catch (selfGenError) {
            logger.warn(
              `Self-generated prompts failed for ${promptLabel}:`,
              selfGenError
            );
            // Continue execution even if self-generated prompts fail
          }
        }
      } catch (error) {
        logger.error(`Error executing ${promptLabel}:`, error);

        // Enhanced error handling with specific messages
        if (error.message === "recaptcha_failed") {
          setError(
            `Security verification failed for ${promptLabel}. Please try again.`
          );
          setUserMsg(
            `ReCAPTCHA validation failed. The page will reload to retry.`
          );

          // Auto-retry after a brief delay
          setTimeout(() => {
            window.location.reload();
          }, 3000);

          break;
        } else if (error.message === "no credits") {
          // Already handled above
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

    setOutput(results);
    setLoading(false);

    logger.debug("Prompt execution completed", {
      totalResults: results.length,
      successful: results.length === prompts.length,
    });

    return results;
  };

  return {
    executePrompts,
    executedPrompts,
    output,
    loading,
    error,
    userMsg,
    hasCredits,
  };
};

export default usePromptExecutor;
