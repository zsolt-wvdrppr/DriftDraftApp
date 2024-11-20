'use client';

import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Input, Button } from '@nextui-org/react';
import Sidebar from './actionsBar';
import questionsData from "@/data/questions-data.json";
import { IconXboxXFilled, IconRowInsertBottom, IconWorldWww } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

const StepDomain = forwardRef(({ formData, setFormData, setError }, ref) => {
  const stepNumber = 5;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [attractionIsInvalid, setAttractionlsIsInvalid] = useState(false);


  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber].domain) {
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
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], domain: value } });

    // Provide immediate feedback for required field
    setAttractionlsIsInvalid(!value);
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
          <Input
            label="Domain Name"
            placeholder={content.placeholder}
            value={formData[stepNumber].domain || ""}
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

StepDomain.displayName = 'StepDomain';

export default StepDomain;
