"use client";
import { useState } from "react";

import logger from "@/lib/logger";
import { getClientData } from "@/lib/hooks/useClientData";

/**
 * Hook to execute multiple prompts sequentially with:
 * - Optional dependencies between prompts (`dependsOn`)
 * - Optional self-generated prompts (`generateNewPrompts`)
 * - Rate limit management
 * 
 * @param {string} userId - The user's ID used for rate limiting.
 * @returns {object} Hook functions for managing prompt execution.
 */
const usePromptExecutor = ({executeRecaptcha, pickedModel = null}) => {
    const [executedPrompts, setExecutedPrompts] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [output, setOutput] = useState([]);
    const [userMsg, setUserMsg] = useState('');

    /**
     * Executes a list of prompts sequentially with support for dependencies and self-prompting.
     * @param {Array<{prompt: string, dependsOn?: number, generateNewPrompts?: boolean}>} prompts
     * @param {string} userId - Used for rate limiting in the API.
     * @param {number} maxDepth - Limits recursive self-prompting to avoid infinite loops.
     */
    const executePrompts = async (prompts, userId, maxDepth = 3) => {
        setLoading(true);
        setError(null);
        setUserMsg('');
        setOutput([]);
        setExecutedPrompts(0);

        const clientData = getClientData();  // Used strictly for rate limiting
        const results = [];  // To store prompt outputs for dependencies

        for (let index = 0; index < prompts.length; index++) {
            const { prompt, dependsOn, generateNewPrompts } = prompts[index];

            logger.debug(`Executing prompt ${index + 1}:`, prompt);
            // ✅ Handling dependencies by referencing previous results
            const resolvedPrompt = dependsOn !== undefined
                ? `${prompt}\n\nPrevious Results:\n${results.slice(0, dependsOn + 1).join("\n\n")}`
                : prompt;

            try {
                const token = await executeRecaptcha("submit_form");

                if (!token) throw new Error("Failed to generate a valid reCAPTCHA token. Please try again.");

                // ✅ Call the AI API with rate limiting
                const response = await fetch("/api/aiReqRateLimited", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-user-id": userId,
                    },
                    body: JSON.stringify({ prompt: resolvedPrompt, clientData, token, pickedModel }),
                });

                // ✅ Rate limit handling
                if (response.status === 429) {
                    const { message } = await response.json();

                    setUserMsg(`Rate limit exceeded: ${message}`);
                    break;
                }

                if (!response.ok) {
                    const errorData = await response.json();

                    throw new Error(errorData.error || "An error occurred processing the prompt.");
                }

                const data = await response.json();

                results.push(data.content);
                setExecutedPrompts((prev) => prev + 1);
                setUserMsg(`Prompt ${index + 1} executed successfully.`);
                logger.debug(`Prompt ${index + 1} results:`, data.content);

                // ✅ Optional self-generated prompts (AI expanding the task)
                if (generateNewPrompts && maxDepth > 0) {
                    const expansionPrompt = `Generate three additional prompts based on the following results: ${data.content}`;

                    logger.info("Expanding prompts with AI suggestion...");
                    await executePrompts([{ prompt: expansionPrompt, generateNewPrompts: false }], userId, maxDepth - 1);
                }

            } catch (error) {
                logger.error("Error during prompt execution:", error);
                setError(error.message);
                break;
            }
        }

        setOutput(results);
        setLoading(false);

        return results;  // ✅ Return results for external handling
    };

    return { executePrompts, executedPrompts, output, loading, error, userMsg };
};

export default usePromptExecutor;
