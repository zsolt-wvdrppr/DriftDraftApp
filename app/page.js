import { Snippet } from "@nextui-org/react";

import ServiceSelector from "@/components/ServiceSelector";
import ServiceTitle from "@/components/ServiceTitle";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      
      <ServiceTitle />

      <ServiceSelector />

      <div className="mt-8">
        <Snippet hideCopyButton hideSymbol className="text-center" variant="bordered">
          <span className="whitespace-break-spaces">
            Features Overview: Briefly outline benefits, such as “Guided Website Planning,” “Industry-Specific Recommendations,” and “Personalised Development Requirements.”
          </span>
        </Snippet>
      </div>
    </section>
  );
}
