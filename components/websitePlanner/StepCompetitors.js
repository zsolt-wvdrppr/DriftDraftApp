"use client";

import React, { useRef, useState, useImperativeHandle, useEffect } from "react";
import { Input, Button, Divider } from "@heroui/react";
import {
  IconXboxXFilled,
  IconRowInsertBottom,
  IconWorldWww,
  IconClipboard,
} from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import { IconAlertTriangleFilled } from "@tabler/icons-react";

import questionsData from "@/data/questions-data.json";
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
    try {
      // Add protocol if missing to allow parsing with URL constructor
      const urlString = url.includes('://') ? url : `https://${url}`;
      
      // Use the URL constructor to validate the structure
      const urlObj = new URL(urlString);
      
      // Extract the hostname for validation
      const hostname = urlObj.hostname;
      
      // Basic domain validation
      const domainRegex = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;
      
      return domainRegex.test(hostname);
    } catch (error) {
      // If URL constructor throws an error, the URL is invalid
      return false;
    }
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
    ? ` and to ${formData[0]?.purposeDetails}\n`
    : "";
  const serviceDescription = `${formData[0]?.serviceDescription}.\n` || "";
  const audience = ` targetning ${formData[1]?.audience}. ` || "";
  const marketing =
    `Details about the marketing strategy: ${formData?.[2]?.marketing}` || "";

  const businessArea = location ? ` in ${location.address}.` : "";

  const isAIAvailable = purpose && serviceDescription && audience;

  //const prompt = `[SEARCH-GROUNDING]What is the population of Budapest in 2022 according to the latest estimates?`;

  const prompt = `[SEARCH-GROUNDING]Using possible search queries that my audience would use, identify possible competitors offering ${serviceDescription}${businessArea}? Grouped by search query Provide a list of competitor names, along with clickable website URLs, and a concise description of their core offering in one sentence. The aim is to ${purpose}${purposeDetails}. Present the results in a clear and easy-to-read format. If cannot find any, then broadn the search query or try in local language. Do not ask to user to change or broaden search query. No extra text (no greetings, no conclusions, no disclaimers) only the final result. Do not include the steps you took to get the result. Present the results in a clear and easy-to-read format using markdown! Do not return code!
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
        <div className="relative flex flex-row pt-4">
          <LocationSearch
            onSelect={(place) => {
              setLocation(place);
              logger.debug("Location selected:", place);
            }}
          />
          <IconAlertTriangleFilled className="text-amber-600 drop-shadow-xl mt-4 ml-2 animate-pulse" id="disclaimer" size={24} />
        </div>
        <Tooltip
          anchorSelect="#disclaimer"
          className="max-w-60 md:max-w-sm relative z-50"
          >
            <span className="font-semibold text-lg">Experimental feature</span><br /><br />
            {`At this step, the AI attempts to identify possible competitors using Google Search. This feature is in experimental mode, so results may be inaccurate or incomplete. Issues may arise in non-English regions or when searching within a narrow location. If no results are found, consider broadening the business area for better accuracy.`}
          </Tooltip>
        <Divider className="my-4" />
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
                endContent={
                  <IconClipboard
                    aria-label="Paste URL from clipboard"
                    className="text-primary dark:text-accentMint opacity-70 mr-[-3px] cursor-pointer mb-[2px]"
                    size={30}
                    title="Paste URL from clipboard"
                    onClick={() => {
                      // Paste URL from clipboard
                      navigator.clipboard.readText().then((text) => {
                        handleChangeUrl(text, index);
                      });
                    }}
                  />
                }
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
                  aria-label="Remove URL"
                  className="text-danger cursor-pointer drop-shadow-lg opacity-70 hover:opacity-100 hover:scale-110 transition-all"
                  title="Remove URL"
                  onClick={() => handleRemoveUrl(index)}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <Button
          aria-label="Add Another URL"
          className="mt-4 border hover:scale-105 transition-all focus-within:shadow-none"
          title="Add Another URL to the list"
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
