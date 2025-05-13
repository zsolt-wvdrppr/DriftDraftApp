'use client';

import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';

import questionsData from "@/data/questions-data.json";
import { useSessionContext } from "@/lib/SessionProvider";
import PasteButton from '@/components/planner-layout/layout/PasteButton';
import { StepWrapper, StepQuestion, StepTextarea } from '@/components/planner-layout/layout/sectionComponents';
import { StepGetAiHintBtn } from '@/components/planner-layout/layout/StepGetAiHintBtn';

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

      if (localValue?.length < 50) {
        setError("Details are key. Please provide at least 50 characters.\n\nTry to Refine with AI!");
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

  const question = content?.question;
  const purpose = `- The purpose purpuse of this project: ${formData?.[0]?.purpose}\n` || '';
  const purposeDetails = formData?.[0]?.purposeDetails ? `- Additional details about the purpose: ${formData?.[0]?.purposeDetails}\n` : '';
  const serviceDescription = `- What I offer to my audience: ${formData?.[0]?.serviceDescription}\n` || '';
  const audience = localValue ? `- Details about the audience or ideal customer/client: ${localValue}\n` : '';
  const isAIAvailable = question && purpose && serviceDescription;
  const promptImprover = `A target audience is the group that most needs your product or service. Consider their demographics (age, location), beliefs, lifestyle and subcultures. Focus on what motivates them, their challenges and how you can address these needs, ensuring an authentic, relevant brand voice.
`;
 
const prompt = `Help describe who my target audience and who my ideal customer or client is. Consider the following information: \n${purpose} ${purposeDetails} ${serviceDescription} ${audience} ${promptImprover} Keep it concise and to the point. Keep the response concise and informative, ensuring it's less than 450 characters.`;

  return (
    <form ref={formRef}>
      <StepWrapper hint={aiHint} userMsg={userMsg} whyDoWeAsk={content?.why_do_we_ask}>
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
            placeholder={content?.placeholder}
          />
        </PasteButton>
      </StepWrapper>
    </form>
  );
};

StepAudience.displayName = 'StepAudience';

export default StepAudience;
