// File: app/layout.tsx (updated)
import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Toaster } from "sonner";
import { Poppins } from "next/font/google";
import { Suspense } from "react";
import { GoogleTagManager } from "@next/third-parties/google";

import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";
import CookieConsent from "@/components/cookie-consent";

import { Providers } from "./providers";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
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
            <Suspense fallback={<div>Loading navbar...</div>}>
              <Navbar />
            </Suspense>
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