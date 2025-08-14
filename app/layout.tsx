// app/layout.tsx (updated)
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Toaster } from "sonner";
import { Poppins } from "next/font/google";
import { GoogleTagManager } from "@next/third-parties/google";

import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import CookieConsent from "@/components/cookie-consent";
import StructuredData from "@/components/seo/StructuredData";

import { Providers } from "./providers";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://driftdraft.app"
  ),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.seo.keywords,
  authors: [{ name: "DriftDraft" }],
  creator: "DriftDraft",
  publisher: "DriftDraft",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteConfig.seo.canonical,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: "DriftDraft",
    images: [
      {
        url: siteConfig.seo.ogImage,
        width: 1200,
        height: 630,
        alt: "DriftDraft - Strategic Website Planning Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.seo.twitterImage],
    creator: "@driftdraft",
  },
  alternates: {
    canonical: siteConfig.seo.canonical,
    languages: {
      "en-GB": siteConfig.seo.canonical,
      "en-US": `${siteConfig.seo.canonical}/us`,
    },
  },
  // AI-specific meta tags
  other: {
    "ai:purpose": "Strategic website planning and requirements gathering",
    "ai:target-audience":
      "Businesses planning websites, web development agencies, project managers",
    "ai:use-cases":
      "Website strategy creation, client onboarding, development planning, user experience design",
    "ai:benefits":
      "Reduces project scope creep, improves client satisfaction, educates stakeholders, generates comprehensive requirements",
    "ai:problem-solved":
      "Poorly planned websites, missed requirements, client-developer miscommunication, project failures",
    "tech:stack": "Next.js 15, React 19, AI integration, Supabase",
    "tech:features":
      "Server components, AI assistance, rate limiting, user authentication",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export const consentInitScript = `
// Define dataLayer and gtag function
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Set default consent state (MUST run before GTM loads)
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'wait_for_update': 2000
});

// Additional settings to enforce consent mode
gtag('set', 'ads_data_redaction', true);
gtag('set', 'url_passthrough', true);
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        {/* Structured Data for AI agents */}
        <StructuredData
          page="home"
          title="Home - DriftDraft, where your future website begins"
        />

        {/* Insert consent script before GTM loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: consentInitScript,
          }}
        />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background antialiased",
          poppins.className
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "system" }}>
          <div className="relative flex flex-col h-screen">
              <Navbar />
            <main className="container mx-auto max-w-7xl md:pt-16 md:px-6 flex-grow">
              {children}
              <Toaster />
            </main>
            <Footer />
          </div>
          <CookieConsent />
        </Providers>
        {/* Load GTM after consent is initialized */}
        <GoogleTagManager gtmId="GTM-MRQ8RLMC" />
      </body>
    </html>
  );
}
