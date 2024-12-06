'use client';

import { useState, useEffect } from "react";

const useRateLimiter = (keyPrefix, maxRequests, timeWindowHours) => {
    const now = new Date().getTime();
    const counterKey = `${keyPrefix}_counter`;
    const timestampKey = `${keyPrefix}_timestamp`;

    const [isRateLimited, setIsRateLimited] = useState(false);

    const checkRateLimit = () => {
        const requestCount = parseInt(localStorage.getItem(counterKey) || "0", 10);
        const lastTimestamp = parseInt(localStorage.getItem(timestampKey) || "0", 10);
        const elapsedTime = (now - lastTimestamp) / (1000 * 60 * 60); // Convert ms to hours

        if (elapsedTime >= timeWindowHours) {
            // Reset counter if timeWindow has passed
            localStorage.setItem(counterKey, "0");
            localStorage.setItem(timestampKey, now.toString());
            setIsRateLimited(false);
            return false;
        }

        const limited = requestCount >= maxRequests;
        setIsRateLimited(limited);
        return limited;
    };

    const incrementCounter = () => {
        const requestCount = parseInt(localStorage.getItem(counterKey) || "0", 10) + 1;
        localStorage.setItem(counterKey, requestCount.toString());
        localStorage.setItem(timestampKey, now.toString());
    };

    const resetCounter = () => {
        localStorage.setItem(counterKey, "0");
        localStorage.setItem(timestampKey, now.toString());
        setIsRateLimited(false);
    };

    useEffect(() => {
        checkRateLimit();
    }, [keyPrefix, maxRequests, timeWindowHours, now]);

    return { isRateLimited, incrementCounter, resetCounter, checkRateLimit };
};

export default useRateLimiter;


/* Example usage in a component:

import useRateLimiter from "@/lib/useRateLimiter";

const { isRateLimited, incrementCounter, checkRateLimit } = useRateLimiter(`aiResponse_${stepNumber}`, 3, 3);

useEffect(() => {
    if (!formData?.[stepNumber]?.purpose) {
        setAiHints(null);
        return;
    }

    const question = content.questionAddition2;
    const purpose = formData[stepNumber].purpose;
    const purposeDetails = formData[stepNumber].purposeDetails || '';
    const serviceDescription = `Some details about my service: ${formData[stepNumber].serviceDescription}` || '';
    const isOtherPurpose = purpose && purpose.includes("other") && purposeDetails.length > 10;

    const prompt = `I'm planning a website and need to answer a question regarding what I offer. I need help with the following question: ${question}. Consider that the main purpose of the website is ${isOtherPurpose ? purposeDetails : purpose + purposeDetails}. ${serviceDescription} Keep it concise and to the point. Ensure it's less than 450 characters.`;

    const fetchContent = async () => {
        if (checkRateLimit()) {
            const cachedResponse = localStorage.getItem(`aiResponse_${stepNumber}`);
            const limitExpires = new Date(parseInt(localStorage.getItem(`aiResponse_${stepNumber}_timestamp`)) + 3 * 60 * 60 * 1000);
            const limitExpiresInMinutes = Math.floor((limitExpires - new Date()) / 60000);
            setAiHints(`*AI assistance limit reached for this step. Try again in ${limitExpiresInMinutes} minutes.*\n\n ${content.hints}\n\n--- *Last AI generated hint* ---\n${(cachedResponse || "")}`);
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
                throw new Error("Failed to fetch AI response");
            }

            const data = await response.json();
            const aiContent = `**Service description:**\n ${data.content}` || content.hints;

            // Cache response
            localStorage.setItem(`aiResponse_${stepNumber}`, aiContent);
            setAiHints(aiContent);

            // Increment request count
            incrementCounter();
        } catch (error) {
            console.error("Error fetching content:", error);
            setAiHints("An error occurred while generating content.");
        }
    };

    const debounceTimer = setTimeout(() => {
        fetchContent();
    }, 5000);

    return () => clearTimeout(debounceTimer);
}, [formData, stepNumber, formData?.[stepNumber]?.purpose, formData?.[stepNumber]?.purposeDetails]);



*/

