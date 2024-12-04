import { Link } from "@nextui-org/link";
import { Snippet } from "@nextui-org/snippet";
import { title, subtitle } from "@/components/primitives";
import { Button } from "@nextui-org/button";
import ServiceSelector from "@/components/ServiceSelector";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="max-w-xl text-center justify-center mb-8">
        <span className={`${title({ color: "violet" })} pb-4`}>Create a&nbsp;</span>
        <br />
        <span className={title()}>Strategic Website&nbsp;</span>
        <br />
        <span className={`${title({ color: "blue" })}`}>Blueprint&nbsp;</span>
      </div>

      <div className="flex gap-3">
        <Link href="/website-planner" alt="Start planning">
          <Button color="primary" variant="shadow">Start Your Website Plan</Button>
        </Link>
      </div>

      <div className="mt-8">
        <ServiceSelector />
      </div>

      <div className="mt-8">
        <Snippet hideCopyButton hideSymbol variant="bordered" className="text-center">
          <span className="whitespace-break-spaces">
            Features Overview: Briefly outline benefits, such as “Guided Website Planning,” “Industry-Specific Recommendations,” and “Personalised Development Requirements.”
          </span>
        </Snippet>
      </div>
    </section>
  );
}
