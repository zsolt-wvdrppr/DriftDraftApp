'use client';

import { Accordion, AccordionItem } from "@nextui-org/react";
import { IconPencil } from "@tabler/icons-react";

const ServiceSelector = () => {

    const defaultContent = "This is the default content for the accordion item.";

    return (
        <div>
            <Accordion variant="splitted" className="w-full">
                <AccordionItem key="anchor" aria-label="Anchor" indicator={<IconPencil />} title="Website Planner">
                    {defaultContent}
                </AccordionItem>
                <AccordionItem key="moon" aria-label="Moon" indicator={<IconPencil />} title="Landing Page Writer">
                    {defaultContent}
                </AccordionItem>
                <AccordionItem key="sun" aria-label="Sun" indicator={<IconPencil />} title="Website Generator">
                    {defaultContent}
                </AccordionItem>
            </Accordion>
        </div>
    )
}

export default ServiceSelector