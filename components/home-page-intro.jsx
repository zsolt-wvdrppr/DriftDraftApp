"use client";

import VideoPlayer from "@/components/video-player/video-player";
import ReactMarkdown from "react-markdown";
import TextReader from "@/components/text-reader";
import { Divider } from "@heroui/react";
import { Link } from "@heroui/react";

const HomePageIntro = () => {
  return (
    <div className="p-2 w-full flex flex-col items-center justify-center gap-4 gap-y-8 md:gap-8 max-w-5xl">
      <TextReader className="backdrop-blur-sm">
        <div className="relative flex flex-col gap-y-8 md:flex-row md:gap-10 items-center justify-center w-full">
          <div className="max-w-xl prose prose-h2:font-semibold">
            <ReactMarkdown>
              {`## Why do you need a Website Blueprint?
If you have a business, a non-profit, or any kind of organisation, having a clear website blueprint helps you **establish a professional online presence**. Think of it like a map that shows exactly how your website should look, what it should say, and how visitors will use it—without needing any tech knowledge. This way, you **avoid common problems** like confusing designs, pages that don't lead customers anywhere, or security risks you didn't even know existed. Plus, you’ll learn easy tips along the way, helping you **make smart choices** for your website.`}
            </ReactMarkdown>
          </div>

          <div className="w-full overflow-hidden rounded-xl outline-2 outline outline-primary/20 dark:outline-primary shadow-lg">
            <VideoPlayer
              loop
              aspectRatio="400:308"
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
            {`Whether you're a small business owner looking to build trust online or you manage clients who need professional websites, a blueprint makes your life easier. It’s something you can **show to any developer**, ensuring they **understand exactly what you want**. You can download your finished blueprint as a PDF at no cost, keep improving it, or hand it straight over to someone who’ll build your website, knowing nothing important has been missed.`}
          </ReactMarkdown>
        </div>
      </TextReader>
      <Divider />
      <TextReader
        className="backdrop-blur-sm"
        placement="justify-start md:justify-end w-full"
      >
        <div className="relative flex flex-col gap-y-8 md:flex-row-reverse md:gap-10 items-center justify-center w-full">
          <div className="prose text-justify max-w-xl prose-p:mb-0 prose-h2:font-semibold">
            <ReactMarkdown>
              {`## Discover Your Competition
Our AI tool identifies potential competitors based on your business details and location. Simply enter your location and click **"Refine with AI"** to see businesses operating in your market space. Review the suggestions and copy website URLs with a single click – providing a helpful starting point to understand your competitive landscape.`}
            </ReactMarkdown>
          </div>

          <div className="w-full min-w-full md:min-w-96 overflow-hidden rounded-xl outline-2 outline outline-primary/20 dark:outline-primary shadow-lg">
            <VideoPlayer
              loop
              aspectRatio="400:308"
              className="h-full w-full overflow-hidden"
              controls={false}
              muted={true}
              playing={true}
              url="/guide-videos/competitors-guide.mp4"
            />
          </div>
        </div>
      </TextReader>
      <Divider />
      <TextReader className="backdrop-blur-sm">
        <div className="relative flex flex-col gap-y-8 md:flex-row md:gap-10 items-center justify-center w-full">
          <div className="prose text-justify max-w-xl prose-p:mb-0 prose-h2:font-semibold">
            <ReactMarkdown>
              {`## Domain Discovery
Our AI suggests relevant domain names based on your business information with SEO requirements in mind. Get instant availability checks and find alternatives if your preferred options are taken. Streamline your domain search process with smart recommendations tailored to your brand.`}
            </ReactMarkdown>
          </div>

          <div className="w-full min-w-full md:min-w-96 overflow-hidden rounded-xl outline-2 outline outline-primary/20 dark:outline-primary shadow-lg">
            <VideoPlayer
              loop
              aspectRatio="400:308"
              className="h-full w-full overflow-hidden"
              controls={false}
              muted={true}
              playing={true}
              url="/guide-videos/domain-guide.mp4"
            />
          </div>
        </div>
      </TextReader>
      <Divider />
      <TextReader
        className="backdrop-blur-sm"
        placement="justify-start md:justify-end "
      >
        <div className="relative flex flex-col gap-y-8 md:flex-row-reverse md:gap-10 items-center justify-center w-full">
          <div className="prose text-justify max-w-xl prose-p:mb-0">
            <ReactMarkdown>
              {`## Blueprint Generation
Once you've completed all questionnaire sections, our AI analyses your answers to generate a comprehensive website plan. This blueprint becomes available immediately for viewing or copying, and remains accessible later through the "My Activities" section. The contact details requested in the final section are only used if you specifically request a quote from Wavdropper (us) for implementation services. Your information is never shared or used for other purposes without your explicit consent.`}
            </ReactMarkdown>
            <Link
              className="hover:bg-default-2 no-underline"
              underline="hover"
              href="/easy_meal_solutions.pdf"
              target="_blank"
            >
              An example of a generated blueprint
            </Link>
          </div>

          <div className="w-full overflow-hidden rounded-xl outline-2 outline outline-primary/20 dark:outline-primary shadow-lg">
            <VideoPlayer
              loop
              aspectRatio="400:308"
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
      <Divider />
      <TextReader className="backdrop-blur-sm">
        <div className="relative flex flex-col gap-y-8 md:flex-row md:gap-10 items-center justify-center w-full">
          <div className="prose text-justify max-w-xl prose-p:mb-0">
            <ReactMarkdown>
              {`**My Activities:** Your personal workspace allows you to manage all your website planning sessions. Start new website or landing page plans, or access your existing blueprints. For each plan, you can Review Questionnaire & Regenerate Blueprint, Delete, Download as PDF, View & Edit, or Request a Quote from Wavedropper. Easily sort your sessions by creation date and rename blueprints as needed. Note that regenerating a blueprint will overwrite the previous version completely, including any custom name you've assigned – so always save important blueprints as PDFs before regeneration.`}
            </ReactMarkdown>
          </div>

          <div className="w-full overflow-hidden rounded-xl outline-2 outline outline-primary/20 dark:outline-primary shadow-lg">
            <VideoPlayer
              loop
              aspectRatio="1584:1080"
              className="h-full w-full overflow-hidden"
              controls={false}
              muted={true}
              playing={true}
              url="/guide-videos/activities-guide.mp4"
            />
          </div>
        </div>
        <div className="max-w-5xl prose text-justify mx-auto mt-6">
          <ReactMarkdown>
            {`**Get Started:** Begin exploring DriftDraft today with your free credits upon sign-up. Each AI refinement costs 1 credit, while generating a complete blueprint requires 4 credits. When you're ready for more, simply click on your account name and navigate to "Subscription & Credits" to top up after setting up a payment method. Your strategic website plan is just a few clicks away – start building your digital foundation now.`}
          </ReactMarkdown>
        </div>
      </TextReader>
    </div>
  );
};

export default HomePageIntro;
