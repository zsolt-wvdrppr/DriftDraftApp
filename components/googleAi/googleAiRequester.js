"use client";

import { useState, useEffect } from "react";

import logger from '@/lib/logger';

const GoogleAiRequester = ({ prompt = "Say hi, and a joke" }) => {
  const [output, setOutput] = useState("Thinking...");

  const fetchContent = async () => {
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

      logger.debug("Content generated:", data.content);

      setOutput(data.content || "No content generated.");
    } catch (error) {
      logger.error("Error fetching content:", error);
      setOutput("An error occurred while generating content.");
    }
  };

  useEffect(() => {
    fetchContent();
  }, [prompt]);

  return <div>{output}</div>;
};

export default GoogleAiRequester;
