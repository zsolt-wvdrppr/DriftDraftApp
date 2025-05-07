"use client";

import React, { useEffect, useState, useRef, useImperativeHandle } from "react";

import questionsData from "@/data/questions-data.json";
import { useSessionContext } from "@/lib/SessionProvider";
import {
  StepWrapper,
  StepQuestion,
  StepTextarea,
} from "@/components/planner-layout/layout/sectionComponents";
import PasteButton from "@/components/planner-layout/layout/PasteButton";
import { StepGetAiHintBtn } from "@/components/planner-layout/layout/StepGetAiHintBtn";

const StepUSPs = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 4;
  const content = questionsData?.[stepNumber];
  const formRef = useRef();
  const [isInputInvalid, setIsInputInvalid] = useState(false);
  const formData = sessionData?.formData || {};
  const [localValue, setLocalValue] = useState("");

  useEffect(() => {
    setLocalValue(formData?.[stepNumber]?.usps || "");
  }, [formData?.[stepNumber]?.usps, stepNumber]);

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData?.[stepNumber]?.usps) {
        setError("Additional details are required.");
        setIsInputInvalid(true);

        return false;
      }

      if (localValue.length < 50) {
        setError("Please provide at least 50 characters. Try to Refine with AI!");
        setIsInputInvalid(true);

        return false;
      }

      setIsInputInvalid(false);

      return true; // Validation passed
    },
  }));

  const handleTextareaChange = (e) => {
    const value = e.target.value;

    setLocalValue(value);
    updateFormData("usps", value);
    // Provide immediate feedback for required field
    setIsInputInvalid(!value);
  };

  const [aiHint, setAiHint] = useState(
    sessionData?.formData?.[stepNumber]?.aiHint || null
  );
  const [userMsg, setUserMsg] = useState(null);

  const question = content.question;
  const purpose = `${formData?.[0]?.purpose}.` || "";
  const purposeDetails = formData?.[0]?.purposeDetails ?
    ` ${formData?.[0]?.purposeDetails} \n` :
    "";
  const serviceDescription = `${formData?.[0]?.serviceDescription}\n` || "";
  const audience = `${formData?.[1]?.audience}. ` || "";
  const marketing = formData?.[2]?.marketing || "";
  const competitors =
    formData?.[3]?.urls?.toString() !== ""
      ? `I have identified the following competitors: ${formData?.[3]?.urls?.toString()}.`
      : "";
  const usps = localValue ?
    `My Unique Selling Points that I gathered: ${localValue}\n` : "";

  const isAIAvailable =
    question && purpose && serviceDescription && audience && marketing;

  const prompt = `
    I'm working on a landing page. Identify my project's Unique Selling Points, how can I stand out from the competition and what makes my project unique.
    Consider that the main purpose of the landing page that I'm planning is ${purpose}${purposeDetails}
    and here's a description of what I offer: ${serviceDescription}
    The description of my target audience is as follows: ${audience}

    ${competitors}
    ${usps}
    Keep the response concise and informative. No extra text (no greetings, no conclusions, no disclaimers) only the final result.
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
            label={"Unique Selling Points"}
            localValue={localValue}
          />
        </PasteButton>
      </StepWrapper>
    </form>
  );
};

export default StepUSPs;
