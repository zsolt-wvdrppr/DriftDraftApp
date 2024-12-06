'use client';

import React, { useEffect, useState, useRef, useDeferredValue, useImperativeHandle, forwardRef, use } from 'react';
import questionsData from "@/data/questions-data.json";
import { Textarea } from '@nextui-org/react';
import Sidebar from './actionsBar';
import useRateLimiter from '@/lib/useRateLimiter';

const StepBrandGuidelines = forwardRef(({ formData, setFormData, setError }, ref) => {
  const stepNumber = 6;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [attractionIsInvalid, setAttractionlsIsInvalid] = useState(false);


  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber]?.brandGuidelines) {
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
    const usps = formData[4].usps || '';
    const domains = formData[5].domain || '';


    if (purpose && serviceDescription && question && serviceDescription && audience && marketing && usps && domains) {

      const prompt = `I'm planning a website and need detailed ideas for brand guidelines, including colours, fonts, and logo design. The primary purpose of the website is ${purpose}, with a focus on ${purposeDetails}. Here’s an overview of what I offer: ${serviceDescription}. 

      My target audience is described as: ${audience}. This is how I plan to attract them: ${marketing}. ${competitors} My unique selling points include: ${usps}. 

      Please provide thoughtful and creative brand guideline ideas that align with the following considerations:
      1. **Logo Design**:
        - Should effectively represent the brand's identity and values.
        - Incorporate any symbolic meaning or unique story tied to the brand.
        - Ensure the design can adapt to different formats (e.g., web, print, favicon).
      2. **Colour Palette**:
        - Suggest colors that align with the brand's purpose and evoke the right emotions (e.g., warm tones for love and passion, cool tones for trust and calmness).
        - Provide reasoning for the suggested tones, focusing on their psychological and emotional impact on the target audience.
        - Recommend how to balance or contrast primary and secondary colors for a harmonious aesthetic.
      3. **Typography**:
        - Suggest fonts that are legible and reflect the brand’s tone (e.g., elegant, modern, playful, professional).
        - Highlight how font choices can reinforce the brand personality and ensure consistency across different mediums.
      4. **Overall Branding**:
        - Emphasize a cohesive, recognizable style that reflects the brand’s values and unique selling points.
        - Suggest ways to keep the branding simple yet memorable.
      5. **Application**:
        - Illustrate how these guidelines can be practically applied to website design, marketing materials, and social media, ensuring consistency and visual appeal.

      Focus on providing adaptable ideas that explain *why* specific elements are recommended, helping the brand resonate with its audience both emotionally and visually. Keep the response concise and informative, ensuring it's less than 800 characters.`;

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
            label="Branding"
            placeholder={content.placeholder}
            minRows={4}
            value={formData?.[stepNumber]?.brandGuidelines || ""}
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

StepBrandGuidelines.displayName = 'StepBrandGuidelines';

export default StepBrandGuidelines;
