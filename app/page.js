import ServiceSelector from "@/components/ServiceSelector";
import ServiceTitle from "@/components/ServiceTitle";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      
      <ServiceTitle />

      <ServiceSelector />

      <div className="mt-8">
        <pre className="text-justify md:text-center border-2 border-gray-300 p-4 rounded-lg">
          <span className="whitespace-break-spaces">
            {"DriftDraft is a strategic website and landing page planner that helps users outline their site's structure, user journey, and development requirements through guided questions and AI-driven recommendations."}
          </span>
        </pre>
      </div>
    </section>
  );
}
