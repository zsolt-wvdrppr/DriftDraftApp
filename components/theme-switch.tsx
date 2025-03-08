"use client";

import { FC, useEffect, useState } from "react";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { SwitchProps, useSwitch } from "@heroui/react";
import { useTheme } from "next-themes";
import { useIsSSR } from "@react-aria/ssr";
import clsx from "clsx";

import logger from "@/lib/logger";
import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";

export interface ThemeSwitchProps {
  className?: string;
  classNames?: SwitchProps["classNames"];
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({
  className,
  classNames,
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isSSR = useIsSSR();
  
  // Initialize with null and set it after theme resolves
  const [themeLogo, setThemeLogo] = useState<string | null>(null);

  const onChange = () => {
    resolvedTheme === "light" ? setTheme("dark") : setTheme("light");
  };

  // Effect to update the theme logo based on the current theme
  useEffect(() => {
    // Use resolvedTheme instead of theme for more reliable detection
    // resolvedTheme will be the actual theme currently showing
    if (!resolvedTheme) return;
    
    let _themeLogo = "";

    if (resolvedTheme === "light") {
      _themeLogo = "moon";
    } else {
      _themeLogo = "sun";
    }

    setThemeLogo(_themeLogo);

    logger.debug("ThemeSwitch: resolvedTheme", resolvedTheme);
    logger.debug("ThemeSwitch: themeLogo", _themeLogo);

  }, [resolvedTheme]);

  const {
    Component,
    slots,
    isSelected,
    getBaseProps,
    getInputProps,
    getWrapperProps,
  } = useSwitch({
    isSelected: resolvedTheme === "light" || isSSR,
    "aria-label": `Switch to ${resolvedTheme === "light" || isSSR ? "dark" : "light"} mode`,
    onChange,
  });

  return (
    <Component
      {...getBaseProps({
        className: clsx(
          "px-px transition-opacity hover:opacity-80 cursor-pointer",
          className,
          classNames?.base
        ),
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <div
        {...getWrapperProps()}
        className={slots.wrapper({
          class: clsx(
            [
              "w-auto h-auto",
              "bg-transparent",
              "rounded-lg",
              "flex items-center justify-center",
              "group-data-[selected=true]:bg-transparent",
              "!text-default-500",
              "pt-px",
              "px-0",
              "mx-0",
            ],
            classNames?.wrapper
          ),
        })}
      >
        {themeLogo === "sun" && (
          <SunFilledIcon size={22} />
        )}
        {themeLogo === "moon" && (
          <MoonFilledIcon size={22} />
        )}
      </div>
    </Component>
  );
};