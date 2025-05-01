import { title } from "@/components/primitives";

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-y-10">
      <h1 className={`${title()}`}>Pricing</h1>
      <p className="italic text-primary">{`Detailed pricing's coming soon`}</p>
      <div className="text-lg">
        <span>DriftDraft.App operates on a credit-based system:</span><br /><br />
        <ul className="list-disc list-inside text-left">
        <li><strong>AI Suggestion:</strong> 1 credit per AI suggestion.</li>
        <li><strong>Plan Generation:</strong> 4 credits per full plan.</li>
        </ul>
      </div>
    </div>
  );
}
