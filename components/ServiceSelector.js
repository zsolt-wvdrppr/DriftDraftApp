'use client';

import { Accordion, AccordionItem } from "@nextui-org/react";
import { IconPencil, IconRuler, IconComet, IconSettingsBolt } from "@tabler/icons-react";
import { Button } from "@nextui-org/react";
import Link from "next/link";

const ServiceSelector = () => {

    const defaultContent = "This feature is not available yet. Please check back later.";

    return (
        <div className="max-w-screen-sm w-screen">
            <h2 className="text-2xl font-semibold text-center p-8">Select a tool</h2>
            <Accordion variant="splitted" className="w-full px-8">
                <AccordionItem
                    key="anchor"
                    aria-label="Anchor"
                    indicator={<IconPencil />}
                    title={<h3 className="font-semibold">Website Planner</h3>}
                    startContent={<IconRuler className="w-9 h-9 text-accentMint" />}
                    subtitle="Beta version available"
                >
                    {"Create a strategic website blueprint. Our AI helps you to define your goals, target audience, content structure and more."}
                    <div className="flex justify-end py-2 pl-4 mt-4">
                        <Link href="/website-planner" alt="Start planning">
                            <Button color="primary" variant="shadow">Start Your Website Plan</Button>
                        </Link>
                    </div>
                </AccordionItem>
                <AccordionItem
                    key="moon"
                    aria-label="Moon"
                    indicator={<IconPencil />}
                    title={<h3 className="font-semibold">Landing Page Writer</h3>}
                    startContent={<IconComet className="w-9 h-9 text-accentMint" />}
                    subtitle="Not yet available"
                    isDisabled={true}
                >
                    {defaultContent}
                </AccordionItem>
                <AccordionItem
                    key="sun"
                    aria-label="Sun"
                    indicator={<IconPencil />}
                    title={<h3 className="font-semibold">Website Generator</h3>}
                    startContent={<IconSettingsBolt className="w-9 h-9 text-accentMint" />}
                    subtitle="Not yet available"
                    isDisabled={true}
                >
                    {defaultContent}
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default ServiceSelector