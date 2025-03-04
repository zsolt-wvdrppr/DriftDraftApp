"use client";

import * as React from "react";
import { HeroUIProvider as NextUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReCaptchaProvider } from "next-recaptcha-v3";
import { LoadScript } from "@react-google-maps/api";

import { AuthProvider } from "@/lib/AuthContext";
import { SessionProvider } from "@/lib/SessionProvider";

export function Providers({ children, themeProps }) {
  const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const router = useRouter();

  const libraries = ["places"];

  return (
    <ReCaptchaProvider reCaptchaKey={reCaptchaKey} useRecaptchaNet={true}>
      <AuthProvider>
        <NextUIProvider navigate={router.push}>
          <NextThemesProvider {...themeProps}>
            <LoadScript
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              libraries={libraries}
            >
              <SessionProvider>{children}</SessionProvider>
            </LoadScript>
          </NextThemesProvider>
        </NextUIProvider>
      </AuthProvider>
    </ReCaptchaProvider>
  );
}
