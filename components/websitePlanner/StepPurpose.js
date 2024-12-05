'use client';

import React, { useEffect, useState, useRef, useDeferredValue, useImperativeHandle, forwardRef } from 'react';
import questionsData from "@/data/questions-data.json";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Textarea, Button, Input } from '@nextui-org/react';
import Sidebar from './actionsBar';
import ReactMarkdown from 'react-markdown';

const StepPurpose = forwardRef(({ formData, setFormData, setError }, ref) => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false); // = selectedKeys.has("Other (please specify)");
  //const deferredValue = useDeferredValue(Array.from(selectedKeys).join(", ").replaceAll("_", " "));
  const stepNumber = 0;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [purposeIsInvalid, setPurposeIsInvalid] = useState(false);
  const [detailsIsInvalid, setDetailsIsInvalid] = useState(false);
  const [serviceDescIsInvalid, setServiceDescIsInvalid] = useState(false);

  useEffect(() => {
    if (formData?.[stepNumber]?.purpose) {
      setSelectedKeys(new Set([formData[stepNumber].purpose]));
      setIsOtherSelected(formData[stepNumber].purpose === "Other (please specify)");
    }
  }, [formData, stepNumber]);


  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      //console.log("selectedKeys", selectedKeys.currentKey);
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
    if (!keys.currentKey ? setPurposeIsInvalid(true) : setPurposeIsInvalid(false));
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], purpose: keys.currentKey } });
    // Provide immediate feedback for required field
    setDetailsIsInvalid(keys.has("Other (please specify)") && !formData[0].purposeDetails);
  };

  const handleAdditionalDetailsChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], purposeDetails: value } });

    // Provide immediate feedback for required field
    setDetailsIsInvalid(isOtherSelected && !value);
  };

  const handleServiceDescriptionChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], serviceDescription: value } });

    // Provide immediate feedback for required field
    setServiceDescIsInvalid(!value);
  };

  const [aiHints, setAiHints] = useState(null);

  useEffect(() => {
    // Ensure purpose is selected
    if (!formData?.[stepNumber]?.purpose) {
      setAiHints(null);
      return;
    }
    
    const question = content.questionAddition2;
    const purpose = formData[0].purpose;
    const purposeDetails = formData[0].purposeDetails || '';

    const isOtherPurpose = purpose && purpose.indexOf("other") !== -1 && purposeDetails && purposeDetails.length > 10;

    if ((isOtherPurpose && purposeDetails) || !isOtherPurpose) {
      const prompt = `I'm planning a website and need to answer to a question regarding what I offer. I need help with the following question: ${question}. Consider that the main purpose of the website is ${isOtherPurpose ? purposeDetails : purpose + purposeDetails}. Keep it concise and to the point. Keep the response concise and informative, ensuring it's less than 450 characters.`;

      const fetchContent = async () => {
        try {
          const response = await fetch("/api/googleAi", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "An unknown error occurred.");
          }

          const data = await response.json();
          setAiHints(data.content || "No content generated.");
        } catch (error) {
          console.error("Error fetching content:", error);
          setAiHints("An error occurred while generating content.");
        }
      };

      // Debounce mechanism
      const debounceTimer = setTimeout(() => {
        fetchContent();
      }, 5000); // Wait 500ms before sending the request

      return () => clearTimeout(debounceTimer); // Cleanup the timeout on dependency change
    } else {
      setAiHints(null);
    }
  }, [formData, stepNumber, formData?.[stepNumber]?.purpose, formData?.[stepNumber]?.purposeDetails]);


  return (
    <form ref={formRef}>
      <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:my-10 p-4 rounded-xl max-w-screen-xl bg-content1">
        <div className="col-span-4 flex-1">
          <h2 className="text-lg font-semibold mb-4 text-primary dark:text-accentMint">
            {content.question}
          </h2>
        </div>
        <div className="col-span-3 flex-1 space-y-4">
          <div className='flex flex-col md:flex-row gap-4'>
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="capitalize w-full" color={purposeIsInvalid ? "danger" : "default"}>
                  {Array.from(selectedKeys).join(", ").replaceAll("_", " ") || content.placeholder[0]}{content.required && <span className="text-red-500 ml-[-6px]">*</span>}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Single selection example"
                variant="flat"
                disallowEmptySelection
                color=""
                selectionMode="single"
                selectedKeys={selectedKeys}
                isRequired={content.required}
                onSelectionChange={handleSelectionChange}
              >
                {content.options.map((option) => (
                  <DropdownItem key={option}>{option}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Input
              label="Additional Details"
              placeholder={`${content.placeholder[1]} (${isOtherSelected ? "required" : "optional"})`}
              value={formData?.[stepNumber]?.purposeDetails || ""}
              isRequired={isOtherSelected}
              onChange={handleAdditionalDetailsChange}
              classNames={{
                label: "!text-primary dark:!text-accentMint",
                input: "dark:!text-white",
                inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border  ${detailsIsInvalid ? "!bg-red-50 border-danger" : ""}`,
              }}
            />
          </div>
          <div className="col-span-4 flex-1">
            <h2 className="text-lg font-semibold my-10 text-primary dark:text-accentMint relative">
              <ReactMarkdown>{content.questionAddition2}</ReactMarkdown>
            </h2>
          </div>
          <Textarea
            label="Service Description"
            placeholder={content.placeholder[2]}
            minRows={4}
            value={formData?.[stepNumber]?.serviceDescription || ""}
            isRequired={true}
            onChange={handleServiceDescriptionChange}
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "",
              inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${serviceDescIsInvalid ? "!bg-red-50 border-danger" : ""}`,
              base: "",
            }}
          />
        </div>
        <Sidebar hints={aiHints} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
});

StepPurpose.displayName = 'StepPurpose';

export default StepPurpose;
