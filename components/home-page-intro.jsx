"use client";

import VideoPlayer from "@/components/video-player/video-player";
import ReactMarkdown from "react-markdown";
import TextReader from "@/components/text-reader";
import { Divider, Link } from "@heroui/react";

// Content object for DriftDraft homepage - concise psychological framework
export const homePageContent = {
  hero: {
    identity:
      "**For business owners** who know their **website** should **work harder**, but don't know what it's missing.",
    headline: "Get the strategic blueprint that turns visitors into customers.",
    cta: "Get Your Blueprint",
    socialProof: "Start with free credits — no commitment required",
  },

  sections: [
    {
      id: "website-blueprint",
      title: "Complete Strategic Blueprint",
      content: `Most people build websites by copying competitors or guessing what looks good. This guides you through proper strategic thinking, target audience psychology, colour emotions, brand positioning, conversion flows. All the stuff marketing consultants charge thousands for, broken down into questions you can actually answer.`,
      followUp: `~27 page strategic blueprint generated in minutes. Download as PDF, brief developers confidently.`,
      videoUrl: "/guide-videos/website-planner-purpose.mp4",
      placement: "left",
    },
    {
      id: "competition-discovery",
      title: "Find Your Competition",
      content: `Who are you actually competing with? Most business owners guess wrong. This finds your real competition automatically—the ones your audience compares you to right now. **One-click research** saves hours of manual hunting.`,
      followUp: `See the real landscape without endless searching.`,
      videoUrl: "/guide-videos/competitors-guide.mp4",
      placement: "right",
    },
    {
      id: "domain-discovery",
      title: "Strategic Domain Names",
      content: `Your domain name works harder than you think. AI suggests **brand-friendly alternatives** that reinforce authority and help you stand out in your space. Smart options you might not think of yourself.`,
      followUp: `Your domain should work as hard as your marketing.`,
      videoUrl: "/guide-videos/domain-guide.mp4",
      placement: "left",
    },
    {
      id: "blueprint-generation",
      title: "Blueprint Generation",
      content: `Complete the strategic questionnaire, get your comprehensive blueprint immediately. Access anytime via "My Activities". AI processes your answers to deliver tailored recommendations without the guesswork.`,
      exampleLink: {
        text: "Example blueprint",
        url: "/khalsa2pedal_mobile_bike_service.pdf",
      },
      followUp: `Based on conversion psychology. Professional consultation recommended for implementation.`,
      videoUrl: "/guide-videos/generation-guide.mp4",
      placement: "right",
    },
    {
      id: "plan-management",
      title: "Your Strategic Workspace",
      content: `Review, edit, download, or regenerate blueprints. Easy organisation and PDF export for important versions. Regenerate updated versions instantly as your business evolves—AI handles the heavy lifting.`,
      followUp: `Start with free credits. Complete blueprint: 5 credits. Top up via "Subscription & Credits" in your account.`,
      videoUrl: "/guide-videos/activities-guide.mp4",
      placement: "left",
    },
  ],

  // Simplified authority messaging
  authority: {
    contrast:
      "Whilst competitors guess at what works, you'll have working conversion psychology.",
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
              <div className="max-w-xl text-neutralDark prose prose-h2:font-semibold prose-h2:text-neutralDark prose-strong:text-neutralDark text-left md:text-lg">
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
