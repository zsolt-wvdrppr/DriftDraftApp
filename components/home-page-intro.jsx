"use client";

import VideoPlayer from "@/components/video-player/video-player";
import ReactMarkdown from "react-markdown";
import TextReader from "@/components/text-reader";
import { Divider, Link } from "@heroui/react";
import References from "@/components/ui/references";
import { homePageContent } from "@/content/pages/homePageContent";

// Content object for DriftDraft homepage - concise psychological framework


const HomePageIntro = () => {
  const { hero, sections, authority, value } = homePageContent;

  return (
    <div className="p-2.5 w-full flex flex-col items-center justify-center gap-4 ga-p-y8 md:gap-8 max-w-5xl select-none">
      {/* Dynamic Sections */}
      {sections.map((section, index) => (
        <div key={section.id} className="w-full max-w-5xl">
          <TextReader className="backdrop-blur-sm w-full" placement={section.placement}>
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

                {/* Add References component */}
                {section.references && (
                  <References contentList={section.references} />
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
              <div className="max-w-5xl prose w-full text-justify md:text-center mt-6 md:text-lg text-neutralDark py-2">
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
