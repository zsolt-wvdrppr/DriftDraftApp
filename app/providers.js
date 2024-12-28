"use client";

import * as React from "react";
import { NextUIProvider } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";

import { AuthProvider } from "@/lib/AuthContext";
import { SessionProvider } from "@/lib/SessionProvider";

export function Providers({ children, themeProps }) {
  const router = useRouter();

  return (
    <AuthProvider>
      <NextUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>
          <SessionProvider>
          {children}
          </SessionProvider>
        </NextThemesProvider>
      </NextUIProvider>
    </AuthProvider>
  );
}
