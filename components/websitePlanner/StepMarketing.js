'use client';

import React, { useEffect, useState, useRef, useImperativeHandle } from 'react';
import { Textarea } from '@nextui-org/react';

import questionsData from "@/data/questions-data.json";
import logger from '@/lib/logger';
import { fetchAIHint } from '@/lib/fetchAIHint';
import { useSessionContext } from "@/lib/SessionProvider";

import PasteButton from './layout/PasteButton';
import { StepWrapper, StepQuestion, StepTextarea } from './layout/sectionComponents';

const StepMarketing = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 2;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [isInputInvalid, setIsInputInvalid] = useState(false);
  const formData = sessionData?.formData || {};
  const [localValue, setLocalValue] = useState("");

  useEffect(() => {
    setLocalValue(formData?.[stepNumber]?.marketing || "");
  }, [formData?.[stepNumber]?.marketing, stepNumber]);

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber]?.marketing) {
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

    updateFormData("marketing", value);
    setLocalValue(value);
    // Provide immediate feedback for required field
    setIsInputInvalid(!value);
  };

  const [aiHint, setAiHint] = useState(null);
  const [userMsg, setUserMsg] = useState(null);

  useEffect(() => {
    const question = content.question;
    const purpose = formData[0].purpose;
    const purposeDetails = formData[0].purposeDetails || '';
    const serviceDescription = formData[0].serviceDescription;
    const audience = formData[1].audience;

    if (purpose && serviceDescription && question && serviceDescription && audience) {

      const prompt = `I'm planning a website and need to answer to a question regarding my target audience. I need help with the following question: ${question}. Consider that the main purpose of the website is ${purpose}, ${purposeDetails} and here's a description about what I offer: ${serviceDescription}. The description of my target audience is as follows: ${audience}. Help me answering the question, and find potential incoming traffic sources. Keep it concise and to the point. Must keep it less then 600 characters.`;

      const handleFetchHint = async () => {
        await fetchAIHint({
          stepNumber,
          prompt,
          content,
          setAiHint,
          setUserMsg,
          sessionData,
          updateFormData
        });
      };

      logger.info("fetching content");
      handleFetchHint();
    } else {
      logger.info("resetting hint");
      setAiHint(null);
      setUserMsg(null);
    }
  }, []);

  return (
    <form ref={formRef}>
      <StepWrapper hint={aiHint} userMsg={userMsg} whyDoWeAsk={content.why_do_we_ask}>
          <StepQuestion content={content} />
          <PasteButton value={localValue} handleChange={handleTextareaChange} setError={setError}>
            <StepTextarea
              content={content}
              label="Incoming Traffic Sources"
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

export default StepMarketing;
