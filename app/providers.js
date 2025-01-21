"use client";

import * as React from "react";
import { HeroUIProvider as NextUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReCaptchaProvider } from "next-recaptcha-v3";

import { AuthProvider } from "@/lib/AuthContext";
import { SessionProvider } from "@/lib/SessionProvider";

export function Providers({ children, themeProps }) {

  const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const router = useRouter();

  return (
    <ReCaptchaProvider reCaptchaKey={reCaptchaKey}>
      <AuthProvider>
        <NextUIProvider navigate={router.push}>
          <NextThemesProvider {...themeProps}>
            <SessionProvider>
              {children}
            </SessionProvider>
          </NextThemesProvider>
        </NextUIProvider>
      </AuthProvider>
    </ReCaptchaProvider>
  );
}
