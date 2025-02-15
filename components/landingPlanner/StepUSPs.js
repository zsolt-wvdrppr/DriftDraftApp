"use client";

import React, { useEffect, useState, useRef, useImperativeHandle } from "react";

import questionsData from "@/data/questions-data.json";
import logger from "@/lib/logger";
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
  const content = questionsData[stepNumber];
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
      if (!formData[stepNumber]?.usps) {
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
  const purpose = `${formData[0]?.purpose}.` || "";
  const purposeDetails =
    `Some more details about it's purpose: ${formData[0]?.purposeDetails}\n` ||
    "";
  const serviceDescription = `${formData[0]?.serviceDescription}\n` || "";
  const audience = `${formData[1].audience}. ` || "";
  const marketing = formData?.[2]?.marketing || "";
  const competitors =
    formData?.[3]?.urls?.toString() !== ""
      ? `I have identified the following competitors: ${formData[3].urls.toString()}.`
      : "";
  const usps =
    `Some details about my Unique Selling Points: ${localValue}\n` || "";

  const isAIAvailable =
    question && purpose && serviceDescription && audience && marketing;

  const prompt = `
    I'm planning a landing page and I've been asked to answer the following question: ${question}.
    Consider that the main purpose of the landing page is ${purpose} ${purposeDetails}
    and here's a description of what I offer: ${serviceDescription}
    The description of my target audience is as follows: ${audience}
    This is how I plan to attract my audience: ${marketing}
    ${competitors}
    ${usps}
    Help me answer the question while considering the above details.
    Keep the response concise and informative, ensuring it's less than 800 characters.
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
            label={"Unique Selling Points"}
            localValue={localValue}
          />
        </PasteButton>
      </StepWrapper>
    </form>
  );
};

export default StepUSPs;
