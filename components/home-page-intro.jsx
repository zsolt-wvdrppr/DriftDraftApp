"use client";

import VideoPlayer from "@/components/video-player/video-player";
import ReactMarkdown from "react-markdown";
import TextReader from "@/components/text-reader";
import { Divider } from "@heroui/react";
import { Link } from "@heroui/react";

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
      <Divider/>
      <TextReader placement="justify-start md:justify-end ">
      <div className="relative flex flex-col gap-y-8 md:flex-row-reverse md:gap-10 items-center justify-center w-full">
        <div className="prose text-justify max-w-xl prose-p:mb-0">
          <ReactMarkdown>
            {`**Blueprint Generation:** Once you've completed all questionnaire sections, our AI analyses your answers to generate a comprehensive website plan. This blueprint becomes available immediately for viewing or copying, and remains accessible later through the "My Activities" section. The contact details requested in the final section are only used if you specifically request a quote from Wavdropper (us) for implementation services. Your information is never shared or used for other purposes without your explicit consent.`}
          </ReactMarkdown>
          <Link className="hover:bg-default-2 no-underline" underline="hover" href="/easy_meal_solutions.pdf" target="_blank">
            An example of a generated blueprint
          </Link>
        </div>

        <div className="w-full overflow-hidden rounded-xl outline-2 outline outline-primary/20 dark:outline-primary shadow-lg">
          <VideoPlayer
            loop
            aspectRatio="1584:1080"
            className="h-full w-full overflow-hidden"
            controls={false}
            muted={true}
            playing={true}
            url="/guide-videos/generation-guide.mp4"
          />
        </div>
      </div>
      <div className="max-w-5xl prose text-justify mx-auto mt-6">
        <ReactMarkdown>
          {`The AI-generated blueprint is provided for guidance only and may contain inaccuracies or errors. Quality of results directly correlates with the detail and clarity of your inputs. Wavdropper makes no guarantees regarding the completeness, accuracy or suitability of the generated blueprint for specific requirements. We recommend professional review before implementation. Use of this tool does not constitute professional website development or strategic consulting services.`}
        </ReactMarkdown>
      </div>
      </TextReader>
    </div>
  );
};

export default HomePageIntro;
