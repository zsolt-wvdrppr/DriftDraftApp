import ServiceSelector from "@/components/ServiceSelector";
import HeroBackground from "@/components/hero-bg";
import ServiceTitle from "@/components/ServiceTitle";
import SignupCreditsNotice from "@/components/notifications/signup-credits";
import HomePageIntro from "@/components/home-page-intro";
import BlueprintBackground from "@/components/blueprint-bg";
import WaasPromo from "@/components/notifications/waas-promo";
import HeroIdentity from "@/components/notifications/hero-identity";
import IntroEffect from "@/components/intro-effect";

export default function Home() {
  return (
    <>
      <BlueprintBackground />
      <section className="relative z-10 light dark:dark select-none">
        <HeroBackground />
        <div className="flex flex-col items-center justify-center gap-1 md:gap-4 py-16 min-h-screen md:min-h-fit md:py-16">
          <ServiceTitle />
          <IntroEffect type="slideLeft">
            <SignupCreditsNotice />
          </IntroEffect>
        </div>
      </section>

      <section className="flex flex-col items-center justify-center gap-10 py-8 md:py-10 mt-4 select-none">
        <IntroEffect type="slideRight">
          <HeroIdentity />
        </IntroEffect>
        <HomePageIntro />
      </section>

      <section
        className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 select-none"
        id="tool-selector"
      >
        <WaasPromo />
        <ServiceSelector />
      </section>
    </>
  );
}

export async function generateMetadata() {
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "https://driftdraft.app"
    ),
    title: `Your future website starts here`,
    description: `DriftDraft.App is a strategic planner that transforms your business requirements into a comprehensive website or landing page blueprint.`,
    icons: {
      icon: "/favicon.ico",
    },
    openGraph: {
      type: "website",
      locale: "en_GB",
      url: "https://driftdraft.app",
      siteName: "DriftDraft.App",
      title: "Your future website starts here",
      description:
        "DriftDraft.App is a strategic planner that transforms your business requirements into a comprehensive website or landing page blueprint.",
      images: [
        {
          url: "/og-image.webp", // Remove the full URL, just use relative path
          width: 1200,
          height: 630,
          alt: "The Website Blueprint Creator App",
        },
      ],
    },
  };
}
