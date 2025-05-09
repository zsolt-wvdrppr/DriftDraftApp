import ServiceSelector from "@/components/ServiceSelector";
import HeroBackground from "@/components/hero-bg";
import ServiceTitle from "@/components/ServiceTitle";
import SignupCreditsNotice from "@/components/notifications/signup-credits";
import HomePageIntro from "@/components/home-page-intro";
import BetaNotice from "@/components/notifications/beta-notice";
import BlueprintBackground from "@/components/blueprint-bg";

export default function Home() {
  return (
    <>
      <BlueprintBackground />
      <section className="relative z-10 light dark:dark">
        <HeroBackground />
        <div className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
          <ServiceTitle />

          <BetaNotice />
          <SignupCreditsNotice />
        </div>
      </section>

      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <HomePageIntro />
      </section>

      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <ServiceSelector />
      </section>
    </>
  );
}

export async function generateMetadata() {
  return {
    title: `Website Blueprint with DriftDraft.App`,
    description: `DriftDraft is a strategic planner that transforms your business requirements into a comprehensive website or landing page blueprint.`,
    icons: {
      icon: '/favicon.ico',
    },
    openGraph: {
      type: 'website',
      locale: 'en_GB',
      url: 'https://driftdraft.app',
      siteName: 'DriftDraft.App',
      title: 'Website Blueprint with DriftDraft.App',
      description:
        'DriftDraft is a strategic planner that transforms your business requirements into a comprehensive website or landing page blueprint.',
      images: [
        {
          url: 'https://driftdraft.app/og-image.webp',
          width: 1200,
          height: 630,
          alt: 'The Website Blueprint Creator App',
        },
      ],
    },
  };
}