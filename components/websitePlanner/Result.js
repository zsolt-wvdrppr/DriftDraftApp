// file: components/websitePlanner/Result.js
// // This file renders the AI-generated website blueprint,

"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Button,
  CircularProgress,
  Card,
  CardBody,
  CardFooter,
  Link,
  form,
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

  const [jwt, setJwt] = useState(null);

  const [showRetryButton, setShowRetryButton] = useState(false);

  const [displayProgress, setDisplayProgress] = useState(0); // Smooth animated progress
  const [targetProgress, setTargetProgress] = useState(0); // Actual calculated progress

  const [generateWebsitePlan, setGenerateWebsitePlan] = useState(null);

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
    structuredOutput, // NEW: Get structured sections
    getCombinedOutputWithMarkers, // NEW: For storage
    getLegacyCombinedOutput, // For backward compatibility if needed
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
    formData[3]?.urls?.toString() !== "" ?
      `I have identified the following competitors: ${formData[3].urls.toString()}.`
    : ""; // optional
  const location = formData?.[3]?.location?.address || "global";
  const usps = formData?.[4]?.usps || "";
  const domain = formData?.[5]?.domain || "";
  const brandGuidelines = formData?.[6]?.brandGuidelines || "";
  const emotions = formData?.[7]?.emotions || "";
  const inspirations = formData?.[8]?.inspirations?.toString() || ""; // optional

  const domainText = formData?.[5]?.domain || "";
  const domains = domainText
    .split(",")
    .map((d) => d.trim())
    .filter((d) => d);

  let domainInstruction;

  if (domains?.length === 0) {
    domainInstruction =
      "Use placeholder [YourDomain.com] for any domain references";
  } else if (domains.length === 1) {
    domainInstruction = `Use the domain name '${domains[0]}' consistently throughout`;
  } else {
    domainInstruction = `Domain options being considered: ${domains.join(", ")}. Use the first option '${domains[0]}' as the primary example, but mention it's one of several being evaluated`;
  }
  /* End of form data */

  logger.debug("Location:", location);

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

**Objective:** Create a strategic foundation using psychological triggers, SEO insights, and identity installation techniques.

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
- **Include SEO keyword strategy based on services and audience.**
- **Use Markdown headings and bullet points only:**

## Website Strategic Foundation

### Primary Conversion Goal
- Define the main conversion action and psychological motivation behind it

### Target Identity Installation
- Create "For [specific type of person] who [situation]..." statement that creates instant recognition
- Address their aspirational identity and current pain point

### Emotional State Mapping
- Current frustration/pain state of target audience
- Desired emotional outcome after using service
- Emotional transformation journey they'll experience

### Core Service Positioning
- Primary service offering with psychological benefits
- How services address both practical and emotional needs

### SEO Keyword Strategy
- 3–5 primary keywords based on services + audience (+ location if provided)
- Secondary long-tail keywords for content strategy
- Location-specific SEO opportunities where relevant (use provided regions/markets)

### Strategic Gaps Requiring Clarification
- Missing information that impacts conversion psychology
- Specific details needed for stronger positioning

**Language Requirements:**
- Use British English spelling and grammar throughout, but adapt all examples and references to the provided location: ${location}
- Keep examples and references internationally neutral

**Output MUST be structured with the above Markdown headings and bullet points only. No introductory text. Focus on psychological positioning and conversion strategy.**`,
          label: "Strategic Foundation",
          generateNewPrompts: false,
        },
        {
          prompt: `Prompt 2: Brand Psychology & Competitive Differentiation

**Objective:** Establish brand authority, group identity, and competitive contrast using psychological persuasion principles.

**User Inputs:**
- **Brand Guidelines:** "${brandGuidelines}"
- **Desired Emotional Impact:** "${emotions}"
- **Competitors:** "${competitors}"
- **Unique Selling Points (USPs):** "${usps}"
- **Inspirations (Optional):** "${inspirations}"
- **Services/Products:** "${serviceDescription}"

