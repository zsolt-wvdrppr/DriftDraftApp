import Pricing from "@/components/pricing";

export default function PricingPage() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <Pricing />
    </section>
  );
}

export async function generateMetadata() {
  return {
    title: `Your future website starts here`,
    description: `DriftDraft.App is a strategic planner that transforms your business requirements into a comprehensive website or landing page blueprint.`,
    icons: {
      icon: '/favicon.ico',
    },
    openGraph: {
      type: 'website',
      locale: 'en_GB',
      url: 'https://driftdraft.app',
      siteName: 'DriftDraft.App',
      title: 'Your future website starts here',
      description:
        'DriftDraft.App is a strategic planner that transforms your business requirements into a comprehensive website or landing page blueprint.',
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