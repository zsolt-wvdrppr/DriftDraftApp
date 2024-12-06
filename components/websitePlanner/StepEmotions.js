'use client';

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import questionsData from "@/data/questions-data.json";
import { Textarea } from '@nextui-org/react';
import Sidebar from './actionsBar';
import useRateLimiter from '@/lib/useRateLimiter';

const StepEmotions = forwardRef(({ formData, setFormData, setError }, ref) => {
  const stepNumber = 7;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [attractionIsInvalid, setAttractionlsIsInvalid] = useState(false);


  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber]?.emotions) {
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
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], emotions: value } });

    // Provide immediate feedback for required field
    setAttractionlsIsInvalid(!value);
  };

  const [aiHints, setAiHints] = useState('');
  const { incrementCounter, checkRateLimit } = useRateLimiter(`aiResponse_${stepNumber}`, 3, 3);

  useEffect(() => {
    const question = content.question;
    const marketing = formData[2].marketing || '';
    const competitors = formData[3].urls.toString() !== '' ? `I have identified the following competitors: ${formData[3].urls.toString()}.` : '';
    const purpose = formData[0].purpose;
    const purposeDetails = formData[0].purposeDetails || '';
    const serviceDescription = formData[0].serviceDescription;
    const audience = formData[1].audience;
    const usps = formData[4].usps || '';
    const brandGuidelines = formData[5].brandGuidelines || '';


    if (purpose && serviceDescription && serviceDescription && audience && usps) {

      const prompt = `Help me clarify the emotional experience I want visitors to have on my website. The purpose of the website is ${purpose}, with a focus on ${purposeDetails}. Here's what the website offers: ${serviceDescription}. My target audience is: ${audience}. I want the website to make a strong emotional connection with them. ${competitors}. My unique selling points include: ${usps}. Based on this context, please ask thought-provoking questions or provide examples to help me define the emotional tone of my website. For example:
      1. What feelings (e.g., excitement, calmness, trust, inspiration) would make my audience feel connected to the brand?
      2. How do I want visitors to describe their experience after using the website (e.g., ‘engaging,’ ‘professional,’ ‘warm,’ etc.)?
      3. What kind of impression or mood do I want to leave on visitors when they first land on my homepage?
      Please provide a framework or examples to help me articulate these emotions clearly, and explain why defining these emotions is critical to my website’s success. Keep it conversational and insightful, encouraging me to think deeply about the impact I want my website to have. Keep the response concise and informative, ensuring it's less than 800 characters.`;

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
      <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:py-10 max-w-screen-xl">
        <div className="col-span-4 flex-1">
          <h2 className="text-lg font-semibold mb-4 text-primary dark:text-accentMint">
            {content.question} {content.required && <span className="text-red-500">*</span>}
          </h2>
        </div>
        <div className="col-span-3 flex-1 space-y-4">
          <Textarea
            label="Emotions and User Experience"
            placeholder={content.placeholder}
            minRows={4}
            value={formData?.[stepNumber]?.emotions || ""}
            isRequired={true}
            onChange={handleTextareaChange}
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "",
              inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${attractionIsInvalid ? "!bg-red-50 border-danger" : ""}`,
            }}
          />
        </div>
        <Sidebar hints={`${aiHints}`} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
});

StepEmotions.displayName = 'StepEmotions';

export default StepEmotions;
