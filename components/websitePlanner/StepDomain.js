'use client';

import React, { useRef, useState, useImperativeHandle, useEffect } from 'react';
import { Input } from '@heroui/react';

import questionsData from "@/data/questions-data.json";
import logger from '@/lib/logger';
import { useSessionContext } from '@/lib/SessionProvider';

import { StepWrapper, StepQuestion } from './layout/sectionComponents';
import StepGetAiHintBtn from './layout/StepGetAiHintBtn';

const StepDomain = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 5;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [isInputInvalid, setIsInputInvalid] = useState(false);
  const formData = sessionData.formData;
  const [localValue, setLocalValue] = useState(formData[stepNumber]?.domain || '');

  useEffect(() => {
    setLocalValue(formData?.[stepNumber]?.domain || "");
  }, [formData?.[stepNumber]?.domain, stepNumber])

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber]?.domain) {
        setError("Additional details are required.");
        setIsInputInvalid(true);

        return false;
      }
      setIsInputInvalid(false);

      return true; // Validation passed
    },
  }));

  const handleTextareaChange = (e) => {
    const value = e.target.value;

    updateFormData("domain", value);
    setLocalValue(value);
    // Provide immediate feedback for required field
    setIsInputInvalid(!value);
  };

  const [aiHint, setAiHint] = useState(sessionData?.formData?.[stepNumber]?.aiHint || null);
  const [userMsg, setUserMsg] = useState(null);
  const question = content.question;
  const marketing = formData[2].marketing || '';
  const competitors = formData[3].urls.toString() !== '' ? `I have identified the following competitors: ${formData[3].urls.toString()}.` : '';
  const purpose = formData[0].purpose;
  const purposeDetails = formData[0].purposeDetails || '';
  const serviceDescription = formData[0].serviceDescription;
  const audience = formData[1].audience;
  const usps = formData[4].usps || '';
  const isAIAvailable = (purpose && serviceDescription && question && serviceDescription && audience && marketing && usps);

  const prompt = `I'm planning a website and need some ideas for a domain. Consider that the main purpose of the website is ${purpose}, ${purposeDetails} and here's a description about what I offer: ${serviceDescription}. The description of my target audience is as follows: ${audience}. This is how I plan to attract my audience: ${marketing}. ${competitors}. About my unique selling points: ${usps}. So give me some ideas while strictly following guidelines and other SEO best practices and outline them how they're applied: ${content.hint}. The domain name must be SHORT and Concise so must not be longer than 15 characters. Keep it concise and to the point. The response must be less than 450 characters.`;


  return (
    <form ref={formRef}>
      <StepWrapper hint={aiHint} userMsg={userMsg} whyDoWeAsk={content.why_do_we_ask}>
        <StepQuestion content={content} />
        <StepGetAiHintBtn
          stepNumber={stepNumber}
          content={content}
          sessionData={sessionData}
          updateFormData={updateFormData}
          setError={setError}
          setAiHint={setAiHint}
          setUserMsg={setUserMsg}
          prompt={prompt}
          isAIAvailable={isAIAvailable}
        />
        <Input
          classNames={{
            label: "!text-primary dark:!text-accentMint",
            input: "",
            inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${isInputInvalid ? "!bg-red-50 border-danger dark:!bg-content1" : ""}`,
          }}
          isRequired={true}
          label="Domain Name"
          placeholder={content.placeholder}
          value={localValue}
          onChange={handleTextareaChange}
          validationBehavior='aria'
        />
      </StepWrapper>
    </form>
  );
};

export default StepDomain;
