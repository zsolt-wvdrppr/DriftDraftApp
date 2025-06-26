"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  CircularProgress,
  Card,
  CardBody,
  CardFooter,
  Link,
} from "@heroui/react";
import { useReCaptcha } from "next-recaptcha-v3";
import { toast } from "sonner";

import { useSessionContext } from "@/lib/SessionProvider";
import logger from "@/lib/logger";
import { useAuth } from "@/lib/AuthContext";
import useGenerateTitle from "@/lib/hooks/useGenerateTitle";
import usePromptExecutor from "@/lib/hooks/usePromptExecutor";
import getJWT from "@/lib/utils/getJWT";
import { useUserProfile } from "@/lib/hooks/useProfile";
import NewContentRenderer from "@/components/results/NewContentRenderer";

const Result = () => {
  const {
    sessionData,
    updateSessionData,
    updateAiGeneratedPlanInDb,
    updateSessionTitleInDb,
    setError,
  } = useSessionContext();
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

  const [showRetryButton, setShowRetryButton] = useState(false);

  const [jwt, setJwt] = useState(null);

  useEffect(() => {
    const fetchJWT = async () => {
      const jwt = await getJWT();

      setJwt(jwt);
    };

    fetchJWT();
  }, []);

  const [prompts, setPrompts] = useState([]);

  const {
    executePrompts,
    executedPrompts,
    hasCredits,
    structuredOutput,
    getCombinedOutputWithMarkers,
    getLegacyCombinedOutput,
    error,
  } = usePromptExecutor({
    executeRecaptcha,
    pickedModel: "gemini-1.5-pro",
    jwt,
  });

  /* Form data */
  const formData = sessionData?.formData;
  const purpose = formData?.[0]?.purpose;
  const purposeDetails = formData?.[0]?.purposeDetails || ""; // optional
  const serviceDescription = formData?.[0]?.serviceDescription;
  const audience = formData?.[1]?.audience;
  const marketing = formData?.[2]?.marketing || "";
  const competitors =
    formData?.[3]?.urls?.toString() !== "" ?
      `I have identified the following competitors: ${formData?.[3]?.urls?.toString()}.`
    : ""; // optional
  const usps = formData?.[4].usps || "";
  const brandGuidelines = formData?.[5].brandGuidelines || "";
  const emotions = formData?.[6]?.emotions || "";
  const inspirations = formData?.[7]?.inspirations?.toString() || ""; // optional
  /* End of form data */

  useEffect(() => {
    if (structuredOutput.length > 0) {
      // Use marked version for storage (better parsing later)
      const combinedWithMarkers = getCombinedOutputWithMarkers();

      // Update session data
      updateSessionData("aiGeneratedPlan", combinedWithMarkers);
      updateAiGeneratedPlanInDb(userId, sessionId, combinedWithMarkers);

      // Set content for title generation
      setContentForTitleGeneration(
        serviceDescription + " " + brandGuidelines + " " + emotions
      );
    }
  }, [structuredOutput]);

  useEffect(() => {
    if (
      structuredOutput.length > 0 &&
      generatedTitle !== null &&
      !titleLoading
    ) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [structuredOutput, generatedTitle, titleLoading]);

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
          prompt: `Prompt 1: Landing Page Psychology & Identity Foundation

**Objective:** Create a conversion-focused landing page strategy using psychological triggers and identity installation techniques.

**User Inputs:**
- **Purpose:** "${purpose}" (Main goal?)
- **Purpose Details:** "${purposeDetails}" (Specific action?)
- **Services/Products:** "${serviceDescription}" (Offering?)
- **Target Audience:** "${audience}" (Who? Be specific.)
- **Unique Selling Points (USPs):** "${usps}"
- **Brand Guidelines:** "${brandGuidelines}"
- **Marketing Strategy:** "${marketing}"

**Task:**
- **Apply identity installation, emotional state creation, and conversion psychology principles.**
- **Create a strategic foundation for high-converting landing page.**
- **Use Markdown headings and bullet points only:**

## Landing Page Conversion Strategy

### Primary Conversion Goal & Psychology
- Define the main conversion action and psychological motivation behind it
- Identify the emotional trigger that will drive immediate action
- Map the visitor's pain point to your solution benefit

### Target Identity Installation
- Create "For [specific type of person] who [situation]..." statement for instant recognition
- Address their aspirational identity and current frustration
- Position your solution as the bridge to their desired identity

### Emotional Journey Mapping
- Current emotional state: visitor's frustration, fear, or desire
- Desired emotional outcome: confidence, relief, excitement, empowerment
- Emotional transformation your landing page will facilitate

### Value Proposition Psychology
- Core benefit that addresses deepest pain point
- Unique advantage that differentiates from alternatives
- Risk reversal elements that overcome hesitation

### Conversion Barriers & Solutions
- Primary objections visitors will have
- Trust signals needed to overcome skepticism
- Urgency elements that motivate immediate action

### Missing Strategic Elements
- Critical information gaps that could impact conversion rates
- Additional psychological triggers needed for target audience

**Output MUST use headings and bullet points only. Focus on conversion psychology and visitor transformation. No introductory text.**`,
          label: "Landing Page Psychology",
          generateNewPrompts: false,
        },
        {
          prompt: `Prompt 2: Authority & Trust Psychology for Landing Pages

**Objective:** Establish credibility, social proof, and competitive differentiation using psychological persuasion principles.

**User Inputs:**
- **Brand Guidelines:** "${brandGuidelines}"
- **Desired Emotional Impact:** "${emotions}"
- **Competitors:** "${competitors}"
- **Unique Selling Points (USPs):** "${usps}"
- **Inspirations (Optional):** "${inspirations}"
- **Services/Products:** "${serviceDescription}"

**Task:**
- **Apply authority establishment, social proof psychology, and contrast creation principles.**
- **Use Markdown headings and bullet points to structure output:**

## Authority & Credibility Framework

### Expert Positioning Strategy
- Establish credibility through specific credentials, results, or methodology
- Position as the obvious choice through demonstrated expertise
- Create news-style authority using data, statistics, or industry recognition

### Social Proof Architecture
- Types of social proof most relevant to target audience
- Testimonial strategy that addresses specific objections
- Social proof placement for maximum psychological impact
- Numbers and metrics that build confidence

## Competitive Differentiation Psychology

### Contrast Creation Strategy
- How competitors position themselves vs. your unique angle
- Specific weaknesses in competitor offerings you can exploit
- Positioning that makes alternatives seem obviously inferior

### Value Gap Demonstration
- Quantifiable problems with conventional approaches
- Specific advantages your solution provides
- Opportunity costs of choosing alternatives

## Trust & Risk Reversal Elements

### Trust Signal Strategy
- Certifications, guarantees, or badges needed
- Risk reversal offers that overcome purchase anxiety
- Security and reliability indicators

### Objection Handling Framework
- Primary hesitations your audience will have
- Pre-emptive responses to common concerns
- Social proof that addresses specific doubts

## Brand Psychology Implementation
- Visual elements that reinforce credibility and trust
- Messaging tone that builds authority while remaining approachable
- Color and design psychology aligned with desired emotions

**Output MUST use headings and bullet points only. Focus on building unshakeable credibility and trust. No introductory text.**`,
          label: "Authority & Trust",
          generateNewPrompts: false,
        },
        {
          prompt: `Prompt 3: Urgency Psychology & Technical Optimization

**Objective:** Create legitimate urgency, optimize for conversions, and recommend technical implementation using psychological principles.

**User Inputs:**
- **Marketing Strategy:** "${marketing}"
- **Target Audience:** "${audience}"
- **Services/Products:** "${serviceDescription}"

**Task:**
- **Apply urgency psychology, FOMO elements, and conversion optimization principles.**
- **Structure with headings and bullet points:**

## Urgency & FOMO Psychology

### Legitimate Scarcity Creation
- Time-based urgency that feels authentic to your audience
- Capacity or inventory limitations that drive action
- Seasonal or event-based urgency opportunities

### FOMO Implementation Strategy
- What visitors fear missing out on most
- Social proof that others are taking action
- Countdown elements and real-time indicators

### Value Acceleration Techniques
- Bonus offers that expire to encourage quick decisions
- Progressive disclosure that builds commitment
- Loss aversion triggers that motivate action

## Conversion Optimization Framework

### Landing Page Flow Psychology
- Attention-grabbing headline that stops scrolling
- Logical flow that builds desire and overcomes objections
- Strategic CTA placement throughout the page

### Form & Friction Optimization
- Minimal friction strategies for lead capture
- Progressive profiling to reduce abandonment
- Trust indicators around conversion points

### Mobile Conversion Psychology
- Mobile-specific psychological triggers
- Touch-friendly design that encourages action
- Simplified decision-making for smaller screens

## Technical Requirements for High Conversion

### Performance Psychology
- Page load speed impact on conversion rates
- Visual hierarchy that guides attention to CTAs
- A/B testing capabilities for psychological elements

### Analytics & Optimization Setup
- Conversion tracking for psychological trigger effectiveness
- Heatmap analysis for user behavior insights
- Split testing framework for continuous improvement

### Integration & Automation
- CRM integration for lead nurturing psychology
- Email automation triggered by visitor behavior
- Retargeting pixel setup for re-engagement campaigns

## Marketing Channel Psychology
- Channel-specific messaging that matches visitor mindset
- Traffic source optimization for conversion alignment
- Campaign messaging that pre-frames landing page psychology

**Output MUST use headings and bullet points only. Focus on driving immediate action through psychological triggers. No introductory text.**`,
          label: "Urgency & Optimization",
          generateNewPrompts: false,
        },
        {
          prompt: `Prompt 4: Complete Landing Page Wireframe & Implementation Blueprint

**Objective:** Create a detailed landing page wireframe with psychological trigger placement and comprehensive implementation plan.

**User Inputs:** All strategic elements from previous prompts

**Task:**
- **Design landing page wireframe using ASCII visualization**
- **Integrate all psychological triggers and conversion elements**
- **Provide complete implementation blueprint**

## Landing Page Wireframe Design

**MANDATORY: Create detailed ASCII wireframe showing psychological trigger placement**

### Desktop Landing Page Layout
\`\`\`
+--------------------------------------------------------+
|                    HEADER/NAVIGATION                   |
| [Logo] [Trust Badge] [Phone] [Limited Time Offer]     |
+--------------------------------------------------------+
|                                                        |
|                    HERO SECTION                        |
|              [Identity Installation Hook]              |
|    "For [target identity] who [specific situation]"   |
|                                                        |
|              [Emotional Headline]                      |
|          [Problem + Solution + Outcome]                |
|                                                        |
|                [Supporting Subtext]                    |
|           [Risk reversal + social proof hint]          |
|                                                        |
|            [Primary CTA Button - Contrasting Color]   |
|                [Urgency text below CTA]                |
+--------------------------------------------------------+
|                                                        |
|               SOCIAL PROOF SECTION                     |
|    [Customer Logos] [Testimonial] [Stat/Number]       |
|              "Join X+ customers who..."                |
+--------------------------------------------------------+
|                                                        |
|              PROBLEM AGITATION                         |
|     [Describe current pain points vividly]            |
|        [Cost of inaction or status quo]               |
+--------------------------------------------------------+
|                                                        |
|               SOLUTION OVERVIEW                        |
|  [How your solution solves their specific problem]    |
|     [Unique methodology or approach]                  |
|        [Before vs After transformation]               |
+--------------------------------------------------------+
|                                                        |
|              AUTHORITY ESTABLISHMENT                    |
|    [Expert credentials] [Media mentions] [Awards]     |
|         [Founder story or expertise proof]            |
+--------------------------------------------------------+
|                                                        |
|               BENEFITS & FEATURES                      |
|  +------------+ +------------+ +------------+          |
|  |  Benefit 1 | | Benefit 2  | | Benefit 3  |          |
|  | [Emotional]| | [Practical]| | [Social]   |          |
|  | outcome    | | advantage  | | proof      |          |
|  +------------+ +------------+ +------------+          |
+--------------------------------------------------------+
|                                                        |
|               OBJECTION HANDLING                       |
|     [Address top 3 concerns with proof/guarantee]     |
|              [Risk reversal offer]                     |
+--------------------------------------------------------+
|                                                        |
|              URGENCY & SCARCITY                        |
|        [Limited time/quantity offer]                   |
|         [What they miss if they wait]                  |
|              [Social pressure element]                 |
+--------------------------------------------------------+
|                                                        |
|               FINAL CONVERSION ZONE                    |
|              [Secondary CTA - Same as hero]            |
|           [Contact info] [Security badges]            |
|              [Final risk reversal]                     |
+--------------------------------------------------------+
|                      FOOTER                            |
|    [Legal] [Privacy] [Contact] [Social proof]         |
+--------------------------------------------------------+
\`\`\`

### Mobile Landing Page Layout
\`\`\`
+------------------------+
|    HEADER & MENU       |
| [Logo]  [Trust Badge]  |
| [Phone] [Offer Timer]  |
+------------------------+
|                        |
|     HERO SECTION       |
|  [Identity Hook]       |
|  [Emotional Headline]  |
|  [Subtext with proof]  |
|    [Primary CTA]       |
|   [Urgency element]    |
+------------------------+
|                        |
|   SOCIAL PROOF         |
| [Number/Testimonial]   |
| [Customer logos]       |
+------------------------+
|                        |
|   PROBLEM SECTION      |
|  [Current pain points] |
|  [Cost of inaction]    |
+------------------------+
|                        |
|   SOLUTION             |
|  [How you solve it]    |
|  [Unique approach]     |
+------------------------+
|                        |
|     AUTHORITY          |
|   [Expert proof]       |
|   [Credentials]        |
+------------------------+
|                        |
|    BENEFITS            |
|   [Benefit 1 Card]     |
|   [Benefit 2 Card]     |
|   [Benefit 3 Card]     |
+------------------------+
|                        |
|   OBJECTIONS           |
|  [Address concerns]    |
|  [Guarantee/proof]     |
+------------------------+
|                        |
|   URGENCY/CTA          |
|  [Scarcity element]    |
|  [Final CTA button]    |
+------------------------+
|       FOOTER           |
+------------------------+
\`\`\`

### Psychological Trigger Integration
- Identity installation in hero section targeting specific persona pain points
- Emotional state creation through problem agitation and solution transformation
- Authority establishment through credentials, testimonials, and social proof
- Urgency and scarcity elements strategically placed to motivate action
- Risk reversal and objection handling to overcome hesitation
- Multiple conversion opportunities with consistent messaging

### Conversion Flow Optimization
- Primary path: Hero CTA → Benefits → Urgency → Final CTA
- Secondary micro-commitments throughout (testimonial views, benefit engagement)
- Trust building elements positioned near conversion points
- Mobile-optimized flow with thumb-friendly CTA placement

## Complete Implementation Blueprint

### Phase 1: Foundation Setup
- Core landing page structure with psychological triggers
- Basic conversion tracking and analytics implementation
- Trust signals and social proof elements
- Mobile-responsive design with conversion optimization

### Phase 2: Advanced Optimization
- A/B testing framework for psychological elements
- Advanced tracking for micro-conversions and engagement
- Personalization based on traffic source and behavior
- Retargeting campaign integration

### Phase 3: Scaling & Refinement
- Multi-variant testing of psychological triggers
- Advanced automation and nurture sequences
- Conversion rate optimization based on data insights
- Expansion to additional landing page variations

### Success Metrics & KPIs
- Primary conversion rate (visitor to conversion)
- Micro-conversion rates (engagement with psychological elements)
- Traffic source conversion performance
- Mobile vs desktop conversion analysis
- Psychological trigger effectiveness measurement

**MANDATORY REQUIREMENTS:**
- Must include detailed ASCII wireframes for both desktop and mobile
- Must show exact placement of psychological triggers and conversion elements
- Must specify conversion flow and CTA positioning throughout page
- This wireframe is for LANDING PAGE ONLY - single page focus

**Output format: Use code blocks for wireframes to preserve formatting. Include comprehensive implementation guidance.**`,
          label: "Landing Page Wireframe",
          dependsOn: [0, 1, 2],
          generateNewPrompts: false,
        },
      ];

      setPrompts(prompts);

      // ✅ Execute prompts and update the session once complete
      const generateLandingPlan = async () => {
        try {
          logger.info("Executing prompts for landing page plan generation...");

          const results = await executePrompts(prompts, userId);
          const combinedResult = results.join("\n\n");

          if (!results || results?.length > 0) {
            await updateAiGeneratedPlanInDb(userId, sessionId, combinedResult);
            toast.success(
              "Landing page blueprint generated and saved successfully."
            );
          }
        } catch (err) {
          logger.error(
            "An error occurred while generating the landing page blueprint:",
            err
          );

          // Enhanced error handling
          if (
            err.message?.includes("ReCaptcha") ||
            err.message?.includes("Security verification")
          ) {
            setError("Security verification failed. Please try again.");
            setShowRetryButton(true);
          } else {
            setError(err.message);
            setShowRetryButton(true);
          }
        }
      };

      if (hasCredits) {
        generateLandingPlan();
      }
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
    "Generating landing page recommendations...",
    "Finalizing content...",
  ];

  useEffect(() => {
    if (isLoading && prompts?.length > 0) {
      const completedCount = executedPrompts || 0;
      const totalCount = prompts?.length;
      const calculatedProgress = (completedCount / totalCount) * 100;

      setProgress(calculatedProgress);
      setCurrentStep(Math.floor((completedCount / totalCount) * steps?.length));

      // Ensure the progress bar completes only when all prompts finish
      if (completedCount === totalCount) {
        setProgress(100);
      }
    }

    logger.debug("[PROGRESS] - Calculated progress:", progress);
    logger.debug("[PROGRESS] - completedCount:", executedPrompts);
    logger.debug("[PROGRESS] - totalCount:", prompts?.length);
  }, [executedPrompts, prompts, isLoading]);

  const first_name =
    fullName?.split(" ")[0] || sessionData?.formData?.[8].firstname;

  const handleRetry = () => {
    setError(null);
    setShowRetryButton(false);
    alreadyFetched.current = false; // Reset the fetch guard

    // Trigger re-execution
    if (hasCredits) {
      generateLandingPlan();
    }
  };

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
      : hasCredits &&
        structuredOutput.length > 0 && (
          <NewContentRenderer
            combinedContent={getLegacyCombinedOutput()} // For copy/export functions
            firstName={first_name}
            generatedTitle={generatedTitle}
            structuredSections={structuredOutput}
          />
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

      {error && (
        <div className="flex flex-col justify-center items-center py-8">
          <Card className="border-none bg-transparent shadow-none">
            <CardBody className="justify-center items-center pb-0">
              <p className="text-xl font-semibold text-center text-red-500">
                Error occurred
              </p>
              <p className="text-center mb-4">{error}</p>
              {showRetryButton && (
                <Button className="mt-4" color="primary" onPress={handleRetry}>
                  Try Again
                </Button>
              )}
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
};

Result.displayName = "Result";

export default Result;
