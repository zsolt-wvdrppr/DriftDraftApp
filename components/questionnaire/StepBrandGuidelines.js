'use client';

import React, { useEffect, useState, useRef, useDeferredValue, useImperativeHandle, forwardRef, use } from 'react';
import questionsData from "@/data/questions-data.json";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Textarea, Button } from '@nextui-org/react';
import Sidebar from './actionsBar';

const StepBrandGuidelines = forwardRef(({ formData, setFormData, setError }, ref) => {
  const stepNumber = 6;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [attractionIsInvalid, setAttractionlsIsInvalid] = useState(false);


  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber].brandGuidelines) {
        setError("Additional details are required.");
        setAttractionlsIsInvalid(true);
        return false;
      }
      setAttractionlsIsInvalid(false);
      return true; // Validation passed
    },
  }));

  const handleTextareaChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], brandGuidelines: value } });

    // Provide immediate feedback for required field
    setAttractionlsIsInvalid(!value);
  };

  return (
    <form ref={formRef}>
      <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:py-10 max-w-screen-xl">
        <div className="col-span-4 flex-1">
          <h2 className="text-lg font-semibold mb-4 text-primary dark:text-slate-100">
            {content.question} {content.required && <span className="text-red-500">*</span>}
          </h2>
        </div>
        <div className="col-span-3 flex-1 space-y-4">
          <Textarea
            label="Branding"
            placeholder={content.placeholder}
            minRows={4}
            value={formData[stepNumber].brandGuidelines || ""}
            isRequired={true}
            onChange={handleTextareaChange}
            classNames={{
              label: "!text-primary",
              input: "dark:!text-neutralDark",
              inputWrapper: `hover:!bg-yellow-50 border ${attractionIsInvalid ? "!bg-red-50 border-danger" : ""}`,
            }}
          />
        </div>
        <Sidebar hints={content.hints} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
});

StepBrandGuidelines.displayName = 'StepBrandGuidelines';

export default StepBrandGuidelines;
