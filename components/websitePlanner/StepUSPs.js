'use client';

import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import questionsData from "@/data/questions-data.json";
import { Textarea } from '@nextui-org/react';
import Sidebar from './actionsBar';
import useRateLimiter from '@/lib/useRateLimiter';

const StepUSPs = forwardRef(({ formData, setFormData, setError }, ref) => {
  const stepNumber = 4;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [attractionIsInvalid, setAttractionlsIsInvalid] = useState(false);


  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber]?.usps) {
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
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], usps: value } });

    // Provide immediate feedback for required field
    setAttractionlsIsInvalid(!value);
  };

  const [aiHints, setAiHints] = useState(null);
  const { incrementCounter, checkRateLimit } = useRateLimiter(`aiResponse_${stepNumber}`, 3, 3);

  useEffect(() => {
    const question = content.question;
    const marketing = formData[2].marketing || '';
    const competitors = formData[3].urls.toString() !== '' ? `I have identified the following competitors: ${formData[3].urls.toString()}.` : '';
    const purpose = formData[0].purpose;
    const purposeDetails = formData[0].purposeDetails || '';
    const serviceDescription = formData[0].serviceDescription;
    const audience = formData[1].audience;

    if (purpose && serviceDescription && question && serviceDescription && audience && marketing) {

      const prompt = `I'm planning a website and I've been asked to answer the following question: ${question}. Consider that the main purpose of the website is ${purpose}, ${purposeDetails} and here's a description about what I offer: ${serviceDescription}. The description of my target audience is as follows: ${audience}. This is how I plan to attract my audience: ${marketing}. ${competitors}. So help me with answer the question while considering the above details. Keep the response concise and informative, ensuring it's less than 800 characters.`;
      const fetchContent = async () => {
        if (checkRateLimit()) {
          console.log("rate limited");
          const cachedResponse = localStorage.getItem(`aiResponse_${stepNumber}`);
          const lastAiGeneratedHint = cachedResponse ? `--- *Last AI generated hint* ---\n${(cachedResponse)}` : "";
          const limitExpires = new Date(parseInt(localStorage.getItem(`aiResponse_${stepNumber}_timestamp`)) + 3 * 60 * 60 * 1000);
          const limitExpiresInMinutes = Math.floor((limitExpires - new Date()) / 60000);
          setAiHints(`*AI assistance limit reached for this step. Try again in ${limitExpiresInMinutes} minutes.*\n\n ${content.hints}\n\n${lastAiGeneratedHint}`);
          return;
        }    
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
          const aiContent = `${data.content}` || content.hints;

          // Cache response
          localStorage.setItem(`aiResponse_${stepNumber}`, aiContent);
          setAiHints(aiContent);

          // Increment request count
          incrementCounter();

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
      <div className="flex flex-col-reverse md:grid md:grid-cols-4 gap-6 md:py-10 max-w-screen-xl">
        <div className="col-span-4 flex-1">
          <h2 className="text-lg font-semibold mb-4 text-primary dark:text-accentMint">
            {content.question} {content.required && <span className="text-red-500">*</span>}
          </h2>
        </div>
        <div className="col-span-3 flex-1 space-y-4">
          <Textarea
            label="Unique Selling Points"
            placeholder={content.placeholder}
            minRows={4}
            value={formData?.[stepNumber]?.usps || ""}
            isRequired={true}
            onChange={handleTextareaChange}
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "",
              inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${attractionIsInvalid ? "!bg-red-50 border-danger" : ""}`,
            }}
          />
        </div>
        <Sidebar hints={aiHints} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
});

StepUSPs.displayName = 'StepUSPs';

export default StepUSPs;
