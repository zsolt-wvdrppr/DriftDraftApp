"use client";

import * as React from "react";
import { HeroUIProvider as NextUIProvider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReCaptchaProvider } from "next-recaptcha-v3";

import { AuthProvider } from "@/lib/AuthContext";
import { SessionProvider } from "@/lib/SessionProvider";
import GoogleMapsProvider from "@/lib/GoogleMapsProvider";

export function Providers({ children, themeProps }) {
  const reCaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a static version during SSR
    return (
      <ReCaptchaProvider reCaptchaKey={reCaptchaKey} useRecaptchaNet={true}>
        <AuthProvider>
          <NextUIProvider navigate={router.push}>{children}</NextUIProvider>
        </AuthProvider>
      </ReCaptchaProvider>
    );
  }

  return (
    <ReCaptchaProvider reCaptchaKey={reCaptchaKey} useRecaptchaNet={true}>
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
