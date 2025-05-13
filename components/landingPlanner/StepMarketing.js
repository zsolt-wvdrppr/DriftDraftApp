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
  const content = questionsData?.[stepNumber];
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
      if (!formData?.[stepNumber]?.marketing) {
        setError("Additional details are required.");
        setIsInputInvalid(true);

        return false;
      }

      if (localValue.length < 50) {
        setError("Details are key. Please provide at least 50 characters. Try to Refine with AI!");
        setIsInputInvalid(true);

        return false;
      }


      setIsInputInvalid(false);

      return true; // Validation passed
    },
  }));

  const handleTextareaChange = (e) => {
    const value = e?.target?.value;

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
    `${formData?.[0]?.purpose}.` || "";
  const purposeDetails = formData?.[0]?.purposeDetails ?
    `Additional details about the purpose: ${formData?.[0]?.purposeDetails}\n` : "";
  const serviceDescription =
    `What I offer to my audience: ${formData?.[0]?.serviceDescription}.\n` || "";
  const audience =
    `Consider the following regarding my ideal prospects: ${formData?.[1]?.audience}. ` || "";
  const marketing = localValue ?
    `Details about the marketing strategy: ${localValue}. ` : "";
  const promptImprover = `
    Use common marketing tactics to attract visitors: 
    - Search engine optimisation (SEO) 
    - Social media marketing 
    - Email campaigns 
    - Paid advertising 
    - Relevant partnerships (e.g., influencers, affiliates).
    Focus on aligning these tactics with the audience’s interests and the project's goals.
    `;
  const isAIAvailable = question && purpose && serviceDescription && audience;

  const prompt = `Make concise suggestions how I could attract people to my landing page, more specifically, how to attract the right audience.
My target is to Generate leads or enquiries. Additional details about the purpose: ${purpose} ${purposeDetails}.
    ${serviceDescription}
    ${audience}
    ${marketing}
    ${promptImprover}
    Suggest concise, effective traffic sources.
    Keep it less than 300 words.
    Present the results in a detailed, clear and easy-to-read format using markdown! Do not return code!
    `;

  return (
    <form ref={formRef}>
      <StepWrapper
        hint={aiHint}
        userMsg={userMsg}
        whyDoWeAsk={content?.why_do_we_ask}
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
