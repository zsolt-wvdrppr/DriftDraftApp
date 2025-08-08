// Updated component using the content object
"use client";

import VideoPlayer from "@/components/video-player/video-player";
import ReactMarkdown from "react-markdown";
import TextReader from "@/components/text-reader";
import { Divider, Link } from "@heroui/react";
import CalloutText from "@/components/callout-text";
//import { homePageContent } from "./homePageContent"; // Import the content

// Content object for DriftDraft homepage - concise psychological framework
export const homePageContent = {
  hero: {
    identity:
      "For business owners who know their website should convert—but don't know why it doesn't.",
    headline: "Get the strategic blueprint that turns visitors into customers.",
    cta: "Get Your Blueprint",
    socialProof: "Start with free credits — no commitment required",
  },

  sections: [
    {
      id: "website-blueprint",
      title: "Strategic Website Blueprint",
      content: `Get the **psychological framework** that professional brands use to convert visitors. Shows exactly what your website should say and how to guide visitors towards taking action, **avoiding costly mistakes** that lose customers.`,
      followUp: `Download as PDF, refine endlessly, brief developers confidently. The competitive edge you've been missing.`,
      videoUrl: "/guide-videos/website-planner-purpose.mp4",
      placement: "left",
    },
    {
      id: "competition-discovery",
      title: "Competition Discovery",
      content: `Instantly discover who you're competing against locally. Clear **competitive positioning** analysis with one-click research—saving hours of manual work.`,
      videoUrl: "/guide-videos/competitors-guide.mp4",
      placement: "right",
    },
    {
      id: "domain-discovery",
      title: "Strategic Domain Names",
      content: `Find domains that reinforce your brand authority. Smart alternatives suggested automatically, your domain works as hard as your marketing.`,
      videoUrl: "/guide-videos/domain-guide.mp4",
      placement: "left",
    },
    {
      id: "blueprint-generation",
      title: "Blueprint Generation",
      content: `Complete the strategic questionnaire, get your comprehensive blueprint immediately. Access anytime via "My Activities".`,
      exampleLink: {
        text: "Example blueprint",
        url: "/khalsa2pedal_mobile_bike_service.pdf",
      },
      followUp: `Based on proven conversion psychology. Professional consultation recommended for implementation.`,
      videoUrl: "/guide-videos/generation-guide.mp4",
      placement: "right",
    },
    {
      id: "plan-management",
      title: "Plan Management",
      content: `Your strategic workspace—review, edit, download, or regenerate blueprints. Easy organisation and PDF export for important versions.`,
      followUp: `Start with free credits. Complete blueprint: 5 credits. Top up via "Subscription & Credits" in your account.`,
      videoUrl: "/guide-videos/activities-guide.mp4",
      placement: "left",
    },
  ],

  // Simplified authority messaging
  authority: {
    contrast:
      "Whilst competitors guess at what works, you'll have proven conversion psychology.",
    value:
      "£4 delivers what consultants charge £2,000+ for—strategic advantage in minutes, not months.",
  },
};

const HomePageIntro = () => {
  const { hero, sections, authority, value } = homePageContent;

  return (
    <div className="p-2.5 w-full flex flex-col items-center justify-center gap-4 ga-p-y8 md:gap-8 max-w-5xl">
      {/* Dynamic Sections */}
      {sections.map((section, index) => (
        <div key={section.id} className="w-full max-w-5xl">
          <TextReader className="backdrop-blur-sm w-full">
            <div
              className={`relative flex flex-col gap-y-8 md:gap-10 items-center justify-center w-full ${
                section.placement === "right" ?
                  "md:flex-row-reverse"
                : "md:flex-row"
              }`}
            >
              <div className="max-w-xl text-neutralDark prose prose-h2:font-semibold prose-h2:text-neutralDark prose-strong:text-neutralDark text-justify md:text-lg">
                <ReactMarkdown>
                  {`## ${section.title}\n${section.content}`}
                </ReactMarkdown>

                {section.exampleLink && (
                  <Link
                    className="hover:bg-default-2 no-underline"
                    underline="hover"
                    href={section.exampleLink.url}
                    target="_blank"
                  >
                    {section.exampleLink.text}
                  </Link>
                )}
              </div>

              <div className="w-full overflow-hidden rounded-xl mb-4">
                <VideoPlayer
                  loop
                  aspectRatio={
                    section.id === "plan-management" ? "1584:1080" : "400:308"
                  }
                  className="h-full w-full overflow-hidden"
                  controls={false}
                  muted={true}
                  playing={true}
                  url={section.videoUrl}
                />
              </div>
            </div>

            {section.followUp && (
              <div className="max-w-5xl prose text-justify mt-6 md:text-lg text-neutralDark py-2">
                <ReactMarkdown>{section.followUp}</ReactMarkdown>
              </div>
            )}
          </TextReader>

          {index < sections.length - 1 && <Divider className="my-8" />}
        </div>
      ))}

      {/* Authority & Value Section */}
      <Divider />
      <div className="max-w-4xl text-center mx-auto">
        <p className="text-lg md:text-xl mb-4">{authority.contrast}</p>
        <p className="text-xl md:text-2xl font-semibold text-primary">
          {authority.value}
        </p>
      </div>
    </div>
  );
};

export default HomePageIntro;
