"use client";

import VideoPlayer from "@/components/video-player";
import ReactMarkdown from "react-markdown";
import TextReader from "@/components/text-reader";

const HomePageIntro = () => {
  return (
    <div className="p-2 w-full flex flex-col items-center justify-center gap-4 gap-y-8 md:gap-8 max-w-5xl">
        <TextReader className="">
      <div className="relative flex flex-col gap-y-8 md:flex-row md:gap-10 items-center justify-center w-full">
        <div className="prose text-justify max-w-xl">
          <ReactMarkdown>
            {`**DriftDraft** is a strategic planner that **transforms your** business **requirements into** a comprehensive website or landing page **blueprint**. Using **AI-powered guidance**, it helps you define purpose, structure and user journeys whilst **avoiding common pitfalls** like inadequate analytics, poor conversion paths or security vulnerabilities. The interactive process educates you on web best practices as you build your plan.`}
          </ReactMarkdown>
        </div>

        <div className="w-full overflow-hidden rounded-xl outline-2 outline outline-primary/20 dark:outline-primary shadow-lg">
          <VideoPlayer
            loop
            aspectRatio="1400:1080"
            className="h-full w-full overflow-hidden"
            controls={false}
            muted={true}
            playing={true}
            url="/guide-videos/website-planner-purpose.mp4"
          />
        </div>
      </div>
      <div className="max-w-5xl prose text-justify mx-auto mt-6">
        <ReactMarkdown>
          {`Perfect for business owners seeking a professional web presence and agencies streamlining client onboarding. Your completed blueprint can be downloaded as a PDF at no cost, refined further or handed directly to developers, ensuring nothing critical is overlooked in your digital strategy.`}
        </ReactMarkdown>
      </div>
      </TextReader>
    </div>
  );
};

export default HomePageIntro;
