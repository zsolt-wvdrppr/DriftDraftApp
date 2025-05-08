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
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useSessionContext } from "@/lib/SessionProvider";
import logger from "@/lib/logger";
import { useAuth } from "@/lib/AuthContext";
import useGenerateTitle from "@/lib/hooks/useGenerateTitle";
import usePromptExecutor from "@/lib/hooks/usePromptExecutor";
import useClipboard from "@/lib/hooks/useClipboard";
import MyActivitiesBtn from "@/components/nav-layout/MyActivitiesBtn";
import getJWT from "@/lib/utils/getJWT";
import withColorCode from "@/lib/utils/with-color-dots";
import { useUserProfile } from "@/lib/hooks/useProfile";

const CodeWithColor = withColorCode("code");
const LiWithColor = withColorCode("li");
const PWithColor = withColorCode("p");
const EMWithColor = withColorCode("em");
const StrongWithColor = withColorCode("strong");

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
  const { fullName } = useUserProfile(user?.id);
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

  const router = useRouter();

  const [jwt, setJwt] = useState(null);

  useEffect(() => {
    const fetchJWT = async () => {
      const jwt = await getJWT();

      setJwt(jwt);
    };

    fetchJWT();
  }, []);

  const [prompts, setPrompts] = useState([]);
  const { copyToClipboard, isPending } = useClipboard();

  const {
    executePrompts,
    executedPrompts,
    loading: promptLoading,
    error,
    output,
    hasCredits,
  } = usePromptExecutor({
    executeRecaptcha,
    pickedModel: "gemini-1.5-pro",
    jwt,
  });

  /* Form data */
  const formData = sessionData.formData;
  const purpose = formData[0].purpose;
  const purposeDetails = formData[0]?.purposeDetails || ""; // optional
  const serviceDescription = formData[0].serviceDescription;
  const audience = formData[1].audience;
  const marketing = formData[2].marketing || "";
  const competitors =
    formData[3]?.urls?.toString() !== "" ?
      `I have identified the following competitors: ${formData[3].urls.toString()}.`
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
        serviceDescription + " " + brandGuidelines + " " + emotions
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
    if (alreadyFetched.current || !userId || !sessionId || !jwt) return; // Prevent second call
    alreadyFetched.current = true;

    if (
      purpose &&
      serviceDescription &&
      serviceDescription &&
      audience &&
      marketing &&
      usps &&
      brandGuidelines &&
      emotions
    ) {
      const prompts = [
        {
          prompt: `Prompt 1: Core Website Strategy
          
          **Objective:** Define purpose and target audience with headings.
          
          **User Inputs:**
          - **Purpose:** "${purpose}" (Main goal?)
          - **Purpose Details:** "${purposeDetails}" (Specific action?)
          - **Services/Products:** "${serviceDescription}" (Offering?)
          - **Target Audience:** "${audience}" (Who? Be specific.)
          - **Unique Selling Points (USPs):** "${usps}" (No need to include the USPs themselves.)
          - **Brand Guidelines:** "${brandGuidelines}" (No need to include the guidelines themselves.)
          - **Marketing Strategy:** "${marketing}" (No need to include the strategy itself.)
          
          **Task:**
          - **Analyze inputs and output a structured strategy overview using headings and bullet points.**
          - **Use Markdown headings (h2 and h3) and bullet points to clearly define:**
          
          ## Website Goal (h2)
          -  [Bullet point defining the primary conversion goal]
          
          ## Key Services/Products (h2)
          -  [Bullet point describing core offerings]
          
          ## Primary Target Audience (h2)
          -  [Bullet point outlining the target audience profile]
          
          ## Missing Information & Why It's Important (h2)
          -  [Bullet point listing missing details regarding only the and explaining their importance for website success]
          
          - **Output MUST be structured with the above Markdown headings and bullet points only. No introductory text.**`,
          generateNewPrompts: false,
        },
        {
          prompt: `Prompt 2: Branding & Differentiation for Website Design
            
            **Objective:** Establish design direction and competitive context with headings.
            
            **User Inputs:**
            - **Brand Guidelines:** "${brandGuidelines}" (Include colors, fonts, style. Doc if available. Must include exact colour codes if available.)
            - **Desired Emotional Impact:** "${emotions}" (Visitor feelings? e.g., Trust, excitement.)
            - **Competitors:** "${competitors}" (Competitors & websites.)
            - **Unique Selling Points (USPs):** "${usps}" (Your unique advantage?)
            - **Inspirations (Optional):** "${inspirations}" (Website style examples. Links.)
            - **Services/Products:** "${serviceDescription}" (Offering? No need to include details.)
            
            **Task:**
            - **Analyze inputs and output design direction with headings and bullet points.**
            - **Use Markdown headings (h2) and bullet points to structure the output:**
            
            ## Branding & Emotional Design Direction (h2)
            -  [Bullet points summarizing how brand guidelines and emotions influence website design (visuals, tone, messaging)]
            
            ## Competitor Design & Messaging Insights (h2)
            -  [Bullet points identifying key design/messaging takeaways from competitor analysis]
            
            ## Unique Selling Points (USPs) for Differentiation (h2)
            -  [Bullet points articulating USPs and explaining how they will be emphasized visually/verbally]
            
            ## Points Needing Clarification for Design (h2)
            -  [Bullet points noting unclear/missing inputs and recommending specific clarification questions]
            
            - **Output MUST be structured with the above Markdown headings and bullet points only. No introductory text.**`,
          generateNewPrompts: false,
        },
        {
          prompt: `Prompt 3: Marketing & Technical Foundation for Launch
          
          **Objective:** Define marketing approach and *recommend* technical foundations for a modern websites.
          
          **User Inputs:**
          - **Marketing Strategy:** "${marketing}" (Marketing activities for this website? e.g., SEO, ads.)
          - **Domain preferences:** "${domain}"
          
          **Task (Two Parts - Headings & Bullet Points Only):**
          
          **Part 1: Marketing Approach (Headings & Bullet Points)**
          - **Structure marketing output with headings and bullet points:**
          
          ## Marketing Strategy Approach (h2)
          -  [Bullet points outlining the marketing approach based on inputs (SEO, content, ads, etc.)]
          
          ## Proposed Marketing Ideas (If No Strategy Provided) (h2)
          -  [Bullet points suggesting 2-3 simple marketing ideas if no strategy input]
          
          **Part 2: Technical Requirements (Headings & Bullet Points)**
          - **Structure technical requirements with headings and bullet points:**
          
          ## Essential Technical Requirements (h2)
          ### Technically Sound Website (h3)
              - [Bullet points: Fast loading, mobile-responsive, secure, SEO-friendly]
          ### Conversion-Focused Design (h3)
              - [Bullet points: Clear CTAs, navigation, user-friendly forms]
          ### Integration Readiness (h3)
              - [Bullet points: CRM, analytics, automation integrations?]
          ### Framework and Technology Recommendations (h3)
              - [Bullet points *recommending* modern, performant technology approaches suitable for a modern website.  Consider suggesting:]
                  - **Static Site Generators (SSGs):** (For excellent performance, SEO, and security. Examples:  mention "modern JavaScript frameworks" or "SSG approach" without naming specific SSGs to avoid competitor mentions).
                  - **Headless CMS (Optional, if content is dynamic):** (If the website needs frequent content updates, suggest a "headless CMS for content management with a decoupled frontend" to offer flexibility without sacrificing performance. Again, avoid naming specific CMSs).
                  - **Focus on Performance & SEO:** (Emphasize the importance of choosing technologies that prioritize fast loading times, mobile-friendliness, and SEO best practices.)
                  - **Simplicity for modern website:** (Suggest keeping the technology stack relatively simple and focused for a modern website to avoid unnecessary complexity.)
                  - **JavaScript Framework (Implied, but not overly specific):** (Subtly imply the use of modern JavaScript frameworks for interactivity and dynamic elements without explicitly naming them).
                  - **Avoid Specific Competitor Tools:** (Do NOT recommend specific website builders, CMS platforms, or frameworks that are direct competitors to your potential customer's preferred stack.)
              - [If specific frameworks/technologies ARE provided by the user, mention them here and comment on their suitability.]
              - [If *no* technologies are specified, provide the above recommendations as default suggestions.]
          
          - **Output MUST be structured with the above Markdown headings and bullet points only for both parts. No introductory text.**`,
          generateNewPrompts: false,
        },
        {
          prompt: `Prompt 4: Comprehensive Website Wireframe & Strategic Plan

                  **Objective:** Create a detailed website wireframe with ASCII visualisations and a comprehensive strategic plan.

                  **Part 1: Detailed Website Wireframe**

                  - Create a complete website wireframe showing all recommended pages and their sections
                  - For each page, include:
                    - Page name and purpose
                    - Main sections with brief content descriptions
                    - Navigation elements
                    - Call-to-action placement
                  - Use ASCII drawings to visualise layout for each page (minimum 3 pages)
                  - Include mobile and desktop versions for the homepage

                  **ASCII Drawing Example:**
                  +------------------------------------------+
                  |                HEADER                    |
                  +------------------------------------------+
                  |                                          |
                  |               HERO IMAGE                 |
                  |         [Headline Text Here]             |
                  |         [Subheadline Text]               |
                  |         [Primary CTA Button]             |
                  +------------------------------------------+
                  |                                          |
                  |            FEATURES SECTION              |
                  |  +--------+  +--------+  +--------+     |
                  |  | Feat 1 |  | Feat 2 |  | Feat 3 |     |
                  |  +--------+  +--------+  +--------+     |
                  +------------------------------------------+
                  |                FOOTER                    |
                  +------------------------------------------+

                  **Part 2: Strategic Implementation Plan**

                  ## Website Strategy Overview
                  - Primary business objectives and how the website supports them
                  - Target audience profiles and their user journeys
                  - Content strategy and information architecture
                  - Conversion funnels and key interaction points
                  - Technical requirements and platform recommendations
                  - SEO and marketing integration points
                  - Analytics strategy and KPI tracking plan

                  ## Implementation Timeline
                  - Development phases with key milestones
                  - Content creation schedule
                  - Testing and launch plan

                  ## Outstanding Questions
                  - List any information gaps that need clarification
                  - Recommendations for additional user research if needed
          
                **Part 2: Final Strategic Overview**
                - **Output a strategic overview using Markdown headings (h2, h3) and flat bullet points (using '-'). Ensure bullet points are NOT nested.**

                ## Final Website Strategic Overview (h2)

                ### Core Purpose and Goals (h3)
                - Primary conversion goal: ...
                - Secondary goal: ...

                ### Target Audience Profile (h3)
                - Characteristic 1: ...
                - Characteristic 2: ...

                ### Brand and Design Direction (h3)
                - Direction point 1: ...
                - Direction point 2: ...

                ### Marketing and Promotion Plan (h3)
                - Plan point 1: ...

                ### Key Technical Specifications (h3)
                - Spec 1: ...

                ### Outstanding Questions / Missing Information (h3)
                - Question 1: ...

                - **Output MUST be structured with Markdown headings (h2, h3) and flat bullet points (using '-'). Ensure *no parentheses around headings* and *no nested lists*. Be concise and actionable. No introductory text.**
                - **Final Output: Detailed wireframe with ASCII drawings and strategic plan document.**`,
          dependsOn: 2,
          generateNewPrompts: false,
        },
      ];

      setPrompts(prompts);

      // ✅ Execute prompts and update the session once complete
      const generateLandingPlan = async () => {
        try {
          logger.info("Executing prompts for website plan generation...");

          // Execute prompts and wait for results
          const results = await executePrompts(prompts, userId);
          const combinedResult = results.join("\n\n");

          logger.debug("Results:", results);

          if (!results || results.length > 0) {
            // Store the combined result in the state
            setAiResult(combinedResult);

            // Update the plan in the database
            await updateAiGeneratedPlanInDb(userId, sessionId, combinedResult);
            toast.success("Website plan generated and saved successfully.");
          }
        } catch (err) {
          // Catch and handle errors during prompt execution or DB updates
          logger.error(
            "An error occurred while generating the website plan:",
            err
          );

          setError(err.message); // Store the error message in state if needed
        }
      };

      if (hasCredits) {
        generateLandingPlan();
      }
    } else {
      logger.info("resetting hint");
      setAiResult(null);
    }
  }, [userId, sessionId, jwt]);

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

  const first_name =
    fullName?.split(" ")[0] || sessionData.formData[8].firstname;

  return (
    <div className=" md:mx-auto">
      {isLoading && hasCredits ?
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
      : hasCredits && (
          <>
            <div className="px-8 py-8 shadow-md border rounded-3xl border-accentMint dark:border-zinc-800 max-w-screen-md mx-auto">
              <p className="text-xl font-semibold text-left text-primary">
                {`
          Congratulations, ${first_name}, on completing your strategic website plan!
          `}
              </p>
              <p className="text-justify pt-4">
                {`You’ve taken a big step toward building a well-organized website. 🎉 The result is shown below, and you can access this plan anytime under `}
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
              <Button
                as={Link}
                className="text-xs flex flex-col h-full pt-12"
                href="#result"
              >
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
              <ReactMarkdown
                id="result"
                components={{
                  code: CodeWithColor, // Apply color dots inside <code> blocks
                  li: LiWithColor, // Apply color dots inside list items
                  p: PWithColor, // Apply color dots inside paragraphs
                  em: EMWithColor, // Apply color dots inside <em> tags
                  strong: StrongWithColor, // Apply color dots inside <strong> tags
                }}
              >
                {aiResultWithTitle}
              </ReactMarkdown>
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
        )
      }

      {!hasCredits && (
        <div className="flex flex-col justify-center items-center py-8">
          <Card
            aria-label="Rate limit exceeded"
            className="border-none bg-transparent shadow-none"
          >
            <CardBody className="justify-center items-center pb-0">
              <p className="text-xl font-semibold text-center text-primary">
                {`Rate limit exceeded`}
              </p>
              <p className="text-center">
                {`You have exhausted your credits. Please `}
                <Link className="text-accentMint" href="/top-up">
                  {`top up your credits`}
                </Link>
                {` to continue generating content.`}
              </p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

Result.displayName = "Result";

export default Result;
