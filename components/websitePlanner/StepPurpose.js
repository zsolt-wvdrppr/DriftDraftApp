"use client";

import React, { useEffect, useState, useRef, useImperativeHandle } from "react";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Button,
  Input,
} from "@heroui/react";
import { Divider } from "@heroui/react";

import questionsData from "@/data/questions-data.json";
import logger from "@/lib/logger";
//import { fetchAIHint } from '@/lib/fetchAIHint';
import { useSessionContext } from "@/lib/SessionProvider";
import PasteButton from "@/components/planner-layout/layout/PasteButton";
import {
  StepWrapper,
  StepQuestion,
  StepTextarea,
} from "@/components/planner-layout/layout/sectionComponents";
import { StepGetAiHintBtn } from "@/components/planner-layout/layout/StepGetAiHintBtn";
import ModalWithReader from "@/components/planner-layout/layout/modal-with-reader";
import Tutorial from "@/components/tutorial/tutorial-custom";
import StartTutorialButton from "@/components/tutorial/start-tutorial-button";

const StepPurpose = ({ ref }) => {
  const [localPurposeDetails, setLocalPurposeDetails] = useState("");
  const [localServiceDescription, setLocalServiceDescription] = useState("");
  const { sessionData, updateFormData, setError } = useSessionContext();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const stepNumber = 0;
  const content = questionsData[stepNumber];
  const formRef = useRef();
  const [purposeIsInvalid, setPurposeIsInvalid] = useState(
    sessionData?.formData?.[stepNumber]?.purpose ? false : true
  );
  const [detailsIsInvalid, setDetailsIsInvalid] = useState(false);
  const [serviceDescIsInvalid, setServiceDescIsInvalid] = useState(false);
  const formData = sessionData?.formData || {};

  useEffect(() => {
    setLocalPurposeDetails(formData?.[stepNumber]?.purposeDetails || "");
    setLocalServiceDescription(
      formData?.[stepNumber]?.serviceDescription || ""
    );
    if (formData?.[stepNumber]?.purpose) {
      setSelectedKeys(new Set([formData?.[stepNumber]?.purpose]));
      setIsOtherSelected(
        formData?.[stepNumber]?.purpose === "Other (please specify)"
      );
    }
    if (!formData?.[stepNumber]?.purpose) {
      setSelectedKeys(new Set([]));
    }
    logger.info("Child component received formData:", formData);
  }, [formData, stepNumber]);

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      // Manual validation for NextUI fields
      //logger.info("selectedKeys", selectedKeys.currentKey);
      if (!formData?.[stepNumber]?.purpose) {
        setPurposeIsInvalid(true);
        setError("Please select a goal before proceeding.");

        return false;
      }
      if (
        isOtherSelected &&
        (!localPurposeDetails || localPurposeDetails?.length < 10)
      ) {
        setError("Additional details are required. (10 characters minimum)");
        setDetailsIsInvalid(true);

        return false;
      }
      if (!localServiceDescription || localServiceDescription?.length < 50) {
        setError(
          "Please provide a more detailed service description. Try to Refine with AI! (50 characters minimum)"
        );
        setServiceDescIsInvalid(true);

        return false;
      }
      setDetailsIsInvalid(false);
      setPurposeIsInvalid(false);
      setServiceDescIsInvalid(false);

      return true; // Validation passed
    },
  }));

  const handleSelectionChange = (keys) => {
    setSelectedKeys(keys);
    const selectedPurpose = keys.currentKey;

    updateFormData("purpose", selectedPurpose);
    setPurposeIsInvalid(!selectedPurpose);
  };

  const handleAdditionalDetailsChange = (e) => {
    const value = e.target.value;

    setLocalPurposeDetails(value);
    updateFormData("purposeDetails", value);
    setDetailsIsInvalid(isOtherSelected && value?.length < 10);
  };

  const handleServiceDescriptionChange = (e) => {
    const value = e.target.value;

    logger.debug("value", value);
    logger.debug("condition:", value?.length > 15 && !purposeIsInvalid);

    setLocalServiceDescription(value);
    updateFormData("serviceDescription", value);
    setServiceDescIsInvalid(value?.length < 50);
  };

  const [aiHint, setAiHint] = useState(
    sessionData?.formData?.[stepNumber]?.aiHint || null
  );
  const [userMsg, setUserMsg] = useState(null);
  const [isAIAvailable, setIsAIAvailable] = useState(true);

  useEffect(() => {
    if (localServiceDescription?.length > 15 && !purposeIsInvalid) {
      setIsAIAvailable(true);
    } else {
      setIsAIAvailable(false);
    }
  }, [localServiceDescription, purposeIsInvalid]);

  const purpose =
    selectedKeys ? `${selectedKeys.values().next().value}.` : "unknown.";
  const purposeDetails =
    localPurposeDetails ?
      `Additional details about the service’s purpose: ${localPurposeDetails}.`
    : "";
  const serviceDescription =
    localServiceDescription ?
      `Some details about what I offer to my audience: ${localServiceDescription}.`
    : "";

  const prompt = `Consider that the business goal is to ${purpose}. ${purposeDetails} The user offers: ${serviceDescription}. Refine what the user offers with a neutral description explaining, how it benefits the audience, and what challenges it solves. Keep the response informative and under 450 characters. Avoid direct marketing language or calls to action.Present the results in a clear and easy-to-read format using markdown! Do not return code!`;

  const [startTutorial, setStartTutorial] = useState(false);

  const tutorialSteps = [
    {
      target: ".new-session-btn",
      title: "Welcome to the\n\n Website Planner Tutorial! 🚀",
      content:
        "⚠️ Be careful!\n\nStarting a new session will reset the planner, and if your current session isn't saved, you will lose all progress. \n\nOnly click this if you're sure you want to start over!",
    },
    {
      target: ".progress-bar",
      title: "📊 Track Your Progress!",
      content:
        "This progress bar helps you see how far you've come. The more sections you complete, the closer you are to a fully planned website. Keep going! 🚀",
    },
    {
      target: ".section-selector-dropdown",
      title: "👆 Click It!",
      content:
        "📂 Navigate Through Sections!\n\nUse this dropdown to move between different sections of the planner. \n\n✅ Completed sections will be marked with a green tick so you can easily track progress.\n\n⚠️ If you try to move ahead without finishing a required section, an error message will appear at the bottom to explain what’s missing. Give it a try.",
    },
    {
      target: ".select-goal",
      title: "🎯 Select Your Goal!",
      content:
        "Choose the goal that best describes your website’s purpose. \n\nPicking the right goal ensures your plan aligns with your business objectives!",
    },
    {
      target: ".additional-details",
      title: "📝 Add More Details!",
      content:
        "Provide additional details about your website’s purpose. \n\nFor example:\n👉 'I want to get subscribers' \n👉 'I aim to sell digital products' \n\nTry writing your main goal here!",
    },
    {
      target: ".service-description",
      title: "💼 Describe Your Services!",
      content:
        "Explain what you offer to your audience. \n\nFor example:\n👉 'I offer a subscription to my newsletter' \n👉 'I provide online coaching sessions' \n\nGive it a go! ✍️",
    },
    {
      target: ".get-ai-hint-btn",
      title: "💡 Try This!",
      content:
        "Click this button to get an AI-generated suggestion for this section! \n\n🚀 Even if you're unsure what to write, just type in a few words and give it a try! \n\n⚠️ If this button is disabled, make sure you've filled in the required fields first.",
    },
    {
      target: ".why-we-ask-btn",
      title: "👆 Click It!",
      content:
        "❓ Why This Question?\n\nCurious why we ask this? Click here to learn how your answers help shape your website’s strategy and make it more effective.",
    },
    {
      target: ".check-hint-btn",
      title: "🧐 Review & Copy AI Suggestions!",
      content:
        "If you've received an AI-generated suggestion, click here to review it before using it.\n\n📋 Found it useful? You can also copy it directly from this panel and paste it into your answer field for easy editing!",
    },
    {
      target: ".paste-btn",
      title: "📌 Paste Your Suggestion!",
      content:
        "Use this button to paste the copied suggestion into your answer field. \n\n📌 It will be added below any existing text, so you can refine your response with ease.",
    },
    {
      target: ".next-btn",
      title: "➡️ Move Forward!",
      content:
        "Click this button to go to the next section. \n\n🛠️ If you're logged in, your session will be saved automatically and can be continued later under 'My Activities'.\n\n🏁 This tutorial ends here! If you want to redo it, just click on the 🛟 lifebuoy icon on the right. 🎉",
    },
  ];

  const simpleContent = (
    <div className="space-y-4">
    <h3 className="text-lg font-semibold">Getting Started with Your Website Planner</h3>
  
    <p>
      To build a great website, we start with clarity. Just answer a few key questions to help us shape your plan.
    </p>

    <div className="p-4 w-full">
    <video autoPlay loop className="object-contain -mr-10 border-2 rounded-lg" controls={false} muted={true}>
      <source src="/guide-videos/website-planner-purpose.mp4" type="video/mp4" />
      <track
        label="English"
        src="/guide-videos/captions-en.vtt"
        srcLang="en"
      />
      Your browser does not support the video tag.
    </video>
    </div>
  
    <div className="bg-green-50 p-4 rounded-md">
      <h4 className="font-medium text-green-800">Quick Overview</h4>
      <ul className="list-disc pl-5 text-green-700 space-y-1">
        <li><strong>Goal:</strong>{` Select your website’s main purpose.`}</li>
        <li><strong>Extra goal details:</strong> {`Optional — unless you pick "Other".`}</li>
        <li><strong>Service description:</strong> Tell us what you offer and how it helps your audience.</li>
      </ul>
    </div>
  
    <div className="bg-yellow-50 p-4 rounded-md">
      <h4 className="font-medium text-yellow-800">Pro Tip</h4>
      <p className="text-yellow-700">
        The more detail you give, the more helpful our AI can be. Use the <strong>{`"Refine with AI"`}</strong> button to enhance your message instantly.
      </p>
    </div>
  
    <p>
      {`First time here? After closing this guide, you’ll have the option to take a short tutorial — it's quick, helpful, and skippable anytime.`}
    </p>
  
    <p><strong>{`Let’s make something amazing. You’re in control — and we’re here to help.`}</strong></p>
  </div>
  
  );

  return (
    <form ref={formRef}>
      <ModalWithReader
        autoPop={true}
        content={simpleContent}
        title="Website Planning Tips"
      />
      <StartTutorialButton setStartTutorial={setStartTutorial} />
      <Tutorial
        localStorageId="website-purpose"
        startTrigger={startTutorial}
        tutorialSteps={tutorialSteps}
      />
      <StepWrapper
        hint={aiHint}
        userMsg={userMsg}
        whyDoWeAsk={content?.why_do_we_ask}
      >
        <StepQuestion content={content} />
        <div className="flex flex-col md:flex-row gap-4 my-first-step">
          <Dropdown>
            <DropdownTrigger>
              <Button
                className="select-goal capitalize w-full"
                color={purposeIsInvalid ? "danger" : "default"}
                variant="bordered"
              >
                {Array.from(selectedKeys).join(", ").replaceAll("_", " ") ||
                  content?.placeholder[0]}
                {content?.required && (
                  <span className="text-red-500 ml-[-6px]">*</span>
                )}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Single selection example"
              color=""
              isRequired={content?.required}
              selectedKeys={selectedKeys}
              selectionMode="single"
              variant="flat"
              onSelectionChange={handleSelectionChange}
            >
              {content.options.map((option) => (
                <DropdownItem key={option} className="hover:bg-secondary hover:text-white transition-all">{option}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Input
            className="additional-details"
            classNames={{
              label: "!text-primary dark:!text-accentMint",
              input: "dark:!text-white",
              inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${detailsIsInvalid ? "border-danger !bg-danger-50" : ""}`,
            }}
            isRequired={isOtherSelected}
            label="Additional Details Of Your Goals"
            placeholder={`(${isOtherSelected ? "required" : "optional"}) ${content?.placeholder[1]}`}
            validationBehavior="aria"
            value={localPurposeDetails}
            onChange={handleAdditionalDetailsChange}
          />
        </div>
        <Divider className="my-8" />
        <div className="col-span-4 flex-1 my-other-step">
          <StepQuestion
            content={content}
            question={content?.questionAddition2}
          />
        </div>
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

        <PasteButton
          handleChange={handleServiceDescriptionChange}
          setError={setError}
          value={localServiceDescription}
        >
          <StepTextarea
            content={content}
            handleTextareaChange={handleServiceDescriptionChange}
            isInputInvalid={serviceDescIsInvalid}
            isRequired={true}
            label="Service Description"
            localValue={localServiceDescription}
            placeholder={content?.placeholder[2]}
          />
        </PasteButton>
      </StepWrapper>
    </form>
  );
};

StepPurpose.displayName = "StepPurpose";

export default StepPurpose;
