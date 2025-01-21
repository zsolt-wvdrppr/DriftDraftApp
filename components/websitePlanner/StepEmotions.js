'use client';

import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';

import questionsData from "@/data/questions-data.json";
import logger from '@/lib/logger';
import { useSessionContext } from '@/lib/SessionProvider';

import { StepWrapper, StepQuestion, StepTextarea } from './layout/sectionComponents';
import PasteButton from './layout/PasteButton';
import StepGetAiHintBtn from './layout/StepGetAiHintBtn';

const StepEmotions = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 7;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [isInputInvalid, setIsInputInvalid] = useState(false);
  const formData = sessionData.formData;
  const [localValue, setLocalValue] = useState("");

  useEffect(() => {
    setLocalValue(formData?.[stepNumber]?.emotions || "");
  }, [formData?.[stepNumber]?.emotions, stepNumber])

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber]?.emotions) {
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

    updateFormData("emotions", value);
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
  const brandGuidelines = formData[5].brandGuidelines || '';

  const isAIAvailable = (question && purpose && serviceDescription && serviceDescription && audience && usps);

  const prompt = `Help me clarify the emotional experience I want visitors to have on my website. The purpose of the website is ${purpose}, with a focus on ${purposeDetails}. Here's what the website offers: ${serviceDescription}. My target audience is: ${audience}. I want the website to make a strong emotional connection with them. ${competitors}. My unique selling points include: ${usps}. Based on this context, please ask thought-provoking questions or provide examples to help me define the emotional tone of my website. For example:
      1. What feelings (e.g., excitement, calmness, trust, inspiration) would make my audience feel connected to the brand?
      2. How do I want visitors to describe their experience after using the website (e.g., ‘engaging,’ ‘professional,’ ‘warm,’ etc.)?
      3. What kind of impression or mood do I want to leave on visitors when they first land on my homepage?
      Please provide a framework or examples to help me articulate these emotions clearly, and explain why defining these emotions is critical to my website’s success. Keep it conversational and insightful, encouraging me to think deeply about the impact I want my website to have. Keep the response concise and informative, ensuring it's less than 800 characters.`;

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
            isInputInvalid={isInputInvalid}
            isRequired={true}
            label="Emotions and User Experience"
            localValue={localValue}
          />
        </PasteButton>
      </StepWrapper>
    </form>
  );
};

export default StepEmotions;
