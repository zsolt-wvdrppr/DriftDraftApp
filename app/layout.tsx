import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";
import { Toaster } from "sonner";
import { Poppins } from "next/font/google";
import { Suspense } from "react";

import { siteConfig } from "@/config/site";
import { Navbar } from "@/components/navbar";
import WavedropperSignature from "@/components/WavedropperSignature";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
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
            <footer className="w-full flex items-center justify-center py-3">
              <WavedropperSignature />
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
