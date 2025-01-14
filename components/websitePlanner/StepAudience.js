'use client';

import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';

import logger from '@/lib/logger';
import questionsData from "@/data/questions-data.json";
import { useSessionContext } from "@/lib/SessionProvider";

import PasteButton from './layout/PasteButton';
import { StepWrapper, StepQuestion, StepTextarea } from './layout/sectionComponents';
import { StepGetAiHintBtn } from './layout/StepGetAiHintBtn';

const StepAudience = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 1;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [audienceIsInvalid, setAudiencelsIsInvalid] = useState(false);
  const formData = sessionData?.formData || {};
  const [localValue, setLocalValue] = useState("");

  useEffect(() => {
    setLocalValue(formData?.[stepNumber]?.audience || "");
  }, [formData?.[stepNumber]?.audience, stepNumber]);

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

    setLocalValue(value);
    updateFormData("audience", value);

    // Provide immediate feedback for required field
    setAudiencelsIsInvalid(!value);
  };

  const [aiHint, setAiHint] = useState(sessionData?.formData?.[stepNumber]?.aiHint || null);
  const [userMsg, setUserMsg] = useState(null);

  const question = content.question;
  const purpose = formData[0]?.purpose;
  const purposeDetails = formData[0]?.purposeDetails || '';
  const serviceDescription = formData[0]?.serviceDescription;
  const isAIAvailable = purpose && serviceDescription && question && serviceDescription;

  const prompt = `I'm planning a website and need to answer to a question regarding my target audience. I need help with the following question: ${question}. Consider that the main purpose of the website is ${purpose} ${purposeDetails} and here's a description about what I offer: ${serviceDescription}. Keep it concise and to the point. Keep the response concise and informative, ensuring it's less than 450 characters.`;

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
        <PasteButton value={localValue} handleChange={handleTextareaChange} setError={setError}>
          <StepTextarea
            content={content}
            isRequired={true}
            label="Target Audience"
            placeholder={content.placeholder}
            localValue={localValue}
            handleTextareaChange={handleTextareaChange}
            isInputInvalid={audienceIsInvalid}
          />
        </PasteButton>
      </StepWrapper>
    </form>
  );
};

StepAudience.displayName = 'StepAudience';

export default StepAudience;
