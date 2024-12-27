'use client';

import React, { useRef, useState, useImperativeHandle, useEffect } from 'react';
import { Input } from '@nextui-org/react';

import questionsData from "@/data/questions-data.json";
import useRateLimiter from '@/lib/hooks/useRateLimiter';
import logger from '@/lib/logger';
import { fetchAIHint } from '@/lib/fetchAIHint';
import { useSessionContext } from '@/lib/SessionProvider';

import Sidebar from './ActionsBar/Main';

const StepDomain = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 5;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [attractionIsInvalid, setAttractionlsIsInvalid] = useState(false);
  const formData = sessionData.formData;
  const [localValue, setLocalValue] = useState(formData[stepNumber]?.domain || '');

  useEffect(()=>{
    setLocalValue(formData?.[stepNumber]?.domain || "");
  },[formData?.[stepNumber]?.domain, stepNumber])

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      if (!formData[stepNumber]?.domain) {
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

    updateFormData("domain", value);
    setLocalValue(value);
    // Provide immediate feedback for required field
    setAttractionlsIsInvalid(!value);
  };

  const [aiHint, setAiHint] = useState(null);
  const [userMsg, setUserMsg] = useState(null);

  useEffect(() => {
    const question = content.question;
    const marketing = formData[2].marketing || '';
    const competitors = formData[3].urls.toString() !== '' ? `I have identified the following competitors: ${formData[3].urls.toString()}.` : '';
    const purpose = formData[0].purpose;
    const purposeDetails = formData[0].purposeDetails || '';
    const serviceDescription = formData[0].serviceDescription;
    const audience = formData[1].audience;
    const usps = formData[4].usps || '';

    if (purpose && serviceDescription && question && serviceDescription && audience && marketing && usps) {

      const prompt = `I'm planning a website and need some ideas for a domain. Consider that the main purpose of the website is ${purpose}, ${purposeDetails} and here's a description about what I offer: ${serviceDescription}. The description of my target audience is as follows: ${audience}. This is how I plan to attract my audience: ${marketing}. ${competitors}. About my unique selling points: ${usps}. So give me some ideas while strictly following guidelines and other SEO best practices and outline them how they're applied: ${content.hint}. The domain name must be SHORT and Concise so must not be longer than 15 characters. Keep it concise and to the point. The response must be less than 450 characters.`;
 
      const handleFetchHint = async () => {
        await fetchAIHint({
          stepNumber,
          prompt,
          content,
          setAiHint,
          setUserMsg,
          sessionData,
          updateFormData,
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
      <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:py-10 max-w-screen-xl">
        <div className="col-span-3 flex-1 space-y-4">
          <h2 className="text-lg font-semibold mb-4 text-primary dark:text-accentMint">
            {content.question} {content.required && <span className="text-red-500">*</span>}
          </h2>
          <Input
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "",
              inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${attractionIsInvalid ? "!bg-red-50 border-danger" : ""}`,
            }}
            isRequired={true}
            label="Domain Name"
            placeholder={content.placeholder}
            value={localValue}
            onChange={handleTextareaChange}
          />
        </div>
        <Sidebar hint={aiHint} userMsg={userMsg} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
};

export default StepDomain;