**Task:**
- **Apply authority establishment, group identity reinforcement, and contrast creation principles.**
- **Use Markdown headings and bullet points to structure output:**

## Brand Authority & Trust Signals

### Authority Positioning Strategy
- Establish expert credibility through specific credentials, experience, or methodology
- Position brand as industry thought leader with unique insights
- Create news-style authority through data, statistics, or industry recognition

### Trust & Credibility Indicators
- Specific trust signals needed (certifications, guarantees, testimonials)
- Authority by association opportunities (partnerships, media mentions) across relevant local, regional, and global outlets
- Social proof elements that build confidence in target audience

## Group Identity & Community Psychology

### Target Group Definition
- Define the "in-group" characteristics and shared values
- Establish what progressive/forward-thinking customers do versus outdated approaches
- Create belonging through "we/us" language and shared aspirations

### Negative Dissociation Strategy
- Contrast with conventional/outdated approaches without criticising people
- Position alternatives as limiting or ineffective
- Create clear separation between leaders (target audience) and followers

## Competitive Contrast & Differentiation

### Competitor Analysis & Positioning
- Analyse competitor messaging and identify differentiation opportunities
- Highlight specific shortcomings of alternative approaches
- Position unique approach as obviously superior

### Value Gap Demonstration
- Calculate specific costs/problems of conventional approaches
- Show quantifiable advantages of your methodology
- Illustrate opportunity costs of not choosing your solution

## Emotional Brand Direction

### Visual Psychology Strategy
- Colour psychology application based on desired emotions
- Typography choices that reinforce brand personality and trust
- Imagery strategy that creates aspirational group identification

### Messaging Psychology Framework
- Tone and voice that builds authority whilst remaining approachable
- Language patterns that create emotional connection and urgency
- Key phrases that trigger desired psychological responses

## Brand Implementation Gaps
- Missing brand elements needed for stronger psychological impact
- Specific clarifications required for effective authority establishment
- Additional competitive intelligence needed for stronger positioning

**Language Requirements:**
- Use British English spelling and grammar throughout, but adapt all examples and references to the provided location: ${location}
- Keep examples and references internationally neutral

**Output MUST use headings and bullet points only. Focus on psychological differentiation and authority building. No introductory text.**`,
          label: "Brand Psychology",
          generateNewPrompts: false,
        },
        {
          prompt: `Prompt 3: Marketing Psychology & Technical Foundation

**Objective:** Create conversion-focused marketing strategy and recommend modern technical stack using persuasion principles.

**User Inputs:**
- **Marketing Strategy:** "${marketing}"
- **Domain preferences:** "${domain}"
- **Location:** "${location}"

- **DOMAIN USAGE: ${domainInstruction}**

**Task:**
- **Apply urgency & value framework, FOMO elements, and conversion psychology.**
- **Structure with headings and bullet points:**

## Conversion-Focused Marketing Strategy

### Traffic Generation Psychology
- SEO strategy targeting buyer-intent keywords and emotional triggers
- Adjust geographic targeting based on provided locations/markets; default to global targeting if none supplied.
- Social media approach using group identity reinforcement and social proof
- Content marketing that establishes authority and addresses pain points
- Paid advertising with psychological targeting and compelling ad copy

### Lead Capture & Nurture Framework
- Lead magnets that create micro-commitments and build trust
- Email sequences using progressive commitment and value demonstration
- Retargeting strategies that address objections and build authority
- Community building tactics that reinforce group identity

## Urgency & Value Psychology

### Legitimate Urgency Creation
- Seasonal demand patterns (by hemisphere/region as applicable) and natural urgency opportunities
- Capacity-based scarcity that feels authentic
- Time-sensitive value propositions that motivate immediate action

