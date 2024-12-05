'use client';

import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import questionsData from "@/data/questions-data.json";
import { Textarea } from '@nextui-org/react';
import Sidebar from './actionsBar';

const StepAudience = ({ formData, setFormData, setError, ref, ...props }) => {
  const stepNumber = 1;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [audienceIsInvalid, setAudiencelsIsInvalid] = useState(false);


  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber]?.audience) {
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

  const [aiHints, setAiHints] = useState(null);

  useEffect(() => {
    const question = content.question;
    const purpose = formData[0].purpose;
    const purposeDetails = formData[0].purposeDetails || '';
    const serviceDescription = formData[0].serviceDescription;

    if (purpose && serviceDescription && question && serviceDescription) {

      const prompt = `I'm planning a website and need to answer to a question regarding my target audience. I need help with the following question: ${question}. Consider that the main purpose of the website is ${purpose} ${purposeDetails} and here's a description about what I offer: ${serviceDescription}. Keep it concise and to the point. Keep the response concise and informative, ensuring it's less than 450 characters.`;
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
          <h2 className="text-lg font-semibold mb-4 text-primary dark:text-accentMint">
            {content.question} {content.required && <span className="text-red-500">*</span>}
          </h2>
        </div>
        <div className="col-span-3 flex-1 space-y-4">
          <Textarea
            label="Target Audience"
            placeholder={content.placeholder}
            minRows={4}
            value={formData?.[stepNumber]?.audience || ""}
            isRequired={true}
            onChange={handleTextareaChange}
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "",
              inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${audienceIsInvalid ? "!bg-red-50 border-danger" : ""}`,
            }}
          />
        </div>
        <Sidebar hints={aiHints} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
};

StepAudience.displayName = 'StepAudience';

export default StepAudience;
