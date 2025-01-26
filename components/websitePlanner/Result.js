"use client";

import React, { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import {
  Button,
  CircularProgress,
  Card,
  CardBody,
  CardFooter,
  Link,
} from "@heroui/react";
import { IconCopy } from "@tabler/icons-react";
import { Tooltip } from "react-tooltip";
import { useReCaptcha } from "next-recaptcha-v3";
import { IconChevronDown } from "@tabler/icons-react";

import { useSessionContext } from "@/lib/SessionProvider";
import logger from "@/lib/logger";
import { useAuth } from "@/lib/AuthContext";
import useGenerateTitle from "@/lib/hooks/useGenerateTitle";
import usePromptExecutor from "@/lib/hooks/usePromptExecutor";
import useClipboard from "@/lib/hooks/useClipboard";
import MyActivitiesBtn from "@/components/nav-layout/MyActivitiesBtn";

const Result = () => {
  const {
    sessionData,
    updateSessionData,
    updateAiGeneratedPlanInDb,
    updateSessionTitleInDb,
    setError,
  } = useSessionContext();
  const [aiResult, setAiResult] = useState(null);
  const aiResultRef = useRef(aiResult);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id;
  const sessionId = sessionData?.sessionId;
  const [contentForTitleGeneration, setContentForTitleGeneration] =
    useState(null);
  const { loading: titleLoading, generatedTitle } = useGenerateTitle(
    contentForTitleGeneration,
    updateSessionTitleInDb,
    userId,
    sessionId
  );
  const alreadyFetched = useRef(false);

  const { executeRecaptcha } = useReCaptcha();

  const {
    executePrompts,
    executedPrompts,
    loading: promptLoading,
    error,
    output,
  } = usePromptExecutor({ executeRecaptcha, pickedModel: "gemini-1.5-pro" });

  const [prompts, setPrompts] = useState([]);
  const { copyToClipboard, isPending } = useClipboard();

  /* Form data */
  const formData = sessionData.formData;
  const purpose = formData[0].purpose;
  const purposeDetails = formData[0]?.purposeDetails || ""; // optional
  const serviceDescription = formData[0].serviceDescription;
  const audience = formData[1].audience;
  const marketing = formData[2].marketing || "";
  const competitors =
    formData[3]?.urls?.toString() !== ""
      ? `I have identified the following competitors: ${formData[3].urls.toString()}.`
      : ""; // optional
  const usps = formData[4].usps || "";
  const domain = formData[5].domain || "";
  const brandGuidelines = formData[6].brandGuidelines || "";
  const emotions = formData[7].emotions || "";
  const inspirations = formData[8]?.inspirations?.toString() || ""; // optional
  /* End of form data */

  useEffect(() => {
    aiResultRef.current = aiResult;

    if (aiResultRef.current !== null) {
      // Prevent multiple updates
      updateSessionData("aiGeneratedPlan", aiResultRef.current);
      updateAiGeneratedPlanInDb(userId, sessionId, aiResultRef.current);
      setContentForTitleGeneration(
        serviceDescription +
          " " +
          domain +
          " " +
          brandGuidelines +
          " " +
          emotions
      );
      //logger.debug("Updating aiGeneratedPlan in DB:", aiResultRef.current);
    }
  }, [aiResult]);

  useEffect(() => {
    if (aiResult !== null && generatedTitle !== null && !titleLoading) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [aiResult, generatedTitle, titleLoading]);

  useEffect(() => {
    if (alreadyFetched.current || !userId || !sessionId) return; // Prevent second call
    alreadyFetched.current = true;

    if (
      purpose &&
      serviceDescription &&
      serviceDescription &&
      audience &&
      marketing &&
      usps &&
      brandGuidelines &&
      domain &&
      emotions
    ) {
      const prompts = [
        {
          prompt: `
            Prompt 1: Strategic Foundations
            Combine these user inputs:
              - Purpose: "${purpose}"
              - Purpose Details: "${purposeDetails}"
              - Services: "${serviceDescription}"
              - Audience: "${audience}"
            Task:
              - Generate a concise overview in bullet points.
              - Highlight the main website goals, services, and target audience.
              - If any detail is missing, mention it and why it is important to clarify.
              - Keep it straightforward and short.
          `,
          generateNewPrompts: false,
        },
        {
          prompt: `
            Prompt 2: Branding, Competition, and USP
            Combine these user inputs:
              - Brand Guidelines: "${brandGuidelines}"
              - Emotions (Emotional Impact): "${emotions}"
              - Competitors: "${competitors}"
              - Unique Selling Points (USPs): "${usps}"
              - Inspirations: "${inspirations}"
            Task:
              - Summarise how branding (colours, fonts, overall style) and emotional goals should shape the website.
              - Briefly discuss any relevant competitor insights.
              - Emphasise the USPs (why they're important for differentiation).
              - If anything is unclear, note it and recommend clarifying.
              - Provide short bullet points, focusing on design direction and overall impact.
          `,
          generateNewPrompts: false,
        },
        {
          prompt: `
            Prompt 3: Marketing Strategy & Technical Requirements
            Combine these user inputs:
              - Marketing Strategy: "${marketing}"
              - Domain Preferences: "${domain}"
            Task (two parts):
              1) Outline a concise marketing approach (SEO, content marketing, paid ads, etc.) based on the provided details.
                 - If no strategy is given, propose 2–3 simple ideas.
              2) Explain the essential developer requirements for building a site that is:
                 - Technically sound (fast loading, secure, SEO-ready).
                 - Capable of converting visitors effectively.
                 - Clear about any important integrations or frameworks.
              - Keep both parts brief and in bullet points.
          `,
          generateNewPrompts: false,
        },
        {
          prompt: `
            Prompt 4: Wireframe & Final Strategic Summary
            Task:
              - Suggest a simple wireframe outline for the main pages (e.g., homepage, services/products, about, contact).
              - Merge the previous prompts into a single final strategic overview that a developer or client can use.
                * Summarise the purpose, audience, branding, marketing, and key technical needs.
                * Include any missing info notes so the user knows what to clarify.
              - Return the final plan in a concise bullet-point format with short paragraphs where needed.
              - Keep it very straightforward and easy to understand.
          `,
          generateNewPrompts: false,
          dependsOn: 2, // or the index you want to depend on
        },
      ];

      setPrompts(prompts);

      // ✅ Execute prompts and update the session once complete
      const generateWebsitePlan = async () => {
        logger.info("Executing prompts for website plan generation...");
        const results = await executePrompts(prompts, userId);
        const combinedResult = results.join("\n\n");

        setAiResult(combinedResult);

        await updateAiGeneratedPlanInDb(userId, sessionId, combinedResult);
      };

      generateWebsitePlan();
    } else {
      logger.info("resetting hint");
      setAiResult(null);
    }
  }, [userId, sessionId]);

  useEffect(() => {
    // Remove URL params after setting the step
    if (window.history.replaceState) {
      const newUrl = window.location.pathname;

      window.history.replaceState(null, "", newUrl);
    }
  }, []);

  const [currentStep, setCurrentStep] = useState(0);

  const [progress, setProgress] = useState(0);

  const steps = [
    "Analyzing your inputs...",
    "Formulating a strategy...",
    "Generating website recommendations...",
    "Finalizing content...",
  ];

  useEffect(() => {
    if (isLoading && prompts.length > 0) {
      const completedCount = executedPrompts || 0;
      const totalCount = prompts.length;
      const calculatedProgress = (completedCount / totalCount) * 100;

      setProgress(calculatedProgress);
      setCurrentStep(Math.floor((completedCount / totalCount) * steps.length));

      // Ensure the progress bar completes only when all prompts finish
      if (completedCount === totalCount) {
        setProgress(100);
      }
    }

    logger.debug("[PROGRESS] - Calculated progress:", progress);
    logger.debug("[PROGRESS] - completedCount:", executedPrompts);
    logger.debug("[PROGRESS] - totalCount:", prompts.length);
  }, [executedPrompts, prompts, isLoading]);

  const aiResultWithTitle = `# ${generatedTitle}\n\n${aiResult}`;

  return (
    <div className=" md:mx-auto">
      {isLoading ? (
        <div className="flex flex-col left-0 top-0 bottom-0 right-0 absolute w-full items-center justify-center py-10">
          <Card
            aria-label="Progress indicator"
            className="h-60 max-w-96 border-none bg-transparent shadow-none"
          >
            <CardBody className="justify-center items-center pb-0">
              <CircularProgress
                aria-label="Generating content progress"
                classNames={{
                  svg: "w-36 h-36",
                  indicator: "stroke-neutralDark dark:stroke-white",
                  value:
                    "text-3xl font-semibold text-neutralDark dark:text-white",
                }}
                showValueLabel={true}
                strokeWidth={4}
                value={progress}
              />
            </CardBody>
            <CardFooter className="justify-center h-11 items-center pt-4">
              <p className="text-neutralDark dark:text-white text-md font-semibold text-center tracking-wider">
                {steps[currentStep]}
              </p>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <>
          <div className="px-8 py-8 shadow-md border rounded-3xl border-accentMint dark:border-zinc-800 max-w-screen-md mx-auto">
            <p className="text-xl font-semibold text-left text-primary">
              {`
          Congratulations, ${sessionData.formData[9].firstname}, on completing your strategic website plan!
          `}
            </p>
            <p className="text-justify pt-4">
              {`You’ve taken a big step toward building a well-organized site. 🎉 The result is shown below, and you can access this plan anytime under `}
              <strong>{`"My Activities."`}</strong>
            </p>
            <div className="flex flex-col justify-start items-start py-4 md:pb-4">
            
              <MyActivitiesBtn className={"text-xs border self-end mb-4"} />
              <p>{`Here’s what you can do:`}</p>
            </div>
            <ul className="list-disc list-inside text-justify py-4">
              <li>{`Review or edit your plan`}</li>
              <li>{`Download it as a PDF`}</li>
              <li>{`Request a quote`}</li>
            </ul>
            <p className="text-justify">{`Your plan might include suggestions for missing details. Feel free to use it now or come back later to refine and update it as your vision evolves.`}</p>
          </div>
          <div className="w-full flex justify-center md:justify-center">
            <Button as={Link} className="text-xs flex flex-col h-full pt-12" href="#result">
            <span className=" sm:hidden">Check it out!</span>
              <IconChevronDown className="animate-bounce text-accentMint" />
            </Button>
          </div>
          <div className="prose relative lg:prose-lg prose-slate dark:prose-invert px-4 pt-8 pb-12 md:p-8 my-12 rounded-2xl bg-yellow-100/60 dark:bg-content1 max-w-screen-xl">
            <div className="w-full flex justify-end md:justify-end">
              <Link
                alt="Copy all content to clipboard"
                aria-label="Copy the generated content to clipboard"
                className="absolute top-2 right-2 text-secondary"
                id="copy-btn-top"
                variant="none"
                onPress={() => {
                  copyToClipboard(aiResultWithTitle);
                }}
              >
                <IconCopy size={20} />
              </Link>
              <Tooltip
                anchorSelect="#copy-btn-top"
                className="text-center"
                delayHide={500}
                delayShow={200}
                place="left"
              >
                Copy all to clipboard
              </Tooltip>
            </div>
            <ReactMarkdown id="result">{aiResultWithTitle}</ReactMarkdown>
            <div className="w-full flex justify-end pb-4 md:pb-8 md:justify-end">
              <Button
                aria-label="Copy the generated content to clipboard"
                className="absolute"
                color="secondary"
                id="copy-btn-bottom"
                variant="bordered"
                onPress={() => {
                  copyToClipboard(aiResultWithTitle);
                }}
              >
                <IconCopy size={20} />
                Copy
              </Button>
              <Tooltip
                anchorSelect="#copy-btn-bottom"
                className="text-center"
                delayHide={500}
                delayShow={200}
                place="top"
              >
                Copy all to clipboard
              </Tooltip>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

Result.displayName = "Result";

export default Result;
