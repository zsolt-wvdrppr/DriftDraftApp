import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Toaster } from "sonner";
import { Poppins } from "next/font/google";
import { Suspense } from "react";

import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/navbar";
import Footer from "@/components/footer";

import { Providers } from "./providers";
import CookieConsent from "@/components/cookie-consent";
import { GoogleTagManager } from "@next/third-parties/google";

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

// This is a client-side script that will run before GTM initializes
export function generateStaticParams() {
  return [
    {
      script: [
        {
          type: "text/javascript",
          innerHTML: `
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            'consent': 'default',
            'analytics_storage': 'denied',
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied'
          });
        `,
        },
      ],
    },
  ];
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        {/* Inline script to set default consent before any tags load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
              'consent': 'default',
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied'
            });
          `,
          }}
        />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background antialiased",
          poppins.className
        )}
      >
        <CookieConsent />
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
        </Providers>
        <GoogleTagManager gtmId="GTM-MRQ8RLMC" />
      </body>
    </html>
  );
}
