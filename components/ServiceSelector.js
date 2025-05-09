"use client";

import { Accordion, AccordionItem } from "@heroui/react";
import {
  IconPencil,
  IconRuler,
  IconComet,
  IconSettingsBolt,
} from "@tabler/icons-react";
import { Button } from "@heroui/react";
import { Link } from "@heroui/react";

import RestartSessionBtn from "@/components/planner-layout/layout/RestartSessionBtn";

const ServiceSelector = () => { 

  const defaultContent =
    "This feature is not available yet. Please check back later.";

  return (
    <div className="max-w-screen-sm w-full">
      <h2 className="text-3xl text-primary dark:text-accent font-semibold text-center pb-8">Select a tool</h2>
      <Accordion className="w-full px-2 sm:px-8" variant="splitted">
        <AccordionItem
          key="website-planner"
          aria-label="Website Planner"
          className="backdrop-blur-sm"
          indicator={<IconPencil />}
          startContent={<IconRuler className="w-9 h-9 text-accentMint" />}
          subtitle="Beta version available"
          title={<h3 className="font-semibold">Website Planner</h3>}
        >
          {
            "Create a strategic website blueprint. Our AI helps you to define your goals, target audience, content structure and more."
          }
          <div className="flex justify-end py-2 pl-4 mt-4">
           <RestartSessionBtn
              alt="Start planning"
              aria-label="Start Website Planner"
              className={"border-2 border-brandPink h-auto py-2 text-lg bg-brandPink text-white"}
              targetPathname={"website-planner"}
            >
              Start Planning
            </RestartSessionBtn>
          </div>
        </AccordionItem>
        <AccordionItem
          key="landing-page-planner"
          aria-label="Landing Page Planner"
          className="backdrop-blur-sm"
          indicator={<IconPencil />}
          startContent={<IconRuler className="w-9 h-9 text-accentMint" />}
          subtitle="Beta version available"
          title={<h3 className="font-semibold">Landing Page Planner</h3>}
        >
          {
            "Create a strategic landing page blueprint. Our AI helps you define your objectives, pinpoint your target audience, structure your content, and more."
          }
          <div className="flex justify-end py-2 pl-4 mt-4">
          <RestartSessionBtn
              alt="Start planning"
              aria-label="Start Website Planner"
              className={"border-2 border-brandPink h-auto py-2 text-lg bg-brandPink text-white"}
              targetPathname={"landingpage-planner"}
            >
              Start Planning
            </RestartSessionBtn>
          </div>
        </AccordionItem>
        <AccordionItem
          key="landing-page-writer"
          aria-label="Landing Page Writer"
          indicator={<IconPencil />}
          isDisabled={true}
          startContent={<IconComet className="w-9 h-9 text-accentMint" />}
          subtitle="Not yet available"
          title={<h3 className="font-semibold">Landing Page Writer</h3>}
        >
          {defaultContent}
        </AccordionItem>
        <AccordionItem
          key="website-generator"
          aria-label="Website Generator"
          indicator={<IconPencil />}
          isDisabled={true}
          startContent={
            <IconSettingsBolt className="w-9 h-9 text-accentMint" />
          }
          subtitle="Not yet available"
          title={<h3 className="font-semibold">Website Generator</h3>}
        >
          {defaultContent}
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ServiceSelector;
