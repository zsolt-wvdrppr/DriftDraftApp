import ServiceSelector from "@/components/ServiceSelector";
import ServiceTitle from "@/components/ServiceTitle";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      
      <ServiceTitle />

      <ServiceSelector />

      <div className="mt-8">
        <pre className="text-center border-2 border-gray-300 p-4 rounded-lg">
          <span className="whitespace-break-spaces">
            Features Overview: Briefly outline benefits, such as “Guided Website Planning,” “Industry-Specific Recommendations,” and “Personalised Development Requirements.”
          </span>
        </pre>
      </div>
    </section>
  );
}
