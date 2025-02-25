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
import { Kbd, Link, Input } from "@heroui/react";
import { link as linkStyles } from "@heroui/react";
import NextLink from "next/link";
import clsx from "clsx";

import LogInOutBtn, { LogInBtn } from "@/components/nav-layout/LogInOutBtn";
import MyActivitiesBtn from "@/components/nav-layout/MyActivitiesBtn";
import AccountBtn from "@/components/nav-layout/AccountBtn";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon, Logo } from "@/components/icons";
import { useAuth } from "@/lib/AuthContext";
import { useRedirectAfterLogin } from "@/lib/hooks/useRedirectAfterLogin";
import logger from "@/lib/logger";
import { useReferral } from "@/lib/hooks/useReferral";
import ConfirmationModal from "@/components/confirmation-modal";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const redirectAfterLogin = useRedirectAfterLogin();

  const { isReferralModalOpen, setReferralUser, removeReferralParam, referralName } = useReferral();

  const handleLogIn = () => {
    setIsMenuOpen(false);
    redirectAfterLogin();
  };

  // Modified handleLogout to close the menu
  const handleLogOut = async () => {
    logger.debug("isMenuOpen", isMenuOpen);
    setIsMenuOpen(false);
    logger.info("Menu closed");
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
          <NextLink
            aria-label="Home"
            className="flex justify-start items-center gap-1"
            href="/"
            onClick={() => setIsMenuOpen(false)}
          >
            <Logo />
            <p className="font-bold text-inherit ml-2">DriftDraft.App</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                aria-label={item.label}
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
        className="hidden sm:flex basis-1/5 sm:basis-full gap-10"
        justify="end"
      >
        <NavbarItem className="hidden md:flex gap-2 px-4">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          {user && (
            <MyActivitiesBtn
              aria-label="My Activities"
              className={"rounded-t-none bg-default-200"}
              label={"My Activities"}
              onPress={() => setIsMenuOpen(false)}
            />
          )}
        </NavbarItem>
        {user && (
          <NavbarItem className="hidden md:flex">
            <AccountBtn aria-label="Account settings" user={user} />
          </NavbarItem>
        )}
        <NavbarItem className="hidden md:flex actions items-center gap-4">
          <LogInOutBtn
            aria-label="Log in or out"
            className="bg-default-200 rounded-t-none hover:scale-105"
            user={user}
            onLogIn={handleLogIn}
            onLogOut={handleLogOut}
          />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="md:hidden basis-1 pl-4 flex" justify="end">
        <div className="flex w-full gap-4 justify-evenly items-center pr-4">
          <NavbarItem className="flex gap-4 items-center">
            <ThemeSwitch aria-label="Theme Switch" className="h-10 md:hidden" />
          </NavbarItem>
          {/*user && (
            <NavbarItem className="flex gap-4 items-center">
              <AccountBtn
                noLabel={true}
                user={user}
                onPress={() => setIsMenuOpen(false)}
              />
            </NavbarItem>
          )*/}
          <NavbarItem className="flex gap-4 items-center">
            {user && (
              <MyActivitiesBtn
                aria-label="My Activities"
                className={"p-0 min-w-0"}
                noLabel={true}
                onPress={() => setIsMenuOpen(false)}
              />
            )}
            {!user && (
              <LogInBtn
                aria-label="Log in"
                className="text-lg p-0 min-w-0"
                noTitle={true}
                onChange={handleLogIn}
              />
            )}
          </NavbarItem>
        </div>
        <NavbarMenuToggle
          aria-label="Toggle navigation menu"
          className="pl-5 pr-8 -m-5"
        />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2 h-full">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                aria-label="Menu item"
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
          <NavbarItem className="md:hidden">
            {user && (
              <div className="absolute bottom-32 right-5 flex flex-col gap-4">
                <MyActivitiesBtn
                  aria-label="My Activities"
                  className={
                    "bg-default-200"
                  }
                  label={"My Activities"}
                  onPress={() => setIsMenuOpen(false)}
                />
                <AccountBtn
                  aria-label="Account settings"
                  className={
                    "flex justify-between bg-default-200 py-2 px-4 rounded-xl w-full"
                  }
                  label={"Account"}
                  labelClassName=""
                  user={user}
                  onPress={() => setIsMenuOpen(false)}
                />
              </div>
            )}
            <div className="actions flex flex-col-reverse items-center justify-center mt-12 gap-4">
              {
                <LogInOutBtn
                  aria-label="Log in or out"
                  labelClassName={
                    "text-sm absolute bottom-40 right-5 text-left"
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
      {isReferralModalOpen && (
        <ConfirmationModal
          isOpen={isReferralModalOpen}
          message={modalMessage(referralName?.toString() || "")}
          placement="center"
          title="Confirm Referral"
          onClose={() => {
            removeReferralParam(); // ✅ Remove referral param if user cancels
          }}
          onConfirm={() => {
            setReferralUser(); // ✅ Proceed with setting the referral
          }}
        />
      )}
    </NextUINavbar>
  );
};

const modalMessage = (referralName : string) => {
  return (

      <span>
        {`Do you want to set `}<strong>{referralName}</strong>{` as your referral agent? If they exist in our database, we will attempt to assign them. They will be able to view your AI-generated plans but won’t be able to edit them. Only confirm if you intend to proceed and have direct contact with `}<strong>{referralName}</strong>.
      </span>

  );
}
