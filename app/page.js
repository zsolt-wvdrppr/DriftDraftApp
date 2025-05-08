import ServiceSelector from "@/components/ServiceSelector";
import HeroBackground from "@/components/hero-bg";
import ServiceTitle from "@/components/ServiceTitle";
import SignupCreditsNotice from "@/components/notifications/signup-credits";
import HomePageIntro from "@/components/home-page-intro";
import BetaNotice from "@/components/notifications/beta-notice";

export default function Home() {
  return (
    <>
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
