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
import ContentRenderer from "@/components/results/ContentRenderer";

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

  const [displayProgress, setDisplayProgress] = useState(0); // Smooth animated progress
  const [targetProgress, setTargetProgress] = useState(0); // Actual calculated progress

  const [generateLandingPlan, setGenerateLandingPlan] = useState(null);

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
    pickedModel: "default",
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
  const location = formData[3]?.location?.address || "global";
  const usps = formData?.[4].usps || "";
  const brandGuidelines = formData?.[5].brandGuidelines || "";
  const emotions = formData?.[6]?.emotions || "";
  const inspirations = formData?.[7]?.inspirations?.toString() || ""; // optional
  /* End of form data */

  logger.debug("Location:", location || "Not specified");

  useEffect(() => {
    if (structuredOutput?.length > 0) {
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
    if (!formData || alreadyFetched.current || !userId || !sessionId || !jwt)
      return; // Prevent second call

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
          prompt: `Prompt 1: Strategic Foundation & Identity Positioning

**Objective:** Create a strategic foundation using psychological triggers and identity installation techniques for a high-converting landing page.

**User Inputs:**
- **Purpose:** "${purpose}" (Main goal?)
- **Purpose Details:** "${purposeDetails}" (Specific action?)
- **Services/Products:** "${serviceDescription}" (What's on offer?)
- **Target Audience:** "${audience}" (Who? Be specific.)
- **Unique Selling Points (USPs):** "${usps}"
- **Brand Guidelines:** "${brandGuidelines}"
- **Marketing Strategy:** "${marketing}"
- **Location:** "${location}"

**Task:**
- **Analyse inputs and create a strategic foundation using headings and bullet points.**
- **Apply identity installation and emotional state creation principles.**
- **Focus on single-page conversion optimisation.**
- **Use Markdown headings and bullet points only:**

## Landing Page Strategic Foundation

### Primary Conversion Goal
- Define the specific action visitors should take on this landing page
- Identify the psychological motivation that drives this action

### Target Identity Installation
- Create "For [specific type of person] who [situation]..." statement for instant recognition
- Address their aspirational identity and current frustration
- Position landing page offer as bridge to desired identity

### Emotional State Mapping
- Current emotional state: visitor's pain, fear, or desire when arriving
- Desired emotional outcome: confidence, relief, excitement after conversion
- Emotional transformation the landing page will facilitate

### Core Offer Positioning
- Primary offer with psychological benefits clearly defined
- How the offer addresses both practical and emotional needs
- Unique value that differentiates from alternatives

### SEO Keyword Strategy
- 3–5 primary keywords based on services + audience (+ location if provided)
- Secondary long-tail keywords for content strategy
- Location-specific SEO opportunities where relevant (use provided regions/markets)

### Visitor Journey Psychology
- Traffic source context and visitor mindset
- Pre-existing emotional state based on how they arrived
- Conversion barriers specific to landing page visitors

### Strategic Gaps Requiring Clarification
- Missing information that impacts conversion psychology
- Specific details needed for stronger offer positioning

**Language Requirements:**
- Use British English spelling and grammar throughout, but adapt all examples and references to the provided location: ${location}
- Keep examples and references internationally neutral

**Output MUST be structured with the above Markdown headings and bullet points only. No introductory text. Focus on single-page conversion strategy.**`,
          label: "Strategic Foundation",
          generateNewPrompts: false,
        },
        {
          prompt: `Prompt 2: Authority & Trust Psychology

**Objective:** Establish credibility, social proof, and trust signals specifically for landing page conversion psychology.

**User Inputs:**
- **Brand Guidelines:** "${brandGuidelines}"
- **Desired Emotional Impact:** "${emotions}"
- **Competitors:** "${competitors}"
- **Unique Selling Points (USPs):** "${usps}"
- **Inspirations (Optional):** "${inspirations}"
- **Services/Products:** "${serviceDescription}"

**Task:**
- **Apply authority establishment and social proof psychology for landing pages.**
- **Use Markdown headings and bullet points to structure output:**

## Authority & Credibility Framework

### Expert Positioning Strategy
- Establish credibility through specific credentials, results, or methodology
- Position as the obvious choice through demonstrated expertise
- Create authority using data, statistics, or industry recognition

### Social Proof Architecture
- Types of social proof most relevant to landing page visitors
- Testimonial strategy that addresses specific conversion objections
- Social proof placement for maximum psychological impact on single page
- Numbers and metrics that build immediate confidence

### Trust Signal Strategy
- Certifications, guarantees, or badges needed for landing page trust
- Security and reliability indicators for conversion points
- Risk reversal offers that overcome purchase anxiety
- Authority by association opportunities (partnerships, media mentions) across relevant local, regional, and global outlets

## Competitive Differentiation Psychology

### Contrast Creation Strategy
- How competitors position similar offers versus your unique angle
- Specific weaknesses in competitor offerings you can exploit
- Positioning that makes alternatives seem obviously inferior

### Value Gap Demonstration
- Quantifiable problems with conventional approaches
- Specific advantages your solution provides over alternatives
- Opportunity costs of choosing competitor options

## Landing Page Trust Elements

### Objection Handling Framework
- Primary hesitations landing page visitors will have
- Pre-emptive responses to common concerns about the offer
- Social proof that addresses specific conversion doubts

### Credibility Indicators
- Visual elements that reinforce authority and expertise
- Testimonial formats that build trust for this specific offer
- Guarantee structures that remove conversion risk

**Language Requirements:**
- Use British English spelling and grammar throughout, but adapt all examples and references to the provided location: ${location}
- Keep examples and references internationally neutral

**Output MUST use headings and bullet points only. Focus on building unshakeable credibility for landing page conversion. No introductory text.**`,
          label: "Authority & Trust",
          generateNewPrompts: false,
        },
        {
          prompt: `Prompt 3: Urgency Psychology & Conversion Optimisation

**Objective:** Create legitimate urgency, optimise for conversions, and recommend landing page optimisation using psychological principles.

**User Inputs:**
- **Marketing Strategy:** "${marketing}"
- **Target Audience:** "${audience}"
- **Services/Products:** "${serviceDescription}"
- **Location:** "${location}"

**Task:**
- **Apply urgency psychology, FOMO elements, and landing page conversion optimisation.**
- **Structure with headings and bullet points:**

## Urgency & FOMO Psychology

### Legitimate Scarcity Creation
- Time-based urgency that feels authentic for the offer
- Capacity or inventory limitations that drive immediate action
- Seasonal or event-based urgency opportunities for landing page

### FOMO Implementation Strategy
- What visitors fear missing out on most with this specific offer
- Social proof that others are taking action right now
- Real-time indicators and countdown elements for urgency

### Value Acceleration Techniques
- Bonus offers that expire to encourage quick decisions
- Progressive disclosure that builds commitment throughout page
- Loss aversion triggers that motivate immediate action

## Landing Page Conversion Optimisation

### Page Flow Psychology
- Attention-grabbing headline that stops scrolling immediately
- Logical flow that builds desire and overcomes objections
- Strategic CTA placement and frequency throughout single page

### Form & Friction Optimisation
- Minimal friction strategies for lead capture or purchase
- Trust indicators positioned around conversion points
- Progressive commitment techniques to reduce abandonment

### Mobile Conversion Psychology
- Mobile-specific psychological triggers for touch interfaces
- Simplified decision-making process for smaller screens
- Touch-friendly design that encourages conversion action

## Technical Requirements for High Conversion

### Performance Psychology
- Page load speed impact on visitor attention and trust
- Visual hierarchy that guides attention directly to CTAs
- A/B testing capabilities for psychological trigger optimisation

### Analytics & Optimisation Setup
- Conversion tracking for psychological trigger effectiveness
- Heatmap analysis for visitor behaviour and attention patterns
- Split testing framework for continuous landing page improvement

### Integration Requirements
- CRM integration for immediate lead processing
- Email automation triggered by landing page behaviour
- Retargeting pixel setup for visitor re-engagement campaigns

## Conversion Channel Psychology
- Traffic source optimisation and visitor mindset alignment
- Campaign messaging that pre-frames landing page psychology
- Channel-specific urgency elements that match visitor expectations

**Language Requirements:**
- Use British English, but adapt all examples and references to the provided location: ${location}. Keep stack and vendor examples globally applicable

**Output MUST use headings and bullet points only. Focus on conversion psychology and modern technical requirements. No introductory text.**`,
          label: "Marketing & Technical",
          generateNewPrompts: false,
        },
        {
          prompt: `Prompt 4: Strategic Implementation Blueprint

**Objective:** Create a complete strategic implementation plan with conversion psychology integration and clear action steps for landing page success.

**User Inputs:** All previous prompt outputs and form data

**Task:**
- **Synthesise all strategic elements into actionable blueprint.**
- **Apply SIGMA protocol (Simplicity, Immediacy, Guarantee, Motivation, Action) for implementation.**
- **Use Markdown headings and bullet points only:**

## Strategic Implementation

### Conversion Psychology Integration
- Identity installation implementation across landing page sections
- Emotional state creation journey mapped to single-page flow
- Authority establishment elements positioned strategically
- Trust signal placement for maximum psychological impact

### Content Strategy & Messaging Hierarchy
- Primary messages that drive conversion psychology
- Supporting content that builds trust and overcomes objections
- Call-to-action strategy using progressive commitment principles
- Urgency messaging that feels authentic and compelling

### Landing Page User Experience Psychology
- Friction reduction techniques for smoother conversion paths
- Social proof integration that reinforces offer value
- Visual hierarchy that guides attention to conversion points
- Mobile optimisation for psychological trigger effectiveness

## Technical Implementation Priorities

### Conversion-Focused Architecture
- Single-page structure optimised for psychological flow
- Loading speed requirements for maintaining visitor engagement
- Analytics configuration for conversion psychology measurement
- A/B testing framework for continuous optimisation

### Marketing Integration Strategy
- Traffic source alignment with landing page psychology
- Campaign messaging that pre-frames visitor expectations
- Retargeting setup for visitor re-engagement
- Lead nurturing automation for post-conversion psychology

### SEO & Content Framework
- Keyword implementation strategy aligned with user psychology
- Content calendar focusing on authority building and community engagement
- Location-specific SEO optimisation based on provided location: ${location}

### Performance & Optimisation Framework
- Conversion tracking for psychological trigger effectiveness
- Heatmap analysis for visitor behaviour patterns
- Split testing plan for landing page elements
- Success metrics aligned with conversion psychology goals

## Launch Strategy & Optimisation

### Phase 1: Foundation
- Core landing page with essential psychological triggers implemented
- Basic conversion tracking and trust signals established
- Primary traffic source campaigns activated

### Phase 2: Optimisation
- A/B testing plan for psychological trigger effectiveness
- Advanced personalisation based on traffic source
- Enhanced social proof and authority element testing

### Phase 3: Scale
- Multi-variant testing of psychological triggers
- Advanced automation and follow-up sequences
- Conversion rate optimisation based on data insights

## Success Metrics & Measurement

### Conversion Psychology KPIs
- Identity recognition and emotional engagement metrics
- Trust building and authority perception measurement
- Urgency element effectiveness tracking
- Overall conversion rate and visitor flow analysis

### Business Impact Indicators
- Lead quality improvement and conversion optimisation
- Cost per conversion across different traffic sources
- Lifetime value correlation with landing page psychology

## Strategic Gaps & Next Steps
- Critical missing elements that could impact conversion psychology
- Immediate action items for strongest psychological impact
- Long-term optimisation strategies for sustained performance

**Language Requirements:**
- Use British English, but adapt all examples and references to the provided location: ${location}

**IMPORTANT FORMATTING RULES:**
- Do NOT use code blocks, backticks, or triple backticks formatting anywhere
- Use only standard Markdown headings
- Structure all content as bullet points using dash (-)
- No introductory text or conclusions
- Focus on actionable psychological implementation strategies`,
          label: "Strategic Blueprint",
          dependsOn: [0, 1, 2],
          generateNewPrompts: false,
        },
        {
          prompt: `Prompt 5: Landing Page Wireframe with Conversion Psychology

**Objective:** Create a detailed ASCII wireframe of the landing page only, incorporating psychological triggers and conversion optimisation principles.

**User Inputs:** All strategic elements from previous prompts

**Task:**
- **Design landing page wireframe using ASCII visualisation**
- **Integrate identity installation, emotional triggers, and conversion psychology**
- **Include specific sections based on psychological persuasion framework**

## Landing Page Wireframe Design

**MANDATORY: Create detailed ASCII wireframe showing layout, sections, and psychological trigger placement**

**CRITICAL: Choose one consistent box width and ensure ALL content fits within those boundaries. 
No text should extend beyond the ASCII box edges. Break long text into multiple lines that fit cleanly.**

FORMATTING RULE: 
- Indicate background colours only ONCE per section in the section header
- Do NOT repeat background colour tags on every line
- Use format: "SECTION NAME (Background Colour)" 
- Keep lines clean without repetitive colour tags

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
|            [Primary CTA Button - Contrasting Colour]  |
|                [Urgency text below CTA]                |
+--------------------------------------------------------+
|                                                        |
|               SOCIAL PROOF SECTION                     |
|    [Customer Logos] [Testimonial] [Stat/Number]        |
| Join X+ [customers in ${location} or globally] who...  |
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
|  |  Benefit 1 | |  Benefit 2 | |  Benefit 3 |          |
|  | [Outcome]  | | [Outcome]  | | [Outcome]  |          |
|  | [Proof]    | | [Proof]    | | [Proof]    |          |
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

### Conversion Flow Optimisation
- Primary path: Hero CTA → Benefits → Urgency → Final CTA
- Secondary micro-commitments throughout (testimonial views, benefit engagement)
- Trust building elements positioned near conversion points
- Mobile-optimised flow with thumb-friendly CTA placement

## Complete Implementation Blueprint

### Phase 1: Foundation Setup
- Core landing page structure with psychological triggers
- Basic conversion tracking and analytics implementation
- Trust signals and social proof elements
- Mobile-responsive design with conversion optimisation

### Phase 2: Advanced Optimisation
- A/B testing framework for psychological elements
- Advanced tracking for micro-conversions and engagement
- Personalisation based on traffic source and behaviour
- Retargeting campaign integration

### Phase 3: Scaling & Refinement
- Multi-variant testing of psychological triggers
- Advanced automation and nurture sequences
- Conversion rate optimisation based on data insights
- Expansion to additional landing page variations

### Success Metrics & KPIs
- Primary conversion rate (visitor to conversion)
- Micro-conversion rates (engagement with psychological elements)
- Traffic source conversion performance
- Mobile versus desktop conversion analysis
- Psychological trigger effectiveness measurement

**Language Requirements:**
- Use British English. Keep cultural references globally understandable but adapt all examples and references to the provided location: ${location}

**MANDATORY REQUIREMENTS:**
- Must include detailed ASCII wireframes for both desktop and mobile
- Must specify exact placement of psychological triggers
- Must show conversion flow and CTA positioning
- Must indicate colour coding (teal backgrounds, yellow CTAs, green accents)
- This wireframe is for HOMEPAGE ONLY - not other pages
- If a location is provided, reflect it generically (city/region/country). If none is provided, use globally neutral phrasing

**Output format: Use code blocks for wireframes to preserve formatting. Include comprehensive implementation guidance.**`,
          label: "Landing Page Wireframe",
          dependsOn: [0, 1, 2],
          generateNewPrompts: false,
        },
      ];

      // ✅ Execute prompts and update the session once complete
      const executeLandingPlan = async () => {
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

      setPrompts(prompts);

      setGenerateLandingPlan(() => executeLandingPlan);

      if (hasCredits) {
        executeLandingPlan();
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

  const steps = [
    "Analyzing your inputs...",
    "Formulating a strategy...",
    "Generating landing page recommendations...",
    "Finalising content...",
  ];

  useEffect(() => {
    if (isLoading && prompts?.length > 0) {
      const progressPercentage = displayProgress;
      const stepIndex = Math.floor((progressPercentage / 100) * steps.length);

      setCurrentStep(Math.min(stepIndex, steps.length - 1));
    }
  }, [displayProgress, steps?.length, isLoading]);

  useEffect(() => {
    if (isLoading && prompts?.length > 0) {
      const completedCount = executedPrompts || 0;
      const totalCount = prompts?.length;
      const calculatedProgress = (completedCount / totalCount) * 100;

      // Set target progress immediately
      setTargetProgress(calculatedProgress);

      // Ensure progress completes when all prompts finish
      if (completedCount === totalCount) {
        setTargetProgress(100);
      }

      logger.debug("[PROGRESS] - Calculated progress:", calculatedProgress);
      logger.debug("[PROGRESS] - completedCount:", executedPrompts);
      logger.debug("[PROGRESS] - totalCount:", prompts?.length);
    }
  }, [executedPrompts, prompts, isLoading]);

  useEffect(() => {
    let animationFrame;
    let startTime;
    const duration = 2000; // Animation duration in milliseconds

    const animateProgress = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentProgress = displayProgress;
      const difference = targetProgress - currentProgress;
      const newProgress = currentProgress + difference * easeOut;

      setDisplayProgress(newProgress);

      // Continue animation if not close enough to target
      if (Math.abs(newProgress - targetProgress) > 0.5) {
        animationFrame = requestAnimationFrame(animateProgress);
      } else {
        setDisplayProgress(targetProgress); // Snap to exact target
      }
    };

    if (targetProgress !== displayProgress) {
      animationFrame = requestAnimationFrame(animateProgress);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [targetProgress, displayProgress]);

  // Initial progress simulation when loading starts
  useEffect(() => {
    if (isLoading && prompts?.length > 0 && displayProgress === 0) {
      // Start with immediate small progress to show activity
      setDisplayProgress(2);

      // Simulate gradual progress before actual execution
      const intervals = [];

      // Progress very slowly over first 4 seconds
      intervals.push(setTimeout(() => setTargetProgress(3), 500));
      intervals.push(setTimeout(() => setTargetProgress(5), 1500));
      intervals.push(setTimeout(() => setTargetProgress(7), 3000));
      intervals.push(setTimeout(() => setTargetProgress(9), 4500));

      return () => intervals.forEach(clearTimeout);
    }
  }, [isLoading, prompts?.length]);

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
                    "text-3xl font-semibold text-neutralDark dark:text-white select-none",
                }}
                showValueLabel={true}
                strokeWidth={4}
                value={Math.round(displayProgress)} // Use displayProgress instead of progress
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
          <ContentRenderer
            combinedContent={getCombinedOutputWithMarkers()} // For copy/export functions
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
