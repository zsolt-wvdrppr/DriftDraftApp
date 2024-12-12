'use client';

import React, { useEffect, useState, useRef, useImperativeHandle } from 'react';
import { Textarea } from '@nextui-org/react';

import questionsData from "@/data/questions-data.json";
import useRateLimiter from '@/lib/hooks/useRateLimiter';
import logger from '@/lib/logger';
import { fetchAIHint } from '@/lib/fetchAIHint';
import { useSessionContext } from '@/lib/SessionProvider';

import Sidebar from './ActionsBar/Main';

const StepBrandGuidelines = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 6;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [attractionIsInvalid, setAttractionlsIsInvalid] = useState(false);
  const formData = sessionData.formData;

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
    
    updateFormData("brandGuidelines", value);
  
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

      const handleFetchHint = async () => {
        await fetchAIHint({
          stepNumber,
          prompt,
          content,
          checkRateLimit,
          logger,
          incrementCounter,
          setAiHints,
        });
      };

      logger.info("fetching content");
      handleFetchHint();
    } else {
      logger.info("resetting hints");
      setAiHints(null);
    }
  }, []);

  return (
    <form ref={formRef}>
      <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:py-10 max-w-screen-xl">
        <div className="col-span-3 flex-1 space-y-4">
          <h2 className="text-lg font-semibold mb-4 text-primary dark:text-accentMint">
            {content.question} {content.required && <span className="text-red-500">*</span>}
          </h2>
          <Textarea
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "",
              inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${attractionIsInvalid ? "!bg-red-50 border-danger dark:!bg-content1" : ""}`,
            }}
            isRequired={true}
            label="Branding"
            minRows={4}
            placeholder={content.placeholder}
            value={formData?.[stepNumber]?.brandGuidelines || ""}
            onChange={handleTextareaChange}
          />
        </div>
        <Sidebar hints={aiHints} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
};

export default StepBrandGuidelines;
