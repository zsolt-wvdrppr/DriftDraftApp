"use strict";
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export default function ServiceSuspendedModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Allow access to blog routes; block everything else
  if (pathname && pathname.startsWith("/blog" )) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background p-4 h-screen w-screen overflow-hidden">
      <div className="w-full max-w-md rounded-2xl border border-default-200 bg-background/95 p-8 shadow-2xl backdrop-blur-sm dark:border-default-100">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight">
              Service Paused
            </h2>
            <p className="text-default-500">
              We have temporarily paused our services until further notice. Access to the platform is currently restricted.
            </p>
          </div>

          <div className="w-full space-y-4 pt-2">
            <Link href="/blog" className="block w-full">
              <button className="w-full rounded-lg bg-foreground text-background px-4 py-3 text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
                Visit Our Blog
              </button>
            </Link>
            <p className="text-xs text-default-400">
              You can still access our blog for news and updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
