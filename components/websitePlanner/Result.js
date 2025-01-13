'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button, CircularProgress, Card, CardBody, CardFooter, Link } from '@nextui-org/react';
import { IconCopy } from '@tabler/icons-react';

import { useSessionContext } from "@/lib/SessionProvider";
import logger from '@/lib/logger';

import { useAuth } from '@/lib/AuthContext';

import useGenerateTitle from "@/lib/hooks/useGenerateTitle";
import usePromptExecutor from "@/lib/hooks/usePromptExecutor";
import useClipboard from "@/lib/hooks/useClipboard";

import { Tooltip } from 'react-tooltip';

import { useReCaptcha } from "next-recaptcha-v3";

const Result = () => {

  const { sessionData, updateSessionData, updateAiGeneratedPlanInDb, updateSessionTitleInDb, setError } = useSessionContext();
  const [aiResult, setAiResult] = useState(null);
  const aiResultRef = useRef(aiResult);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id;
  const sessionId = sessionData?.sessionId;
  const [contentForTitleGeneration, setContentForTitleGeneration] = useState(null);
  const { loading: titleLoading, generatedTitle } = useGenerateTitle(contentForTitleGeneration, updateSessionTitleInDb, userId, sessionId);
  const alreadyFetched = useRef(false);

  const { executeRecaptcha } = useReCaptcha();

  const { executePrompts, executedPrompts, loading: promptLoading, error, output } = usePromptExecutor({ executeRecaptcha });

  const [prompts, setPrompts] = useState([]);
  const { copyToClipboard, isPending } = useClipboard();

  /* Form data */
  const formData = sessionData.formData;
  const purpose = formData[0].purpose;
  const purposeDetails = formData[0]?.purposeDetails || ''; // optional
  const serviceDescription = formData[0].serviceDescription;
  const audience = formData[1].audience;
  const marketing = formData[2].marketing || '';
  const competitors = formData[3]?.urls?.toString() !== '' ? `I have identified the following competitors: ${formData[3].urls.toString()}.` : ''; // optional
  const usps = formData[4].usps || '';
  const domain = formData[5].domain || '';
  const brandGuidelines = formData[6].brandGuidelines || '';
  const emotions = formData[7].emotions || '';
  const inspirations = formData[8]?.inspirations?.toString() || ''; // optional
  /* End of form data */

  useEffect(() => {
    aiResultRef.current = aiResult;

    if (aiResultRef.current !== null) {  // Prevent multiple updates
      updateSessionData("aiGeneratedPlan", aiResultRef.current);
      updateAiGeneratedPlanInDb(userId, sessionId, aiResultRef.current);
      setContentForTitleGeneration(serviceDescription + ' ' + domain + ' ' + brandGuidelines + ' ' + emotions);
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
    if (alreadyFetched.current || !userId || !sessionId) return;  // Prevent second call
    alreadyFetched.current = true;

    if (purpose && serviceDescription && serviceDescription && audience && marketing && usps && brandGuidelines && domain && emotions) {

      /*const prompt = `Based on the provided inputs, create a concise and strategic website plan that captures the user's needs and requirements. The plan should be formatted as a professional document that can be shared with a developer or web design agency. 

      Here is the information to include:

      1. **Website Purpose**:
        - The primary purpose of the website: ${purpose}.
        - Additional details: ${purposeDetails}.

      2. **Services Offered**:
        - Description of services: ${serviceDescription}.

      3. **Target Audience**:
        - Who the website is designed for: ${audience}.

      4. **Marketing and Growth Strategy**:
        - Key approaches to attract the audience: ${marketing}.

      5. **Competitor Analysis**:
        - ${competitors} If no competitors are identified, state: "The user has not provided a specific list of competitors."

      6. **Unique Selling Points (USPs)**:
        - Highlights of what makes the website or services stand out: ${usps}.

      7. **Brand Guidelines**:
        - Any existing branding rules to follow: ${brandGuidelines}.
        - If none, state: "No specific brand guidelines provided; flexibility is available."

      8. **Desired Emotional Impact**:
        - The emotions or feelings the website should evoke in visitors: ${emotions}.

      9. **Inspirations and References**:
        - ${inspirations}. If no inspirations are mentioned, state: "No specific inspirations were provided."

      10. **Domain Preferences**:
        - The desired domain name: ${domain}. If no domain is specified, state: "The user has not provided a preferred domain name."

      11. **Recommendations for Execution**:
        - Summarize the above details into actionable recommendations for design, content, and functionality. For example:
          - Design should align with the emotional impact (${emotions}) and target audience (${audience}).
          - Consider using ${brandGuidelines} for visual consistency.
          - Highlight USPs (${usps}) prominently on the homepage.

      Output this as a well-structured document with headers, clear bullet points, and concise phrasing. Ensure the document provides enough context to help a developer or designer understand the user’s requirements and goals.`;
*/

      /*const prompts = [
        {
          prompt: `Describe the primary purpose of the website based on the following details: 
          - Primary Purpose: "${purpose}" 
          - Additional Details: "${purposeDetails}"

    If either detail is missing, mention its absence and recommend clarifying the website's goals. 
    Return the result as a concise summary with bullet points and a short description.`,
          generateNewPrompts: false
        },
        {
          prompt: `Explain the services offered on the website based on the following details: 
          - Service Description: "${serviceDescription}"

    If no details are provided, suggest why clarifying the services is important for user understanding and conversion.
    Format the output using bullet points.`,
          generateNewPrompts: false
        },
        {
          prompt: `Identify the target audience for the website based on the following details:
          - Audience: "${audience}"

    If no audience details are provided, recommend why defining the audience is essential for design and content strategy. 
    Return the audience insights in a bullet point format.`,
          generateNewPrompts: false
        },
        {
          prompt: `Provide a marketing and growth strategy for the website using the details provided: 
          - Marketing Strategy: "${marketing}"

    If no strategy is provided, suggest basic strategies like SEO, content marketing, and paid advertising. 
    Return the strategy as a list of 3-5 actionable recommendations.`,
          generateNewPrompts: false
        },
        {
          prompt: `Analyze the website's competitors based on the following details:
          - Competitors: "${competitors}"

    If no competitors are listed, explain why competitor analysis is valuable and how it can influence website strategy. 
    Return the response as a brief competitor summary.`,
          generateNewPrompts: false
        },
        {
          prompt: `List the website's unique selling points (USPs) based on the following details: 
          - USPs: "${usps}"

    If no USPs are mentioned, suggest why clearly defining USPs is important and recommend identifying key strengths like faster service or unique features. 
    Format the response in bullet points.`,
          generateNewPrompts: false
        },
        {
          prompt: `Summarize the provided brand guidelines using the following details:
          - Brand Guidelines: "${brandGuidelines}"

    If no brand guidelines are provided, explain why consistent branding matters and recommend including elements like color schemes and typography. 
    Return the response in bullet points.`,
          generateNewPrompts: false
        },
        {
          prompt: `Describe the emotional impact the website should create based on the provided details:
          - Emotional Impact: "${emotions}"

    If no emotional goals are mentioned, suggest general emotional outcomes like trust, excitement, or professionalism. 
    Return the emotional goals as a list.`,
          generateNewPrompts: false
        },
        {
          prompt: `List the website inspirations and references based on the following details:
          - Inspirations: "${inspirations}"

    If no inspirations are provided, explain why visual references can help in aligning the design vision. 
    Return the response as a brief list.`,
          generateNewPrompts: false
        },
        {
          prompt: `Identify the domain preferences for the website based on the following details:
          - Domain Preferences: "${domain}"

    If no domain preferences are provided, explain why a memorable domain matters for branding and SEO. 
    Return the domain choices clearly in bullet points.`,
          generateNewPrompts: false
        },
        {
          prompt: `Create a final strategic summary combining all previous details provided. 
          Include:
          - Website Purpose
          - Services Offered
          - Target Audience
          - Marketing Strategy
          - Competitor Analysis
          - Unique Selling Points (USPs)
          - Brand Guidelines
          - Emotional Impact
          - Inspirations
          - Domain Preferences

    If any section was missing or unclear, briefly explain its importance and recommend clarifying those details.
    Format the output as a professional summary suitable for developers and clients. Use bullet points and keep it concise.`,
          generateNewPrompts: false,
          dependsOn: 9
        }
      ];*/

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
          generateNewPrompts: false
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
          generateNewPrompts: false
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
          generateNewPrompts: false
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
          dependsOn: 2 // or the index you want to depend on
        }
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

      window.history.replaceState(null, '', newUrl);
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
    <div className=' md:mx-auto'>
      {isLoading ? (
        <div className="flex flex-col left-0 top-0 bottom-0 right-0 absolute w-full items-center justify-center py-10">
          <Card aria-label='Progress indicator' className="h-60 max-w-96 border-none bg-transparent shadow-none">
            <CardBody className="justify-center items-center pb-0">
              <CircularProgress
                aria-label='Generating content progress'
                classNames={{
                  svg: "w-36 h-36",
                  indicator: "stroke-neutralDark dark:stroke-white",
                  value: "text-3xl font-semibold text-neutralDark dark:text-white",
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

          <div className="prose relative lg:prose-lg prose-slate dark:prose-invert px-4 pt-8 pb-12 md:p-8 my-12 rounded-2xl bg-yellow-100/60 dark:bg-content1 max-w-screen-xl">
            <div className="w-full flex justify-end md:justify-end">
              <Link
                alt="Copy all content to clipboard"
                id="copy-btn-top"
                className='absolute top-2 right-2 text-secondary'
                aria-label='Copy the generated content to clipboard'
                variant="none"
                onPress={() => { copyToClipboard(aiResultWithTitle); }}
              >
                <IconCopy size={20} />
              </Link>
              <Tooltip anchorSelect="#copy-btn-top" place="left" className="text-center" delayHide={500} delayShow={200}>
                Copy all to clipboard
              </Tooltip>
            </div>
            <ReactMarkdown>
              {aiResultWithTitle}
            </ReactMarkdown>
            <div className="w-full flex justify-end pb-4 md:pb-8 md:justify-end">
              <Button
                className='absolute'
                id='copy-btn-bottom'
                color="secondary"
                aria-label='Copy the generated content to clipboard'
                variant="bordered"
                onPress={() => { copyToClipboard(aiResultWithTitle); }}
              >
                <IconCopy size={20} />
                Copy
              </Button>
              <Tooltip anchorSelect="#copy-btn-bottom" place="top" className="text-center" delayHide={500} delayShow={200}>
                Copy all to clipboard
              </Tooltip>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

Result.displayName = 'Result';

export default Result;
