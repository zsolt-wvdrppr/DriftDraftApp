import GoogleMapsProvider from "@/lib/GoogleMapsProvider";

import WebsiteWizardContainer from "../../components/websitePlanner/WebsiteWizardContainer";


export default function Start() {
  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <GoogleMapsProvider>
        <WebsiteWizardContainer position="top-right" />
      </GoogleMapsProvider>
    </section>
  );
}
