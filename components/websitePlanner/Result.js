'use client';

import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@nextui-org/react';
import { IconCopy } from '@tabler/icons-react';
import { toast } from 'sonner';

import { useSessionContext } from "@/lib/SessionProvider";
import logger from '@/lib/logger';
import useClientData from "@/lib/hooks/useClientData";

import { useAuth } from '@/lib/AuthContext';

const Result = ({ }) => {

  const { sessionData, updateSessionData, updateAiGeneratedPlanInDb, setError } = useSessionContext();
  const [aiResult, setAiResult] = useState(null);
  const aiResultRef = useRef(aiResult);
  const [isLoading, setIsLoading] = useState(true);
  const { clientData } = useClientData();
  const { user } = useAuth();
  const userId = user?.id;
  const sessionId = sessionData?.sessionId;

  useEffect(() => {
    aiResultRef.current = aiResult;
    
  }, [aiResult]);

  useEffect(() => {
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

      const prompt = `Based on the provided inputs, create a concise and strategic website plan that captures the user's needs and requirements. The plan should be formatted as a professional document that can be shared with a developer or web design agency. 

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

      const fetchContent = async () => {
        try {
          const response = await fetch("/api/aiHintRateLimited", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt, clientData }),
          });

          if (response.status === 429) {
            const { message, remainingMinutes } = await response.json();      
            setAiResult(
              `\n\n${message} Upgrade your subscription, or try again later.`
            );
            return;
          }

          if (!response.ok) {
            const errorData = await response.json();

            throw new Error(errorData.error || "An unknown error occurred.");
          }

          const data = await response.json();

          setAiResult(data.content || "No content generated.");
          updateSessionData("aiGeneratedPlan", data.content);
        } catch (error) {
          logger.error("Error fetching content:", error);
          setAiResult("An error occurred while generating content.");
        } finally {
          updateAiGeneratedPlanInDb(userId, sessionId, aiResultRef.current);
          setIsLoading(false);
        }
      };

      logger.info("fetching content");
      fetchContent();
    } else {
      logger.info("resetting hint");
      setAiResult(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Remove URL params after setting the step
    if (window.history.replaceState) {
      const newUrl = window.location.pathname;

      window.history.replaceState(null, '', newUrl);
    }
  }, []);

  return (
    <div>
      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-lg font-semibold text-gray-600">
            Generating your website plan... Please wait.
          </p>
        </div>
      ) : (
        <>
          <div className="w-full flex justify-end">
            <Button
              color="secondary"
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
          <ReactMarkdown className="whitespace-pre-wrap p-8 my-12 rounded-2xl bg-yellow-100/60 dark:bg-content1 max-w-screen-lg">
            {aiResult}
          </ReactMarkdown>
          <div className="w-full flex justify-end">
            <Button
              color="secondary"
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
        </>
      )}
    </div>
  );
};

Result.displayName = 'Result';

export default Result;
