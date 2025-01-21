'use client';

import React, { useEffect, useState, useRef, useImperativeHandle } from 'react';
import { Textarea } from '@heroui/react';

import questionsData from "@/data/questions-data.json";
import logger from '@/lib/logger';
import { fetchAIHint } from '@/lib/fetchAIHint';
import { useSessionContext } from '@/lib/SessionProvider';

import { StepWrapper, StepQuestion, StepTextarea } from './layout/sectionComponents';
import PasteButton from './layout/PasteButton';
import StepGetAiHintBtn from './layout/StepGetAiHintBtn';

const StepBrandGuidelines = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 6;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [isInputInvalid, setIsInputInvalid] = useState(false);
  const formData = sessionData.formData;
  const [localValue, setLocalValue] = useState("");

  useEffect(() => {
    setLocalValue(formData?.[stepNumber]?.brandGuidelines || "");
  }, [formData, stepNumber]);

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber]?.brandGuidelines) {
        setError("Additional details are required.");
        setIsInputInvalid(true);

        return false;
      }
      setIsInputInvalid(false);

      return true; // Validation passed
    },
  }));

  const handleTextareaChange = (e) => {
    const value = e.target.value;

    updateFormData("brandGuidelines", value);
    setLocalValue(value);
    // Provide immediate feedback for required field
    setIsInputInvalid(!value);
  };

  const [aiHint, setAiHint] = useState(sessionData?.formData?.[stepNumber]?.aiHint || null);
  const [userMsg, setUserMsg] = useState(null);
  const question = content.question;
  const marketing = formData[2].marketing || '';
  const competitors = formData[3].urls.toString() !== '' ? `I have identified the following competitors: ${formData[3].urls.toString()}.` : '';
  const purpose = formData[0].purpose;
  const purposeDetails = formData[0].purposeDetails || '';
  const serviceDescription = formData[0].serviceDescription;
  const audience = formData[1].audience;
  const usps = formData[4].usps || '';
  const domains = formData[5].domain || '';
  const isAIAvailable = (purpose && serviceDescription && question && serviceDescription && audience && marketing && usps && domains);

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

  return (
    <form ref={formRef}>
      <StepWrapper hint={aiHint} userMsg={userMsg} whyDoWeAsk={content.why_do_we_ask}>
        <StepQuestion content={content} />
        <StepGetAiHintBtn
          stepNumber={stepNumber}
          content={content}
          sessionData={sessionData}
          updateFormData={updateFormData}
          setError={setError}
          setAiHint={setAiHint}
          setUserMsg={setUserMsg}
          prompt={prompt}
          isAIAvailable={isAIAvailable}
        />
        <PasteButton value={localValue} handleChange={handleTextareaChange} setError={setError}>
          <StepTextarea
            content={content}
            label='Brand Guidelines'
            localValue={localValue}
            handleTextareaChange={handleTextareaChange}
            isRequired={true}
            isInputInvalid={isInputInvalid}
          />
        </PasteButton>
      </StepWrapper>
    </form>
  );
};

export default StepBrandGuidelines;
