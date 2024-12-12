'use client';

import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { Textarea } from '@nextui-org/react';

import logger from '@/lib/logger';
import questionsData from "@/data/questions-data.json";
import useRateLimiter from '@/lib/hooks/useRateLimiter';
import { fetchAIHint } from '@/lib/fetchAIHint';
import { useSessionContext } from "@/lib/SessionProvider";

import Sidebar from './ActionsBar/Main';


const StepAudience = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 1;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [audienceIsInvalid, setAudiencelsIsInvalid] = useState(false);
  const formData = sessionData?.formData || {};

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData?.[stepNumber]?.audience) {
        setError("Additional details are required.");
        setAudiencelsIsInvalid(true);

        return false;
      }
      setAudiencelsIsInvalid(false);

      return true; // Validation passed
    },
  }));

  const handleTextareaChange = (e) => {
    const value = e.target.value;

    updateFormData("audience", value);
  };

  const [aiHints, setAiHints] = useState(null);
  const { incrementCounter, checkRateLimit } = useRateLimiter(`aiResponse_${stepNumber}`, 3, 3);

  useEffect(() => {
    const question = content.question;
    const purpose = formData[0]?.purpose;
    const purposeDetails = formData[0]?.purposeDetails || '';
    const serviceDescription = formData[0]?.serviceDescription;

    if (purpose && serviceDescription && question && serviceDescription) {

      const prompt = `I'm planning a website and need to answer to a question regarding my target audience. I need help with the following question: ${question}. Consider that the main purpose of the website is ${purpose} ${purposeDetails} and here's a description about what I offer: ${serviceDescription}. Keep it concise and to the point. Keep the response concise and informative, ensuring it's less than 450 characters.`;

      const handleFetchHint = async () => {
        await fetchAIHint({
          stepNumber,
          prompt,
          content,
          checkRateLimit,
          logger,
          incrementCounter,
          setAiHints,
        });
      };

      logger.info("fetching content");
      handleFetchHint();
    } else {
      logger.info("resetting hints");
      setAiHints(null);
    }
  }, [formData, content]);

  return (
    <form ref={formRef}>
      <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:py-10 max-w-screen-xl">
        <div className="col-span-3 flex-1 space-y-4">
          <h2 className="text-lg font-semibold mb-4 text-primary dark:text-accentMint">
            {content.question} {content.required && <span className="text-red-500">*</span>}
          </h2>
          <Textarea
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "",
              inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${audienceIsInvalid ? "!bg-red-50 border-danger dark:!bg-content1" : ""}`,
            }}
            isRequired={true}
            label="Target Audience"
            minRows={4}
            placeholder={content.placeholder}
            value={formData?.[stepNumber].audience || ""}
            onChange={handleTextareaChange}
          />
        </div>
        <Sidebar hints={aiHints} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
};

StepAudience.displayName = 'StepAudience';

export default StepAudience;
