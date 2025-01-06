"use client";
import { useState } from "react";
import logger from "@/lib/logger";
import { getClientData } from "@/lib/hooks/useClientData";

/**
 * Hook for executing multiple prompts sequentially.
 * No session or form data management is handled here.
 * 
 * @param {string} userId - User ID for rate limiting and API request purposes.
 * @returns {object} Hook methods for executing prompts and tracking progress.
 */
const useSequentialPromptExecutor = () => {
    const [executedPrompts, setExecutedPrompts] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [output, setOutput] = useState([]);
    const [userMsg, setUserMsg] = useState('');

    /**
     * Executes an array of prompts in sequence and returns the results.
     * @param {Array<{prompt: string}>} prompts - Array of prompts to be executed.
     * @param {string} userId - Used for rate limiting in the API call.
     * @returns {Promise<Array<string>>} Array of AI responses.
     */
    const executeSequentialPrompts = async (prompts, userId) => {
        setLoading(true);
        setError(null);
        setOutput([]);
        setExecutedPrompts(0);
        const clientData = getClientData(); // Used strictly for rate limiting purposes

        const results = [];

        for (let index = 0; index < prompts.length; index++) {
            const { prompt } = prompts[index];

            try {
                const response = await fetch("/api/aiReqRateLimited", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-user-id": userId,
                    },
                    body: JSON.stringify({ prompt, clientData }),
                });

                if (response.status === 429) {
                    const { message, remainingRequests } = await response.json();
                    setUserMsg(`Rate limit exceeded: ${message}. Remaining requests: ${remainingRequests}`);
                    break;
                }

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to process the prompt.");
                }

                const data = await response.json();
                results.push(data.content);  // Collect the AI response
                setExecutedPrompts((prev) => prev + 1);
                setUserMsg(`Prompt ${index + 1} completed successfully.`);

            } catch (err) {
                logger.error("Error during prompt execution:", err);
                setError(err.message);
                break;
            }
        }

        setOutput(results);
        setLoading(false);
        return results; // Return results for external management
    };

    return { executeSequentialPrompts, executedPrompts, output, loading, error, userMsg };
};

export default useSequentialPromptExecutor;
