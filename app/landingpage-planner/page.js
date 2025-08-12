import GoogleMapsProvider from "@/lib/GoogleMapsProvider";
import LandingWizardContainer from "@/components/landingPlanner/LandingWizardContainer";

export default function Start() {
  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <GoogleMapsProvider>
        <LandingWizardContainer position="top-right" />
      </GoogleMapsProvider>
    </section>
  );
}
