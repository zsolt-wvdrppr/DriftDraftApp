'use client';

import React, { useEffect, useState, useRef, useDeferredValue, useImperativeHandle, forwardRef, use } from 'react';
import questionsData from "@/data/questions-data.json";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Textarea, Button } from '@nextui-org/react';
import Sidebar from './actionsBar';

const StepMarketing = forwardRef(({ formData, setFormData, setError }, ref) => {
  const stepNumber = 2;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [attractionIsInvalid, setAttractionlsIsInvalid] = useState(false);


  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber].marketing) {
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
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], marketing: value } });

    // Provide immediate feedback for required field
    setAttractionlsIsInvalid(!value);
  };

  const [ aiHints, setAiHints ] = useState(null);

  useEffect(() => {
    if (formData[stepNumber-2].purpose) {
      const question = content.question;
      const purpose = formData[0].purpose;
      const purposeDetails = formData[0].purposeDetails || '';
      const serviceDescription = formData[0].serviceDescription;
      const audience = formData[1].audience;

      const prompt = `I'm planning a website and need to answer to a question regarding my target audience. I need help with the following question: ${question}. Consider that the main purpose of the website is ${purpose}, ${purposeDetails} and here's a description about what I offer: ${serviceDescription}. The description of my target audience is as follows: ${audience}. Help me answering the question, and find potential incoming traffic sources. Keep it concise and to the point. Must keep it less then 600 characters.`;
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
      console.log("fetching content");
      fetchContent();
    } else {
      console.log("resetting hints");
      setAiHints(null);
    }
  }, []);

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
            label="Incoming Traffic Sources"
            placeholder={content.placeholder}
            minRows={4}
            value={formData[stepNumber].marketing || ""}
            isRequired={true}
            onChange={handleTextareaChange}
            classNames={{
              label: "!text-primary",
              input: "dark:!text-neutralDark",
              inputWrapper: `hover:!bg-yellow-50 border ${attractionIsInvalid ? "!bg-red-50 border-danger" : ""}`,
            }}
          />
        </div>
        <Sidebar hints={aiHints} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
});

StepMarketing.displayName = 'StepMarketing';

export default StepMarketing;
