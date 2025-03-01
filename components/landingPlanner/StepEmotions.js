"use client";

import React, { useState, useEffect, useRef, useImperativeHandle } from "react";

import questionsData from "@/data/landing-questions-data.json";
import { useSessionContext } from "@/lib/SessionProvider";
import {
  StepWrapper,
  StepQuestion,
  StepTextarea,
} from "@/components/planner-layout/layout/sectionComponents";
import PasteButton from "@/components/planner-layout/layout/PasteButton";
import StepGetAiHintBtn from "@/components/planner-layout/layout/StepGetAiHintBtn";

const StepEmotions = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 6;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [isInputInvalid, setIsInputInvalid] = useState(false);
  const formData = sessionData.formData;
  const [localValue, setLocalValue] = useState("");

  useEffect(() => {
    setLocalValue(formData?.[stepNumber]?.emotions || "");
  }, [formData?.[stepNumber]?.emotions, stepNumber]);

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

  const [aiHint, setAiHint] = useState(
    sessionData?.formData?.[stepNumber]?.aiHint || null
  );
  const [userMsg, setUserMsg] = useState(null);

  const question = content.question;
  const purpose = `${formData[0]?.purpose}.` || "";
  const purposeDetails =
    `Some more details about it's purpose: ${formData[0]?.purposeDetails}\n` ||
    "";
  const serviceDescription = `${formData[0]?.serviceDescription}\n` || "";
  const audience = `${formData[1].audience}. ` || "";
  const marketing = formData?.[2]?.marketing || "";
  const competitors =
    formData?.[3]?.urls?.toString().trim() !== ""
      ? `- Competitors:  ${formData[3].urls.toString()}`
      : "";
  const usps = formData[4].usps || "";
  const brandGuidelines = formData[5].brandGuidelines || "";
  const emotionIdeas =  localValue ? `My thoughts regarding feelings and emotions:  ${localValue}.` : "";

  const isAIAvailable =
    question &&
    purpose &&
    serviceDescription &&
    audience &&
    marketing &&
    usps &&
    brandGuidelines;

    const prompt = `Help me clarify the emotional experience I want visitors to have on my landing page. The primary purpose is ${purpose} ${purposeDetails} Here's what the landing page offers: ${serviceDescription} My target audience is: ${audience} I want to create a strong emotional connection with them. ${competitors} My unique selling points include: ${usps}. ${emotionIdeas} Based on this, ask thought-provoking questions or provide examples to help define the emotional tone of my landing page. For instance:
    1. What feelings (e.g., excitement, calmness, trust, inspiration) will resonate with my audience and connect them to the brand?
    2. How should visitors describe their experience after using the site (e.g., ‘engaging,’ ‘professional,’ ‘welcoming’)?
    3. What first impression or mood should the homepage evoke?
    Provide a framework or examples to articulate these emotions clearly, explaining why they are vital for the landing page’s success. Keep the response conversational, concise, and under 800 characters. Keep the response concise and be creative, use emojis too to express the feelings we want to make the landingpage reader to feel, make sure they are relevant.`;

    

  return (
    <form ref={formRef}>
      <StepWrapper
        hint={aiHint}
        userMsg={userMsg}
        whyDoWeAsk={content.why_do_we_ask}
      >
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
        <PasteButton
          handleChange={handleTextareaChange}
          setError={setError}
          value={localValue}
        >
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
