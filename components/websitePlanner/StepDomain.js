"use client";

import React, { useRef, useState, useImperativeHandle, useEffect } from "react";
import { Input, Textarea, Divider } from "@heroui/react";

import questionsData from "@/data/questions-data.json";
import { useSessionContext } from "@/lib/SessionProvider";
import {
  StepWrapper,
  StepQuestion,
} from "@/components/planner-layout/layout/sectionComponents";
import StepGetAiHintBtn from "@/components/planner-layout/layout/StepGetAiHintBtn";
import DomainChecker from "./DomainChecker";

import { IconClipboard } from "@tabler/icons-react";

const StepDomain = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 5;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [isInputInvalid, setIsInputInvalid] = useState(false);
  const formData = sessionData.formData;
  const [localValue, setLocalValue] = useState(
    formData[stepNumber]?.domain || ""
  );

  useEffect(() => {
    setLocalValue(formData?.[stepNumber]?.domain || "");
  }, [formData?.[stepNumber]?.domain, stepNumber]);

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

  const [aiHint, setAiHint] = useState(
    sessionData?.formData?.[stepNumber]?.aiHint || null
  );
  const [userMsg, setUserMsg] = useState(null);

  const question = content.question;
  const purpose = `${formData[0]?.purpose}.` || "";
  const purposeDetails = formData[0]?.purposeDetails
    ? ` ${formData[0]?.purposeDetails} \n`
    : "";
  const serviceDescription = `${formData[0]?.serviceDescription}\n` || "";
  const audience = `${formData[1]?.audience}. ` || "";
  const marketing = formData?.[2]?.marketing || "";
  const competitors =
    formData?.[3]?.urls?.toString() !== ""
      ? `- Competitors: ${formData[3].urls.toString()}.`
      : "";
  const usps = formData[4].usps || "";
  const domainIdeas = localValue
    ? `- My ideas regarding the domain: ${localValue}`
    : "";

  const isAIAvailable =
    question && purpose && serviceDescription && audience && marketing && usps;

  const prompt = `I'm planning a website and need ideas for a domain name. The site has the following details:
  - Purpose: ${purpose} ${purposeDetails}
  - Offering: ${serviceDescription}
  - Target audience: ${audience}
  ${competitors}
  - Unique selling points: ${usps}
  ${domainIdeas}
  Make suggestions of SEO-friendly, unique, descriptive, and catchy domain names that are SHORT and CONCISE (no more than 15 characters). Ensure your response is concise, to the point, and less than 450 characters, and outline briefly how SEO best practices are applied in each suggestion: ${content.hint}. The domains you suggest must be clickable links.`;

  return (
    <form ref={formRef}>
      <StepWrapper
        checkDomain={true}
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
        <DomainChecker />
        <Divider className="my-4" />
        <Textarea
          classNames={{
            label: "!text-primary dark:!text-accentMint",
            input: "",
            inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${isInputInvalid ? "!bg-red-50 border-danger dark:!bg-content1" : ""}`,
          }}
          endContent={
            <IconClipboard
              aria-label="Paste URL from clipboard"
              className="text-primary dark:text-accentMint opacity-70 cursor-pointer absolute top-2 right-2"
              size={30}
              title="Paste URL from clipboard"
              onClick={() => {
                // Paste URL from clipboard
                navigator.clipboard.readText().then((text) => {

                  const domain = text.replace(/(^\w+:|^)\/\//, "");

                  handleTextareaChange({ target: { value: `${localValue} ${domain}` } });
                });
              }}
            />
          }
          isRequired={true}
          label="Domain Name"
          placeholder={content.placeholder}
          validationBehavior="aria"
          value={localValue}
          onChange={handleTextareaChange}
        />
      </StepWrapper>
    </form>
  );
};

export default StepDomain;