### Value Demonstration Framework
- ROI calculations and cost-benefit analysis for target audience
- Risk reversal strategies and guarantee structures
- Comparison frameworks showing value against alternatives

## Technical Requirements for Conversion

### Performance Psychology
- Page load speed requirements for maintaining attention and trust
- Mobile-first design principles for user experience optimisation
- Security features that build confidence and reduce friction

### Conversion Optimisation Technology
- CRO tools and A/B testing capabilities for psychological trigger optimisation
- Analytics setup to track psychological engagement and conversion paths
- Automation tools for nurture sequences and behavioural triggers

### Modern Technology Recommendations
- Static Site Generator approach for superior performance and SEO
- Headless CMS integration for content flexibility and speed
- JavaScript framework recommendations for interactive elements
- Integration capabilities for CRM, analytics, and marketing automation

## Marketing Gaps & Optimisation Opportunities
- Missing marketing elements that could enhance conversion psychology
- Technical features needed for better user experience and trust
- Measurement strategies for psychological trigger effectiveness

**Language Requirements:**
- Use British English, but adapt all examples and references to the provided location: ${location}. Keep stack and vendor examples globally applicable

**Output MUST use headings and bullet points only. Focus on conversion psychology and modern technical requirements. No introductory text.**`,
          label: "Marketing & Technical",
          generateNewPrompts: false,
        },
        {
          prompt: `Prompt 4: Comprehensive Strategic Blueprint & Implementation Plan

**Objective:** Create a complete strategic implementation plan with conversion psychology integration and clear action steps.

**User Inputs:** All previous prompt outputs and form data

**Task:**
- **Synthesise all strategic elements into actionable blueprint.**
- **Apply SIGMA protocol (Simplicity, Immediacy, Guarantee, Motivation, Action) for implementation.**
- **Use Markdown headings and bullet points only:**

## Strategic Implementation

### Conversion Psychology Integration
- Identity installation implementation across website sections
- Emotional state creation journey mapped to user flow
- Authority establishment elements positioned strategically
- Group identity reinforcement throughout customer journey

### Content Strategy & Messaging Hierarchy
- Primary messages that drive conversion psychology
- Supporting content that builds trust and overcomes objections
- Call-to-action strategy using progressive commitment principles

### User Experience Psychology
- Friction reduction techniques for smoother conversion paths
- Trust signal placement for maximum psychological impact
- Social proof integration that reinforces group identity

## Technical Implementation Priorities

### Conversion-Focused Architecture
- Page structure optimised for psychological flow
- Loading speed requirements for maintaining engagement
- Mobile experience that maintains persuasion effectiveness

### Marketing Technology Integration
- CRM setup for customer journey tracking and personalisation
- Analytics configuration for conversion psychology measurement
- Automation tools for nurture sequences and behavioural triggers

### SEO & Content Framework
- Keyword implementation strategy aligned with user psychology
- Content calendar focusing on authority building and community engagement
- Location-specific SEO optimisation based on provided location: ${location}

## Launch Strategy & Optimisation

### Phase 1: Foundation
- Core pages with essential psychological triggers implemented
- Basic conversion tracking and trust signals established
- Primary marketing channels activated

### Phase 2: Optimisation
- A/B testing plan for psychological trigger effectiveness
- Advanced personalisation based on user behaviour
- Community building and authority establishment expansion

### Phase 3: Scale
- Advanced automation and psychological nurture sequences
- Expanded content strategy and thought leadership
- Partnership and referral psychology implementation

## Success Metrics & Measurement

### Conversion Psychology KPIs
- Identity recognition and emotional engagement metrics
- Trust building and authority perception measurement
- Group identity adoption and community engagement tracking

### Business Impact Indicators
- Lead quality improvement and conversion rate optimisation
- Customer lifetime value and retention psychology effectiveness
- Brand authority and market positioning advancement

