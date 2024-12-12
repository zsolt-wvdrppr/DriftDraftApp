'use client';

import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Textarea, Button, Input } from '@nextui-org/react';
import ReactMarkdown from 'react-markdown';

import questionsData from "@/data/questions-data.json";
import useRateLimiter from '@/lib/hooks/useRateLimiter';
import logger from '@/lib/logger';
import { fetchAIHint } from '@/lib/fetchAIHint';

import Sidebar from './ActionsBar/Main';
import { useSessionContext } from "@/lib/SessionProvider";

const StepPurpose = ({ref}) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false); // = selectedKeys.has("Other (please specify)");
  //const deferredValue = useDeferredValue(Array.from(selectedKeys).join(", ").replaceAll("_", " "));
  const stepNumber = 0;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [purposeIsInvalid, setPurposeIsInvalid] = useState(false);
  const [detailsIsInvalid, setDetailsIsInvalid] = useState(false);
  const [serviceDescIsInvalid, setServiceDescIsInvalid] = useState(false);
  const formData = sessionData?.formData || {};

  useEffect(() => {
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
      if (isOtherSelected && (!formData[stepNumber]?.purposeDetails || formData[stepNumber].purposeDetails.length < 10)) {
        setError("Additional details are required. (10 characters minimum)");
        setDetailsIsInvalid(true);

        return false;
      }
      if (!formData[stepNumber]?.serviceDescription) {
        setError("Please provide a service description.");
        setServiceDescIsInvalid(true);

        return false;
      }
      if (formData[stepNumber].serviceDescription.length < 50) {
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

    updateFormData("purposeDetails", value);
    setDetailsIsInvalid(isOtherSelected && value.length < 10);
  };

  const handleServiceDescriptionChange = (e) => {
    const value = e.target.value;

    updateFormData("serviceDescription", value);
    setServiceDescIsInvalid(value.length < 50);
  };

  const [aiHints, setAiHints] = useState(null);
  const { incrementCounter, checkRateLimit } = useRateLimiter(`aiResponse_${stepNumber}`, 6, 3);

  useEffect(() => {
    // Ensure purpose is selected
    if (!formData?.[stepNumber]?.purpose) {
      setAiHints(null);

      return;
    }

    const question = content.questionAddition2;
    const purpose = formData[0].purpose;
    const purposeDetails = formData[0].purposeDetails || '';
    const serviceDescription = formData[0].serviceDescription;
    const serviceDescriptionPrompt = `Some details about my service: ${serviceDescription}` || '';
    const isOtherPurpose = purpose && purpose.indexOf("other") !== -1 && purposeDetails && purposeDetails.length > 10;

    if (serviceDescriptionPrompt && serviceDescription?.length > 15 && purpose && question) {
      const prompt = `I'm planning a website and need to answer to a question regarding what I offer. I need help with the following question: ${question}. Consider that the main purpose of the website is ${isOtherPurpose ? purposeDetails : purpose + purposeDetails}. ${serviceDescriptionPrompt} Keep it concise and to the point. Keep the response concise and informative, ensuring it's less than 450 characters.`;

      const handleFetchHint = async () => {
        await fetchAIHint({
          stepNumber,
          prompt,
          content,
          checkRateLimit,
          logger,
          incrementCounter,
          setAiHints,
          delay: 5000,
        });
      };



      handleFetchHint();


      return; // Cleanup the timeout on dependency change
    } else {
      setAiHints(null);
    }
  }, [formData, stepNumber, formData?.[stepNumber]?.purpose, formData?.[stepNumber]?.purposeDetails]);


  return (
    <form ref={formRef}>
      <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:my-10 p-4 rounded-xl max-w-screen-xl bg-content1">
        <div className="col-span-3 flex-1 space-y-4">
          <h2 className="text-lg font-semibold mb-4 text-primary dark:text-accentMint">
            {content.question}
          </h2>
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
                inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border  ${detailsIsInvalid ? "!bg-red-50 border-danger" : ""}`,
              }}
              isRequired={isOtherSelected}
              label="Additional Details"
              placeholder={`${content.placeholder[1]} (${isOtherSelected ? "required" : "optional"})`}
              value={formData?.[stepNumber]?.purposeDetails || ""}
              onChange={handleAdditionalDetailsChange}
            />
          </div>
          <div className="col-span-4 flex-1">
            <h2 className="text-lg font-semibold my-10 text-primary dark:text-accentMint relative">
              <ReactMarkdown>{content.questionAddition2}</ReactMarkdown>
            </h2>
          </div>
          <Textarea
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "",
              inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${serviceDescIsInvalid ? "!bg-red-50 border-danger dark:!bg-content1" : ""}`,
              base: "",
            }}
            isRequired={true}
            label="Service Description"
            minRows={4}
            placeholder={content.placeholder[2]}
            value={formData?.[stepNumber]?.serviceDescription || ""}
            onChange={handleServiceDescriptionChange}
          />
        </div>
        <Sidebar hints={aiHints} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
};

StepPurpose.displayName = 'StepPurpose';

export default StepPurpose;
