'use client';

import React, { useEffect, useState, useRef, useDeferredValue, useImperativeHandle, forwardRef, use } from 'react';
import questionsData from "@/data/questions-data.json";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Textarea, Button } from '@nextui-org/react';
import Sidebar from './actionsBar';

const StepAudience = forwardRef(({ formData, setFormData, setError }, ref) => {
  const stepNumber = 1;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [audienceIsInvalid, setAudiencelsIsInvalid] = useState(false);


  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber].audience) {
        setError("Additional details are required.");
        setAudiencelsIsInvalid(true);
        return false;
      }
      setAudiencelsIsInvalid(false);
      return true; // Validation passed
    },
  }));

  const handleTextareaChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], audience: value } });

    // Provide immediate feedback for required field
    setAudiencelsIsInvalid(!value);
  };

  return (
    <form ref={formRef}>
      <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:py-10 max-w-screen-xl">
        <div className="col-span-4 flex-1">
          <h2 className="text-lg font-semibold mb-4 text-primary">
            {content.question} {content.required && <span className="text-red-500">*</span>}
          </h2>
        </div>
        <div className="col-span-3 flex-1 space-y-4">
          <Textarea
            label="Target Audience"
            placeholder={content.placeholder}
            minRows={4}
            value={formData[1].audience || ""}
            isRequired={true}
            onChange={handleTextareaChange}
            classNames={{
              label: "!text-primary",
              input: "dark:!text-neutralDark",
              inputWrapper: `hover:!bg-yellow-50 border ${audienceIsInvalid ? "!bg-red-50 border-danger" : ""}`,
            }}
          />
        </div>
        <Sidebar hints={content.hints} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
});

StepAudience.displayName = 'StepAudience';

export default StepAudience;
