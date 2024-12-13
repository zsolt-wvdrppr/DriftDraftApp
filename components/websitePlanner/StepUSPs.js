'use client';

import React, { useEffect, useState, useRef, useImperativeHandle } from 'react';
import { Textarea } from '@nextui-org/react';

import questionsData from "@/data/questions-data.json";
import useRateLimiter from '@/lib/hooks/useRateLimiter';
import logger from '@/lib/logger';
import { fetchAIHint } from '@/lib/fetchAIHint';
import { useSessionContext } from '@/lib/SessionProvider';

import Sidebar from './ActionsBar/Main';

const StepUSPs = ({ ref }) => {
  const {sessionData, updateFormData, setError} = useSessionContext();
  const stepNumber = 4;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [attractionIsInvalid, setAttractionlsIsInvalid] = useState(false);
  const formData = sessionData?.formData || {};
  const [localValue, setLocalValue] = useState("");

  useEffect(()=>{
    setLocalValue(formData?.[stepNumber]?.usps || "");
  },[formData?.[stepNumber]?.usps, stepNumber])

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber]?.usps) {
        setError("Additional details are required.");
        setAttractionlsIsInvalid(true);

        return false;
      }
      setAttractionlsIsInvalid(false);

      return true; // Validation passed
    },
  }));

  const handleTextareaChange = (e) => {
    const value = e.target.value;

    setLocalValue(value);
    updateFormData("usps", value);
    // Provide immediate feedback for required field
    setAttractionlsIsInvalid(!value);
  };

  const [aiHints, setAiHints] = useState(null);
  const { incrementCounter, checkRateLimit } = useRateLimiter(`aiResponse_${stepNumber}`, 3, 3);

  useEffect(() => {
    const question = content.question;
    const marketing = formData?.[2]?.marketing || '';
    const competitors = formData?.[3]?.urls?.toString() !== '' ? `I have identified the following competitors: ${formData[3].urls.toString()}.` : '';
    const purpose = formData?.[0]?.purpose;
    const purposeDetails = formData?.[0]?.purposeDetails || '';
    const serviceDescription = formData?.[0]?.serviceDescription;
    const audience = formData?.[1]?.audience;

    if (purpose && serviceDescription && question && serviceDescription && audience && marketing) {

      const prompt = `I'm planning a website and I've been asked to answer the following question: ${question}. Consider that the main purpose of the website is ${purpose}, ${purposeDetails} and here's a description about what I offer: ${serviceDescription}. The description of my target audience is as follows: ${audience}. This is how I plan to attract my audience: ${marketing}. ${competitors}. So help me with answer the question while considering the above details. Keep the response concise and informative, ensuring it's less than 800 characters.`;
      
      const handleFetchHint = async () => {
        await fetchAIHint({
          stepNumber,
          prompt,
          content,
          checkRateLimit,
          logger,
          incrementCounter,
          setAiHints,
          sessionData,
          updateFormData
        });
      };

      logger.info("fetching content");
      handleFetchHint();
    } else {
      logger.info("resetting hints");
      setAiHints(null);
    }
  }, []);

  return (
    <form ref={formRef}>
      <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:py-10 max-w-screen-xl">
        <div className="col-span-4 flex-1">
          <h2 className="text-lg font-semibold mb-4 text-primary dark:text-accentMint">
            {content.question} {content.required && <span className="text-red-500">*</span>}
          </h2>
        </div>
        <div className="col-span-3 flex-1 space-y-4">
          <Textarea
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "",
              inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${attractionIsInvalid ? "!bg-red-50 border-danger dark:!bg-content1" : ""}`,
            }}
            isRequired={true}
            label="Unique Selling Points"
            minRows={4}
            placeholder={content.placeholder}
            value={localValue}
            onChange={handleTextareaChange}
          />
        </div>
        <Sidebar hints={aiHints} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
};

export default StepUSPs;
