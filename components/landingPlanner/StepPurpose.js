'use client';

import React, { useEffect, useState, useRef, useImperativeHandle } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button, Input } from '@heroui/react';

import questionsData from "@/data/landing-questions-data.json";
import logger from '@/lib/logger';
//import { fetchAIHint } from '@/lib/fetchAIHint';
import { useSessionContext } from "@/lib/SessionProvider";
import PasteButton from '@/components/planner-layout/layout/PasteButton';
import { StepWrapper, StepQuestion, StepTextarea } from '@/components/planner-layout/layout/sectionComponents';
import { StepGetAiHintBtn } from '@/components/planner-layout/layout/StepGetAiHintBtn';

const StepPurpose = ({ ref }) => {
  const [localPurposeDetails, setLocalPurposeDetails] = useState("");
  const [localServiceDescription, setLocalServiceDescription] = useState("");
  const { sessionData, updateFormData, setError } = useSessionContext();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false); 
  const stepNumber = 0;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [purposeIsInvalid, setPurposeIsInvalid] = useState(sessionData?.formData?.[stepNumber]?.purpose ? false : true);
  const [detailsIsInvalid, setDetailsIsInvalid] = useState(false);
  const [serviceDescIsInvalid, setServiceDescIsInvalid] = useState(false);
  const formData = sessionData?.formData || {};

  useEffect(() => {
    setLocalPurposeDetails(formData?.[stepNumber]?.purposeDetails || "");
    setLocalServiceDescription(formData?.[stepNumber]?.serviceDescription || "");
    if (formData?.[stepNumber]?.purpose) {
      setSelectedKeys(new Set([formData[stepNumber].purpose]));
      setIsOtherSelected(formData[stepNumber].purpose === "Other (please specify)");
    }
    if (!formData?.[stepNumber]?.purpose) {
      setSelectedKeys(new Set([]));
    }
    logger.info('Child component received formData:', formData);
  }, [formData, stepNumber]);


  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      //logger.info("selectedKeys", selectedKeys.currentKey);
      if (!formData[stepNumber]?.purpose) {
        setPurposeIsInvalid(true);
        setError("Please select a goal before proceeding.");

        return false;
      }
      if (isOtherSelected && (!localPurposeDetails || localPurposeDetails.length < 10)) {
        setError("Additional details are required. (10 characters minimum)");
        setDetailsIsInvalid(true);

        return false;
      }
      if (!localServiceDescription || localServiceDescription.length < 50) {
        setError("Please provide a more detailed service description. (50 characters minimum)");
        setServiceDescIsInvalid(true);

        return false;
      }
      setDetailsIsInvalid(false);
      setPurposeIsInvalid(false);
      setServiceDescIsInvalid(false);

      return true; // Validation passed
    },
  }));

  const handleSelectionChange = (keys) => {
    setSelectedKeys(keys);
    const selectedPurpose = keys.currentKey;

    updateFormData("purpose", selectedPurpose);
    setPurposeIsInvalid(!selectedPurpose);
  };

  const handleAdditionalDetailsChange = (e) => {
    const value = e.target.value;

    setLocalPurposeDetails(value);
    updateFormData("purposeDetails", value);
    setDetailsIsInvalid(isOtherSelected && value.length < 10);
  };

  const handleServiceDescriptionChange = (e) => {
    const value = e.target.value;

    logger.debug('value', value);
    logger.debug('condition:', value.length > 15 && !purposeIsInvalid);

    setLocalServiceDescription(value);
    updateFormData("serviceDescription", value);
    setServiceDescIsInvalid(value.length < 50);
  };

  const [aiHint, setAiHint] = useState(sessionData?.formData?.[stepNumber]?.aiHint || null);
  const [userMsg, setUserMsg] = useState(null);
  const [isAIAvailable, setIsAIAvailable] = useState(true);

  useEffect(() => {
    if (localServiceDescription.length > 15 && !purposeIsInvalid) {
      setIsAIAvailable(true);
    } else {
      setIsAIAvailable(false);
    }
  }, [localServiceDescription, purposeIsInvalid]);

  const purpose = selectedKeys ? `${selectedKeys.values().next().value}.` : 'unknown.';
  const purposeDetails = localPurposeDetails ? `Additional details about the service’s purpose: ${localPurposeDetails}.` : "";
  const serviceDescription = localServiceDescription ? `Some details about what I offer to my audience: ${localServiceDescription}.` : "";
  const stepQuestion = content.questionAddition2;

  const prompt = `Consider that the business goal is to ${purpose}. ${purposeDetails} The user offers: ${serviceDescription}. Refine what the user offers with a neutral description explaining, how it benefits the audience, and what challenges it solves. Keep the response informative and under 450 characters. Avoid direct marketing language or calls to action.`;

  /*const prompt = `I'm planning a landing page and need help answering the question: ${stepQuestion}. ${purpose} ${purposeDetails} ${serviceDescription} Please keep the response informative and under 450 characters.`*/


  return (
    <form ref={formRef}>
      <StepWrapper hint={aiHint} userMsg={userMsg} whyDoWeAsk={content.why_do_we_ask}>
        <StepQuestion content={content} />
        <div className='flex flex-col md:flex-row gap-4'>
          <Dropdown>
            <DropdownTrigger>
              <Button className="capitalize w-full" color={purposeIsInvalid ? "danger" : "default"} variant="bordered">
                {Array.from(selectedKeys).join(", ").replaceAll("_", " ") || content.placeholder[0]}{content.required && <span className="text-red-500 ml-[-6px]">*</span>}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Single selection example"
              color=""
              isRequired={content.required}
              selectedKeys={selectedKeys}
              selectionMode="single"
              variant="flat"
              onSelectionChange={handleSelectionChange}
            >
              {content.options.map((option) => (
                <DropdownItem key={option}>{option}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Input
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "dark:!text-white",
              inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${detailsIsInvalid ? "border-danger !bg-danger-50" : ""}`,
            }}
            isRequired={isOtherSelected}
            label="Additional Details"
            placeholder={`(${isOtherSelected ? "required" : "optional"}) ${content.placeholder[1]}`}
            validationBehavior='aria'
            value={localPurposeDetails}
            onChange={handleAdditionalDetailsChange}
          />
        </div>
        <div className="col-span-4 flex-1 pt-8">
        <StepQuestion content={content} question={content.questionAddition2} />
        </div>
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

        <PasteButton handleChange={handleServiceDescriptionChange} setError={setError} value={localServiceDescription} >
          <StepTextarea
            content={content}
            handleTextareaChange={handleServiceDescriptionChange}
            isInputInvalid={serviceDescIsInvalid}
            isRequired={true}
            label="Service Description"
            localValue={localServiceDescription}
            placeholder={content.placeholder[2]}
          />
        </PasteButton>
      </StepWrapper>
    </form>
  );
};

StepPurpose.displayName = 'StepPurpose';

export default StepPurpose;