## Strategic Gaps & Next Steps
- Critical missing elements that could impact conversion psychology
- Immediate action items for strongest psychological impact
- Long-term strategic considerations for sustained growth

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
          prompt: `Prompt 5: Homepage Wireframe with Conversion Psychology

**Objective:** Create a detailed ASCII wireframe of the homepage only, incorporating psychological triggers and conversion optimisation principles.

**User Inputs:** All strategic elements from previous prompts

**DOMAIN USAGE: ${domainInstruction}**

**Task:**
- **Design homepage wireframe using ASCII visualisation**
- **Integrate identity installation, emotional triggers, and conversion psychology**
- **Include specific sections based on psychological persuasion framework**

## Homepage Wireframe Design

**MANDATORY: Create detailed ASCII wireframe showing layout, sections, and psychological trigger placement**

**CRITICAL: Choose one consistent box width and ensure ALL content fits within those boundaries. 
No text should extend beyond the ASCII box edges. Break long text into multiple lines that fit cleanly.**

FORMATTING RULE: 
- Indicate background colours only ONCE per section in the section header
- Do NOT repeat background colour tags on every line
- Use format: "SECTION NAME (Background Colour)" 
- Keep lines clean without repetitive colour tags

Example:
+-----------------------------------------------------------------------+
|                    HERO SECTION (Teal Background)                     |
|                                                                       |
| For ambitious Budapest business owners feeling overwhelmed            |
| by complex web development & tech jargon...                           |
+-----------------------------------------------------------------------+

### Desktop Homepage Layout

\`\`\`
+--------------------------------------------------------+
|                    HEADER/NAVIGATION                   |
| [Logo] [Services] [Training] [About] [Contact] [CTA]  |
+--------------------------------------------------------+
|                                                        |
|                    HERO SECTION                        |
|              [Identity Installation Area]              |
|    "For [target identity] who [situation]..."         |
|              [Emotional Hook Headline]                 |
|                [Supporting Subtext]                    |
|            [Primary CTA Button - Yellow]              |
|                [Trust Signal/Badge]                    |
+--------------------------------------------------------+
|                                                        |
|               SOCIAL PROOF SECTION                     |
|    [Customer Logos] [Testimonial] [Authority Badge]   |
+--------------------------------------------------------+
|                                                        |
|              GROUP IDENTITY SECTION                    |
|     [Community Image] [In-Group Messaging]             |
|"Join X+ [customers in ${location} or globally] who..." |
+--------------------------------------------------------+
|                                                        |
|               SERVICES OVERVIEW                        |
|  +------------+ +------------+ +------------+          |
|  |  Mobile    | | Training   | | Community  |          |
|  |  Service   | | Programmes | | Events     |          |
|  | [Benefit]  | | [Benefit]  | | [Benefit]  |          |
|  +------------+ +------------+ +------------+          |
+--------------------------------------------------------+
|                                                        |
|              AUTHORITY ESTABLISHMENT                    |
|    [Expert Bio] [Credentials] [Media Mentions]        |
+--------------------------------------------------------+
|                                                        |
|               CONTRAST CREATION                        |
|     "Unlike traditional providers that..."             |
|            [Before vs After Comparison]                |
+--------------------------------------------------------+
|                                                        |
|              URGENCY & VALUE SECTION                   |
|        [Limited Availability] [ROI Calculator]        |
|              [Risk Reversal/Guarantee]                 |
+--------------------------------------------------------+
|                                                        |
|               FINAL CONVERSION ZONE                    |
|              [Secondary CTA - Yellow]                  |
|           [Contact Info] [Trust Signals]              |
+--------------------------------------------------------+
|                      FOOTER                            |
|    [Links] [Social] [Contact] [Legal] [Newsletter]    |
+--------------------------------------------------------+
\`\`\`

### Mobile Homepage Layout
\`\`\`
+------------------------+
|    HEADER & MENU       |
| [Logo]      [☰ Menu]   |
+------------------------+
|                        |
|     HERO SECTION       |
|  [Identity Hook Text]  |
|   [Emotional Trigger]  |
|    [Primary CTA]       |
|   [Trust Badge]        |
+------------------------+
|                        |
|   SOCIAL PROOF         |
| [Testimonial Snippet]  |
+------------------------+
|                        |
|   GROUP IDENTITY       |
|  [Community Message]   |
+------------------------+
|                        |
|    CORE SERVICES       |
|   [Service 1 Card]     |
|   [Service 2 Card]     |
|   [Service 3 Card]     |
+------------------------+
|                        |
|     AUTHORITY          |
|   [Expert Summary]     |
+------------------------+
|                        |
|    VALUE PROP          |
|  [Key Differentiator]  |
+------------------------+
|                        |
|   CONVERSION CTA       |
|  [Secondary Action]    |
+------------------------+
|       FOOTER           |
+------------------------+
\`\`\`

### Psychological Trigger Integration
- Identity installation placement in hero section with specific messaging
- Emotional state creation through visual and textual elements
- Authority establishment through credentials and social proof positioning
- Group identity reinforcement via community imagery and inclusive language
- Contrast creation showing competitive advantages
- Urgency and value framework implementation near conversion points

### Conversion Flow Optimisation
- Primary conversion path from hero to action
- Secondary micro-commitments throughout page
- Friction reduction techniques at decision points
- Trust signal placement for maximum psychological impact

### Content Priority Hierarchy
- Most important psychological triggers positioned above fold
- Supporting authority elements in middle sections
- Final conversion reinforcement at bottom

**Language Requirements:**
- Use British English. Keep cultural references globally understandable but adapt all examples and references to the provided location: ${location}

**MANDATORY REQUIREMENTS:**
- Must include detailed ASCII wireframes for both desktop and mobile
- Must specify exact placement of psychological triggers
- Must show conversion flow and CTA positioning
- Must indicate colour coding (teal backgrounds, yellow CTAs, green accents)
- This wireframe is for HOMEPAGE ONLY - not other pages
- If a location is provided, reflect it generically (city/region/country). If none is provided, use globally neutral phrasing

**Output format: Use the exact ASCII structure shown above, customise content based on strategic elements from previous prompts. Use code blocks for wireframes to preserve formatting.**`,
          label: "Homepage Wireframe",
          dependsOn: [0, 1],
          generateNewPrompts: false,
        },
      ];

      setPrompts(prompts);

      // ✅ Execute prompts and update the session once complete
      const executeWebsitePlan = async () => {
        try {
          logger.info("Executing prompts for website plan generation...");

          const results = await executePrompts(prompts, userId);
          const combinedResult = results.join("\n\n");

          if (!results || results?.length > 0) {
            await updateAiGeneratedPlanInDb(userId, sessionId, combinedResult);
            toast.success(
              "Website blueprint generated and saved successfully."
            );
          }
        } catch (err) {
          logger.error(
            "An error occurred while generating the website blueprint:",
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

       setGenerateWebsitePlan(() => executeWebsitePlan);

      if (hasCredits) {
        executeWebsitePlan();
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
    "Establishing brand psychology...",
    "Generating website recommendations...",
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
    if (isLoading && prompts.length > 0) {
      const completedCount = executedPrompts || 0;
      const totalCount = prompts.length;
      const calculatedProgress = (completedCount / totalCount) * 100;

      // Set target progress immediately
      setTargetProgress(calculatedProgress);

      // Ensure the progress bar completes only when all prompts finish
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
    fullName?.split(" ")[0] || sessionData.formData[8].firstname;

  const handleRetry = () => {
    setError(null);
    setShowRetryButton(false);
    alreadyFetched.current = false;

    if (hasCredits) {
      generateWebsitePlan();
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
            <CardBody className="justify-center items-center pb-0 select-none">
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
            <CardFooter className="justify-center h-11 items-center pt-4 select-none">
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
