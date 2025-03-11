import ServiceSelector from "@/components/ServiceSelector";
import ServiceTitle from "@/components/ServiceTitle";

export default function Home() {
  return (
    <section className="light dark:dark flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <ServiceTitle />

      <div class="mx-2 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100 p-4 rounded-xl text-sm max-w-xl self-center mt-6">
        <p class="font-semibold">Beta Notice</p>
        <p>
          {`This app is currently in beta, so you might encounter minor bugs or
          unfinished features. We’re working hard to improve it!`}
        </p>
        <p class="mt-2">
          {`Spotted something odd? Feel free to use the feedback form — it’ll automatically attach a screenshot of the page you’re on.`}
        </p>
      </div>

      <ServiceSelector />

      <div className="mt-8">
        <pre className="text-justify md:text-center border-2 border-gray-300 p-4 mx-2 rounded-lg">
          <span className="whitespace-break-spaces">
            {
              "DriftDraft is a strategic website and landing page planner that helps users outline their site's structure, user journey, and development requirements through guided questions and AI-driven recommendations."
            }
          </span>
        </pre>
      </div>
    </section>
  );
}
