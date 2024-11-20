'use client';

import React, { useEffect, useState, useRef, useDeferredValue, useImperativeHandle, forwardRef, use } from 'react';
import questionsData from "@/data/questions-data.json";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Textarea, Button, Input } from '@nextui-org/react';
import Sidebar from './actionsBar';
import ReactMarkdown from 'react-markdown';

const StepPurpose = forwardRef(({ formData, setFormData, setError }, ref) => {
  const [selectedKeys, setSelectedKeys] = useState(new Set([formData[0].purpose || ""]));
  const isOtherSelected = selectedKeys.has("Other (please specify)");
  const deferredValue = useDeferredValue(Array.from(selectedKeys).join(", ").replaceAll("_", " "));
  const stepNumber = 0;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [purposeIsInvalid, setPurposeIsInvalid] = useState(false);
  const [detailsIsInvalid, setDetailsIsInvalid] = useState(false);
  const [serviceDescIsInvalid, setServiceDescIsInvalid] = useState(false);


  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      console.log("selectedKeys", selectedKeys.currentKey);
      if (!formData[stepNumber].purpose) {
        setPurposeIsInvalid(true);
        setError("Please select a goal before proceeding.");
        return false;
      }
      if (isOtherSelected && !formData[stepNumber].purposeDetails) {
        setError("Additional details are required.");
        setDetailsIsInvalid(true);
        return false;
      }
      if (!formData[stepNumber].serviceDescription) {
        setError("Please provide a service description.");
        setServiceDescIsInvalid(true);
        return false;
      }
      if (formData[stepNumber].serviceDescription.length < 50) {
        console.log("formData[stepNumber].serviceDescription.length", formData[stepNumber].serviceDescription.length);
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

  return (
    <form ref={formRef}>
      <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:py-10 max-w-screen-xl">
        <div className="col-span-4 flex-1">
          <h2 className="text-lg font-semibold mb-4 text-primary">
            {content.question}
          </h2>
        </div>
        <div className="col-span-3 flex-1 space-y-4">
          <div className='flex flex-col md:flex-row gap-4'>
            <Dropdown>
              <DropdownTrigger>
                <Button variant="bordered" className="capitalize w-full" color={purposeIsInvalid ? "danger" : "default"}>
                  {deferredValue || content.placeholder[0]}{content.required && <span className="text-red-500 ml-[-6px]">*</span>}
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
              value={formData[0].purposeDetails || ""}
              isRequired={isOtherSelected}
              onChange={handleAdditionalDetailsChange}
              classNames={{
                label: "!text-primary",
                input: "dark:!text-neutralDark",
                inputWrapper: `hover:!bg-yellow-50 border ${detailsIsInvalid ? "!bg-red-50 border-danger" : ""}`,
              }}
            />
          </div>
          <div className="col-span-4 flex-1">
            <h2 className="text-lg font-semibold my-10 text-primary relative">
              <ReactMarkdown>{content.questionAddition2}</ReactMarkdown>
            </h2>
          </div>
          <Textarea
            label="Service Description"
            placeholder={content.placeholder[2]}
            minRows={4}
            value={formData[0].serviceDescription || ""}
            isRequired={true}
            onChange={handleServiceDescriptionChange}
            classNames={{
              label: "!text-primary",
              input: "dark:!text-neutralDark",
              inputWrapper: `hover:!bg-yellow-50 border ${serviceDescIsInvalid ? "!bg-red-50 border-danger" : ""}`,
            }}
          />
        </div>
        <Sidebar hints={content.hints} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
});

StepPurpose.displayName = 'StepPurpose';

export default StepPurpose;
