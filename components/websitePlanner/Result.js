'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button, CircularProgress, Card, CardBody, CardFooter } from '@nextui-org/react';
import { IconCopy } from '@tabler/icons-react';
import { toast } from 'sonner';

import { useSessionContext } from "@/lib/SessionProvider";
import logger from '@/lib/logger';

import { useAuth } from '@/lib/AuthContext';

import useGenerateTitle from "@/lib/hooks/useGenerateTitle";
import usePromptExecutor from "@/lib/hooks/usePromptExecutor";

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

  const { executePrompts, executedPrompts, loading: promptLoading, error, output } = usePromptExecutor();

  const [prompts, setPrompts] = useState([]);

  useEffect(() => {
    aiResultRef.current = aiResult;

    if (aiResultRef.current !== null) {  // Prevent multiple updates
      updateSessionData("aiGeneratedPlan", aiResultRef.current);
      updateAiGeneratedPlanInDb(userId, sessionId, aiResultRef.current);
      setContentForTitleGeneration(sessionData?.formData[0]?.serviceDescription);
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

  return (
    <div>
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
          <div className="w-full flex justify-end">
            <Button
              color="secondary"
              aria-label='Copy the generated content to clipboard'
              variant="bordered"
              onPress={() => {
                navigator.clipboard.writeText(aiResult);
                toast.success('Texts copied to clipboard', {
                  duration: 2000,
                  classNames: { toast: 'text-green-600' },
                });
              }}
            >
              <IconCopy size={20} />
              Copy
            </Button>
          </div>
          <div className="whitespace-pre-wrap p-8 my-12 rounded-2xl bg-yellow-100/60 dark:bg-content1 max-w-screen-lg">
            <h1 className="text-3xl font-semibold text-neutralDark dark:text-white mt-8 mb-4">{generatedTitle}</h1>
            <ReactMarkdown>
              {aiResult}
            </ReactMarkdown>
          </div>
          <div className="w-full flex justify-end">
            <Button
              color="secondary"
              variant="bordered"
              aria-label='Copy the generated content to clipboard'
              onPress={() => {
                navigator.clipboard.writeText(aiResult);
                toast.success('Texts copied to clipboard', {
                  duration: 2000,
                  classNames: { toast: 'text-green-600' },
                });
              }}
            >
              <IconCopy size={20} />
              Copy
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

Result.displayName = 'Result';

export default Result;
