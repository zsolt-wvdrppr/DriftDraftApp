'use client';

import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { Textarea } from '@nextui-org/react';

import questionsData from "@/data/questions-data.json";
import useRateLimiter from '@/lib/hooks/useRateLimiter';
import logger from '@/lib/logger';
import { fetchAIHint } from '@/lib/fetchAIHint';
import { useSessionContext } from '@/lib/SessionProvider';

import Sidebar from './ActionsBar/Main';

const StepEmotions = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 7;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [attractionIsInvalid, setAttractionlsIsInvalid] = useState(false);
  const formData = sessionData.formData;

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber]?.emotions) {
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

    updateFormData("emotions", value);

    // Provide immediate feedback for required field
    setAttractionlsIsInvalid(!value);
  };

  const [aiHints, setAiHints] = useState('');
  const { incrementCounter, checkRateLimit } = useRateLimiter(`aiResponse_${stepNumber}`, 3, 3);

  useEffect(() => {
    const question = content.question;
    const marketing = formData[2].marketing || '';
    const competitors = formData[3].urls.toString() !== '' ? `I have identified the following competitors: ${formData[3].urls.toString()}.` : '';
    const purpose = formData[0].purpose;
    const purposeDetails = formData[0].purposeDetails || '';
    const serviceDescription = formData[0].serviceDescription;
    const audience = formData[1].audience;
    const usps = formData[4].usps || '';
    const brandGuidelines = formData[5].brandGuidelines || '';


    if (question && purpose && serviceDescription && serviceDescription && audience && usps) {

      const prompt = `Help me clarify the emotional experience I want visitors to have on my website. The purpose of the website is ${purpose}, with a focus on ${purposeDetails}. Here's what the website offers: ${serviceDescription}. My target audience is: ${audience}. I want the website to make a strong emotional connection with them. ${competitors}. My unique selling points include: ${usps}. Based on this context, please ask thought-provoking questions or provide examples to help me define the emotional tone of my website. For example:
      1. What feelings (e.g., excitement, calmness, trust, inspiration) would make my audience feel connected to the brand?
      2. How do I want visitors to describe their experience after using the website (e.g., ‘engaging,’ ‘professional,’ ‘warm,’ etc.)?
      3. What kind of impression or mood do I want to leave on visitors when they first land on my homepage?
      Please provide a framework or examples to help me articulate these emotions clearly, and explain why defining these emotions is critical to my website’s success. Keep it conversational and insightful, encouraging me to think deeply about the impact I want my website to have. Keep the response concise and informative, ensuring it's less than 800 characters.`;

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
  }, []);

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
              inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${attractionIsInvalid ? "!bg-red-50 border-danger dark:!bg-content1" : ""}`,
            }}
            isRequired={true}
            label="Emotions and User Experience"
            minRows={4}
            placeholder={content.placeholder}
            value={formData?.[stepNumber]?.emotions || ""}
            onChange={handleTextareaChange}
          />
        </div>
        <Sidebar hints={`${aiHints}`} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
};

export default StepEmotions;
