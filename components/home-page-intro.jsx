"use client";

import VideoPlayer from "@/components/video-player/video-player";
import ReactMarkdown from "react-markdown";
import TextReader from "@/components/text-reader";
import { Divider } from "@heroui/react";
import { Link } from "@heroui/react";

const HomePageIntro = () => {
  return (
    <div className="p-2.5 w-full flex flex-col items-center justify-center gap-4 gap-y-8 md:gap-8 max-w-5xl">
      <TextReader className="backdrop-blur-sm">
        <div className="relative flex flex-col gap-y-8 md:flex-row md:gap-10 items-center justify-center w-full">
          <div className="max-w-xl prose prose-h2:font-semibold text-justify md:text-lg">
            <ReactMarkdown>
              {`## Why do you need a Website Blueprint?
If you have a business, non-profit, or any organisation, a website blueprint helps you easily build a **professional online presence** — no tech knowledge required. Like a clear map, it shows exactly what your website should say, how it should look, and guides your visitors smoothly, **avoiding common pitfalls** like confusing designs, pages that don't lead customers anywhere, or security risks.`}
            </ReactMarkdown>
          </div>

          <div className="w-full overflow-hidden rounded-xl">
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
        <div className="max-w-5xl prose text-justify mx-auto mt-6 md:text-lg">
          <ReactMarkdown>
            {`Whether you're managing your own website or creating one for a client, a blueprint ensures developers know exactly what you want. You can download it as a PDF at no cost, refine it anytime, and confidently hand it over, knowing nothing critical is missed.`}
          </ReactMarkdown>
        </div>
      </TextReader>
      <Divider />
      <TextReader
        className="backdrop-blur-sm"
        placement="justify-start md:justify-end w-full"
      >
        <div className="relative flex flex-col gap-y-8 md:flex-row-reverse md:gap-10 items-center justify-center w-full">
          <div className="prose text-justify max-w-xl prose-p:mb-0 prose-h2:font-semibold md:text-lg">
            <ReactMarkdown>
              {`## Discover Your Competition
Enter your location and instantly discover who you're competing with. Our AI identifies local businesses in your market, giving you a quick, clear **view of your competitive landscape**. Easily copy their website URLs with one click, saving you time and effort.`}
            </ReactMarkdown>
          </div>

          <div className="w-full min-w-full md:min-w-96 overflow-hidden rounded-xl ">
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
          <div className="prose text-justify max-w-xl prose-p:mb-0 prose-h2:font-semibold md:text-lg">
            <ReactMarkdown>
              {`## Domain Discovery
Instantly find SEO-friendly domain names tailored to your business. Our AI checks availability, suggests smart alternatives if your favourites are taken, and simplifies your search for the perfect brand domain.`}
            </ReactMarkdown>
          </div>

          <div className="w-full min-w-full md:min-w-96 overflow-hidden rounded-xl ">
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
          <div className="prose text-justify max-w-xl prose-p:mb-0 prose-h2:font-semibold md:text-lg">
            <ReactMarkdown>
              {`## Blueprint Generation
After completing the questionnaire, our AI generates your website blueprint, ready immediately to view or copy, and accessible anytime via "My Activities". Your contact details, if provided, are used only if you request a quote from Wavedropper and will never be shared without your consent.`}
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

          <div className="w-full overflow-hidden rounded-xl ">
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
        <div className="max-w-5xl prose text-justify mx-auto mt-6 md:text-lg">
          <ReactMarkdown>
            {`The blueprint is a starting point only; accuracy depends on the clarity of your answers. We don't guarantee completeness or suitability for specific needs, so always review professionally before implementation. Using this tool doesn't replace professional website development or strategic advice.`}
          </ReactMarkdown>
        </div>
      </TextReader>
      <Divider />
      <TextReader className="backdrop-blur-sm">
        <div className="relative flex flex-col gap-y-8 md:flex-row md:gap-10 items-center justify-center w-full">
          <div className="prose text-justify max-w-xl prose-p:mb-0 prose-h2:font-semibold md:text-lg">
            <ReactMarkdown>
              {`## Managing Your Plans
"My Activities" is your workspace to start, review, edit, download, or delete your website blueprints. You can regenerate plans at any time—just note this will overwrite the previous version, so save important blueprints as PDFs first. Easily rename and organise plans by date.`}
            </ReactMarkdown>
          </div>

          <div className="w-full overflow-hidden rounded-xl ">
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
        <div className="max-w-5xl prose text-justify mx-auto mt-6 prose-h2:font-semibold md:text-lg">
          <ReactMarkdown>
            {`Sign up to receive free credits and start building your blueprint right away. Each AI refinement costs 1 credit; a complete blueprint is 4 credits. Need more? Click your account name, go to "Subscription & Credits", and top up easily. Start crafting your digital strategy today.`}
          </ReactMarkdown>
        </div>
      </TextReader>
    </div>
  );
};

export default HomePageIntro;
