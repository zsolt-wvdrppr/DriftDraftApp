'use client';

import React, { useEffect, useState, useRef, useImperativeHandle } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button, Input } from '@nextui-org/react';
import ReactMarkdown from 'react-markdown';

import questionsData from "@/data/questions-data.json";
import logger from '@/lib/logger';
import { fetchAIHint } from '@/lib/fetchAIHint';
import { useSessionContext } from "@/lib/SessionProvider";

import PasteButton from './layout/PasteButton';
import { StepWrapper, StepQuestion, StepTextarea, StepGetAiHintBtn } from './layout/sectionComponents';

const StepPurpose = ({ ref }) => {
  const [localPurposeDetails, setLocalPurposeDetails] = useState("");
  const [localServiceDescription, setLocalServiceDescription] = useState("");
  const { sessionData, updateFormData, setError } = useSessionContext();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false); // = selectedKeys.has("Other (please specify)");
  //const deferredValue = useDeferredValue(Array.from(selectedKeys).join(", ").replaceAll("_", " "));
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
  const [isPending, setIsPending] = useState(false);

  const handleFetchHint = async () => {

    if (!isAIAvailable) return;

    logger.debug('Fetching AI hint for step', stepNumber);
    logger.debug(!formData[stepNumber]?.purpose || !localServiceDescription || localServiceDescription.length < 15);

    if (!formData[stepNumber]?.purpose || !localServiceDescription || localServiceDescription.length < 15) return;

    const question = content.questionAddition2;
    const purpose = formData[0].purpose;
    const serviceDescriptionPrompt = `Some details about my service: ${localServiceDescription}` || '';
    logger.debug('serviceDescriptionPrompt', serviceDescriptionPrompt);
    const isOtherPurpose = purpose && purpose.indexOf("other") !== -1 && localPurposeDetails && localPurposeDetails.length > 10;

    const prompt = `I'm planning a website and need to answer to a question regarding what I offer. I need help with the following question: ${question}. Consider that the main purpose of the website is ${isOtherPurpose ? localPurposeDetails : purpose + localPurposeDetails}. ${serviceDescriptionPrompt} Keep it concise and to the point. Keep the response concise and informative, ensuring it's less than 450 characters.`;

    try {
      setIsPending(true);
      await fetchAIHint({
        stepNumber,
        prompt,
        content,
        setAiHint,
        setUserMsg,
        sessionData,
        updateFormData,
      });
    } catch (error) {
      logger.error('Error fetching AI hint:', error);
    } finally {
      setIsPending(false);
    }
  };

  const handleUnavailableGetAiHintBtn = () => {
    logger.debug('AI hint is not available');

    if (purposeIsInvalid) {
      setError('Please select your goal first!');
    } else {
      setError('Please provide a more detailed service description.');
    }
  };

  useEffect(() => {
    if (localServiceDescription.length > 15 && !purposeIsInvalid) {
      setIsAIAvailable(true);
    } else {
      setIsAIAvailable(false);
    }
  }, [localServiceDescription, purposeIsInvalid]);


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
            placeholder={`${content.placeholder[1]} (${isOtherSelected ? "required" : "optional"})`}
            value={localPurposeDetails}
            onChange={handleAdditionalDetailsChange}
            validationBehavior='aria'
          />
        </div>
        <div className="col-span-4 flex-1">
          <h2 className="text-lg font-semibold my-10 text-primary dark:text-accentMint relative">
            <ReactMarkdown>{content.questionAddition2}</ReactMarkdown>
          </h2>
        </div>
        <StepGetAiHintBtn
          isAIAvailable={isAIAvailable}
          isPending={isPending}
          handleAvailableBtn={handleFetchHint}
          handleUnavailableBtn={handleUnavailableGetAiHintBtn}
        />
        <PasteButton value={localServiceDescription} handleChange={handleServiceDescriptionChange} setError={setError} >
          <StepTextarea
            content={content}
            label="Service Description"
            localValue={localServiceDescription}
            handleTextareaChange={handleServiceDescriptionChange}
            isRequired={true}
            isInputInvalid={serviceDescIsInvalid}
          />
        </PasteButton>
      </StepWrapper>
    </form>
  );
};

StepPurpose.displayName = 'StepPurpose';

export default StepPurpose;
