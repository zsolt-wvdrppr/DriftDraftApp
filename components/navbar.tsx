"use client";

import { useState } from "react";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/react";
import { Button, Kbd, Link, Input } from "@heroui/react";
import { link as linkStyles } from "@heroui/react";
import NextLink from "next/link";
import clsx from "clsx";
import { IconHistory } from "@tabler/icons-react";

import LogInOutBtn from "@/components/nav-layout/LogInOutBtn";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  GithubIcon,
  SearchIcon,
  Logo,
} from "@/components/icons";
import { useAuth } from "@/lib/AuthContext";
import { useRedirectAfterLogin } from "@/lib/hooks/useRedirectAfterLogin";
import logger from "@/lib/logger";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const redirectAfterLogin = useRedirectAfterLogin();

  const handleLogIn = () => {
    setIsMenuOpen(false);
    redirectAfterLogin();
  };

  // Modified handleLogout to close the menu
  const handleLogOut = async () => {
    logger.debug("isMenuOpen", isMenuOpen);
    setIsMenuOpen(false);
    logger.info("Menu closed");
    await logout(); // Ensure logout completes before menu closes
  };

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <NextUINavbar
      isMenuOpen={isMenuOpen}
      maxWidth="xl"
      position="sticky"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit ml-2">DriftDraft.App</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        {/*<NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>*/}
        <NavbarItem className="hidden md:flex">
          <Button
            as={Link}
            className="text-sm font-normal text-default-600 bg-default-200"
            href={siteConfig.links.activities}
            isExternal={false}
            startContent={<IconHistory className="text-highlightOrange" />}
            variant="flat"
          >
            My Activities
          </Button>
          <div className="actions flex items-center gap-4">
            {
              <LogInOutBtn
                className="text-lg"
                user={user}
                onLogIn={handleLogIn}
                onLogOut={handleLogOut}
              />
            }
          </div>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal aria-label="Github" href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle aria-label="Toggle navigation menu" />
      </NavbarContent>

      <NavbarMenu>
        {/*searchInput*/}
        <div className="mx-4 mt-2 flex flex-col gap-2 h-full">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href={item.href}
                size="lg"
                onPress={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          <NavbarItem className="md:hidden md:flex">
            {user && (
              <Button
                as={Link}
                className="text-lg absolute bottom-12 right-5 font-normal text-default-600 bg-default-200"
                href={siteConfig.links.activities}
                isExternal={false}
                startContent={<IconHistory className="text-highlightOrange" />}
                variant="flat"
              >
                My Activities
              </Button>
            )}
            <div className="actions flex flex-col-reverse items-center justify-center mt-12 gap-4">
              {
                <LogInOutBtn
                  className="text-lg"
                  labelClassName={
                    "text-sm absolute bottom-28 right-5 text-left"
                  }
                  user={user}
                  onLogIn={handleLogIn}
                  onLogOut={handleLogOut}
                />
              }
            </div>
          </NavbarItem>
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
