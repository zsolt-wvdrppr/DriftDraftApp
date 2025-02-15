'use client';

import { Accordion, AccordionItem } from "@heroui/react";
import { IconPencil, IconRuler, IconComet, IconSettingsBolt } from "@tabler/icons-react";
import { Button } from "@heroui/react";
import { Link } from "@heroui/react";

const ServiceSelector = () => {

    const defaultContent = "This feature is not available yet. Please check back later.";
    const urls = {
        websitePlanner: "/website-planner?step=0",
        landingPagePlanner: "/landingpage-planner",
        landingPageWriter: "/landing-page-writer",
        websiteGenerator: "/website-generator"
    }

    return (
        <div className="max-w-screen-sm w-screen">
            <h2 className="text-2xl font-semibold text-center p-8">Select a tool</h2>
            <Accordion className="w-full px-8" variant="splitted">
                <AccordionItem
                    key="website-planner"
                    aria-label="Website Planner"
                    indicator={<IconPencil />}
                    startContent={<IconRuler className="w-9 h-9 text-accentMint" />}
                    subtitle="Beta version available"
                    title={<h3 className="font-semibold">Website Planner</h3>}
                >
                    {"Create a strategic website blueprint. Our AI helps you to define your goals, target audience, content structure and more."}
                    <div className="flex justify-end py-2 pl-4 mt-4">
                        <Button
                            alt="Start planning"
                            aria-label="Start Website Planner"
                            as={Link}
                            color="primary"
                            href={urls.websitePlanner}
                            isExternal={false}
                            variant="shadow"
                        >
                            Start Your Website Plan
                        </Button>
                    </div>
                </AccordionItem>
                <AccordionItem
                    key="landing-page-planner"
                    aria-label="Landing Page Planner"
                    indicator={<IconPencil />}
                    startContent={<IconRuler className="w-9 h-9 text-accentMint" />}
                    subtitle="Beta version available"
                    title={<h3 className="font-semibold">Landing Page Planner</h3>}
                >
                    {"Create a strategic landing page blueprint. Our AI helps you define your objectives, pinpoint your target audience, structure your content, and more."}
                    <div className="flex justify-end py-2 pl-4 mt-4">
                        <Button
                            alt="Start planning"
                            aria-label="Start Landing Page Planner"
                            as={Link}
                            color="primary"
                            href={urls.landingPagePlanner}
                            isExternal={false}
                            variant="shadow"
                        >
                            Start Your Landing Page
                        </Button>
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
                    startContent={<IconSettingsBolt className="w-9 h-9 text-accentMint" />}
                    subtitle="Not yet available"
                    title={<h3 className="font-semibold">Website Generator</h3>}
                >
                    {defaultContent}
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default ServiceSelector