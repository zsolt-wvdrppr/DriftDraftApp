"use client";

import React, { useRef, useState, useImperativeHandle, useEffect } from "react";
import { Input, Button, Divider } from "@heroui/react";
import {
  IconXboxXFilled,
  IconRowInsertBottom,
  IconWorldWww,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";

import questionsData from "@/data/landing-questions-data.json";
import logger from "@/lib/logger";
import { useSessionContext } from "@/lib/SessionProvider";
import {
  StepWrapper,
  StepQuestion,
} from "@/components/planner-layout/layout/sectionComponents";
import { StepGetAiHintBtn } from "@/components/planner-layout/layout/StepGetAiHintBtn";
import LocationSearch from "@/components/planner-layout/location-search";

const StepCompetitors = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 3;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const formData = sessionData?.formData || {};

  useEffect(() => {
    if (!formData[stepNumber]?.urls) {
      updateFormData("urls", [""]);
    }
  }, [formData, stepNumber]);

  const [urls, setUrls] = useState(formData[stepNumber]?.urls || [""]);

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      if (urls.some((url) => !validateURL(url) && url !== "")) {
        setError("All URLs must be valid.");
        logger.info("urls", urls);

        return false;
      }
      /*if (urls.length === 0 || urls.includes('')) {
        setError("Additional details are required.");
        return false;
      }*/
      setError(null);

      return true; // Validation passed
    },
  }));

  const validateURL = (url) => {
    // Remove protocol if present for domain validation
    const domainPart = url.replace(/^https?:\/\//, "");
    const parts = domainPart.split(".");

    // If starts with www, need 3 parts, else need 2 parts
    if (
      (parts[0] === "www" && parts.length < 3) ||
      (parts[0] !== "www" && parts.length < 2)
    )
      return false;

    const domainPartPattern = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

    return parts.every((part) => domainPartPattern.test(part));
  };

  const handleAddUrl = (index) => {
    if (!validateURL(urls[index])) {
      setError("Invalid URL. Please correct it before adding a new one.");

      return;
    }
    setError(null);
    const newUrls = [...urls, ""];

    setUrls(newUrls);
    updateFormData("urls", newUrls);
  };

  const handleRemoveUrl = (index) => {
    const updatedUrls = urls.filter((_, i) => i !== index);

    setUrls(updatedUrls.length > 0 ? updatedUrls : [""]);
    updateFormData("urls", updatedUrls);
  };

  const handleChangeUrl = (value, index) => {
    const updatedUrls = urls.map((url, i) => (i === index ? value : url));

    setUrls(updatedUrls);
    updateFormData("urls", updatedUrls);
  };

  // AI part

  const [aiHint, setAiHint] = useState(
    sessionData?.formData?.[stepNumber]?.aiHint || null
  );
  const [userMsg, setUserMsg] = useState(null);
  const [location, setLocation] = useState(null);
  const purpose = `${formData[0]?.purpose}.` || "";
  const purposeDetails = formData[0]?.purposeDetails
    ? `Additional details about the purpose: ${formData[0]?.purposeDetails}\n`
    : "";
  const serviceDescription =
    `What I offer to my audience: ${formData[0]?.serviceDescription}.\n` || "";
  const audience =
    `Consider the following regarding my ideal prospects: ${formData[1]?.audience}. ` ||
    "";
  const marketing =
    `Details about the marketing strategy: ${formData?.[2]?.marketing}` || "";

  const businessArea = location  ? `My customers are near ${location.address}.`
    : "";

  const isAIAvailable = purpose && serviceDescription && audience;

  //const prompt = `[SEARCH-MODE]Do you have access to google search?`;

  const prompt = `[SEARCH-MODE] Identify competitors${businessArea} Details about my business:
  ${serviceDescription}
  ${audience}
  ${businessArea}
    - List business names and their website URLs.
    - Include one short sentence for each competitor describing their main offering.
    - No extra text (no greetings, no conclusions, no disclaimers).
  `;

  return (
    <form ref={formRef}>
      <StepWrapper
        hint={aiHint}
        userMsg={userMsg}
        whyDoWeAsk={content.why_do_we_ask}
      >
        <StepQuestion content={content} />
        <StepGetAiHintBtn
          content={content}
          isAIAvailable={isAIAvailable}
          prompt={prompt}
          sessionData={sessionData}
          setAiHint={setAiHint}
          setError={setError}
          setUserMsg={setUserMsg}
          stepNumber={stepNumber}
          updateFormData={updateFormData}
        />
        {/* Input field to business location or service area */}
        <LocationSearch
          onSelect={(place) => {
            setLocation(place);
            logger.debug("Location selected:", place);
          }}
        />
        <Divider />
        <AnimatePresence initial={false}>
          {urls.map((url, index) => (
            <motion.div
              key={index}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2 my-4"
              exit={{ opacity: 0, height: 0 }}
              initial={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Input
                classNames={{
                  label: "!text-primary dark:!text-accentMint",
                  input: ``,
                  inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${!validateURL(url) && url ? "border-danger" : ""}`,
                }}
                //isRequired={true}
                label={`Competitor URL ${index + 1}`}
                placeholder={content.placeholder}
                startContent={
                  <IconWorldWww className="h-5 text-primary dark:text-accentMint opacity-70 ml-[-3px]" />
                }
                value={url}
                onChange={(e) => handleChangeUrl(e.target.value, index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault(); // Prevent form submission
                    handleAddUrl(index); // Call the function to add a new URL
                  }
                }}
              />
              {urls.length > 1 && (
                <IconXboxXFilled
                  className="text-danger cursor-pointer drop-shadow-lg opacity-70 hover:opacity-100 hover:scale-110 transition-all"
                  onClick={() => handleRemoveUrl(index)}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <Button
          className="mt-4 border hover:scale-105 transition-all focus-within:shadow-none"
          type="button"
          variant="shadow"
          onPress={() => handleAddUrl(urls.length - 1)}
        >
          <IconRowInsertBottom className="text-secondaryPersianGreen" />
          Add Another URL
        </Button>
      </StepWrapper>
    </form>
  );
};

export default StepCompetitors;
