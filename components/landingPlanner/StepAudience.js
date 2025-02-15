'use client';

import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';

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
  const purpose = `- The purpose of the website: ${formData[0]?.purpose}\n` || '';
  const purposeDetails = `- Some more details about it's purpose: ${formData[0]?.purposeDetails}\n` || '';
  const serviceDescription = `- What I offer to my audience: ${formData[0]?.serviceDescription}\n` || '';
  const audience = `- Details about the audience or ideal customer/client: ${localValue}\n` || '';
  const isAIAvailable = question && purpose && serviceDescription;
  const promptImprover = `A target audience is the group that most needs your product or service. Consider their demographics (age, location), beliefs, lifestyle and subcultures. Focus on what motivates them, their challenges and how you can address these needs, ensuring an authentic, relevant brand voice.
`;


  const prompt = `I'm planning a website and need help describing my target audience. More specifically I need help with the following question: ${question}. Here are some information you must consider: \n${purpose} ${purposeDetails} ${serviceDescription} ${audience} ${promptImprover} Keep it concise and to the point. Keep the response concise and informative, ensuring it's less than 450 characters.`;

  return (
    <form ref={formRef}>
      <StepWrapper hint={aiHint} userMsg={userMsg} whyDoWeAsk={content.why_do_we_ask}>
        <StepQuestion content={content} />
        <StepGetAiHintBtn
          content={content}
          isAIAvailable={isAIAvailable}
          prompt={prompt}
          sessionData={sessionData}
          setAiHint={setAiHint}
          setError={setError}
          setUserMsg={setUserMsg}
          stepNumber={stepNumber}
          updateFormData={updateFormData}
        />
        <PasteButton handleChange={handleTextareaChange} setError={setError} value={localValue}>
          <StepTextarea
            content={content}
            handleTextareaChange={handleTextareaChange}
            isInputInvalid={audienceIsInvalid}
            isRequired={true}
            label="Target Audience"
            localValue={localValue}
            placeholder={content.placeholder}
          />
        </PasteButton>
      </StepWrapper>
    </form>
  );
};

StepAudience.displayName = 'StepAudience';

export default StepAudience;
