"use client";

import React, { useEffect, useState, useRef, useImperativeHandle } from "react";

import questionsData from "@/data/landing-questions-data.json";
import { useSessionContext } from "@/lib/SessionProvider";
import PasteButton from "@/components/planner-layout/layout/PasteButton";
import {
  StepWrapper,
  StepQuestion,
  StepTextarea,
} from "@/components/planner-layout/layout/sectionComponents";
import { StepGetAiHintBtn } from "@/components/planner-layout/layout/StepGetAiHintBtn";

const StepMarketing = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 2;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [isInputInvalid, setIsInputInvalid] = useState(false);
  const formData = sessionData?.formData || {};
  const [localValue, setLocalValue] = useState("");

  useEffect(() => {
    setLocalValue(formData?.[stepNumber]?.marketing || "");
  }, [formData?.[stepNumber]?.marketing, stepNumber]);

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber]?.marketing) {
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

    updateFormData("marketing", value);
    setLocalValue(value);
    // Provide immediate feedback for required field
    setIsInputInvalid(!value);
  };

  const [aiHint, setAiHint] = useState(
    sessionData?.formData?.[stepNumber]?.aiHint || null
  );
  const [userMsg, setUserMsg] = useState(null);

  const question = content.question;
  const purpose =
    `${formData[0]?.purpose}.` || "";
  const purposeDetails =
    `Some more details about it's purpose: ${formData[0]?.purposeDetails}\n` || "";
  const serviceDescription =
    `${formData[0]?.serviceDescription}\n` || "";
  const audience =
    `Details about the audience or ideal customer/client: ${formData[1]?.audience}. ` || "";
  const marketing =
    `Some details about the marketing strategy: ${localValue}. ` || "";
  const promptImprover = `
    Use common marketing tactics to attract visitors: 
    - Search engine optimisation (SEO) 
    - Social media marketing 
    - Email campaigns 
    - Paid advertising 
    - Relevant partnerships (e.g., influencers, affiliates).
    Focus on aligning these tactics with the audience’s interests and the site’s goals.
    `;
  const isAIAvailable = question && purpose && serviceDescription && audience;

  const prompt = `I'm planning a landing page and need help answering the question: "${question}"—specifically, how to attract the right audience. 
    The landing page's purpose is ${purpose} ${purposeDetails}, and I offer: ${serviceDescription}. 
    ${audience}
    ${marketing}
    ${promptImprover}
    Suggest concise, effective traffic sources and be sure to keep it under 600 characters.
    `;

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
            label="Incoming Traffic Sources"
            localValue={localValue}
          />
        </PasteButton>
      </StepWrapper>
    </form>
  );
};

export default StepMarketing;
