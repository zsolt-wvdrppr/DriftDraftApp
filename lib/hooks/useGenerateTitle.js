"use client";
import { useState, useEffect } from "react";

import logger from "@/lib/logger";


/**
 * Hook to generate a concise title from content and update the database automatically.
 * Waits for content to become available before triggering the title generation.
 * @param {string | null} content - The content used for generating the title.
 * @param {Function} updateSessionTitleInDb - Function to update the title in the database.
 */
const useGenerateTitle = (content, updateSessionTitleInDb, userId, sessionId) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [titleGenerated, setTitleGenerated] = useState(false); // Prevent multiple triggers

    useEffect(() => {
        const generateAndSaveTitle = async () => {
            if (!content || titleGenerated || !userId || !sessionId) return; // Wait for content and avoid re-triggering

            setLoading(true);
            setError(null);

            try {
                const prompt = `Generate a very short and concise title (max 4 words) based on the following content: "${content}".`;
                const response = await fetch("/api/googleAi", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ prompt }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "An error occurred generating the title.");
                }

                const data = await response.json();
                const generatedTitle = data.content.trim() || "Untitled Website Plan";

                logger.debug("[TITLE GENERATOR] - Generated title:", generatedTitle);
                
                // Call the database update function and mark title as generated
                await updateSessionTitleInDb(userId, sessionId, generatedTitle);
                setTitleGenerated(true);

            } catch (error) {
                logger.error("[TITLE GENERATOR] - Error generating title:", error);
                setError(error.message);

                // Default to "Untitled Website Plan" in case of error
                await updateSessionTitleInDb(userId, sessionId, "Untitled Website Plan");
                setTitleGenerated(true);
            } finally {
                setLoading(false);
            }
        };

        // Automatically trigger when content becomes available and title hasn't been generated yet
        if (content) {
            generateAndSaveTitle();
        }

    }, [content, updateSessionTitleInDb, titleGenerated, sessionId, userId]); // Trigger only when content changes

    return { loading, error };
};

export default useGenerateTitle;
