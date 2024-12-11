'use client'

import { useState } from "react";
import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Kbd } from "@nextui-org/react";
import { Link } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { link as linkStyles } from "@nextui-org/react";
import NextLink from "next/link";
import clsx from "clsx";
import { IconPower } from "@tabler/icons-react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  GithubIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "@/components/icons";
import { useAuth } from "@/lib/AuthContext";
import { useRedirectAfterLogin } from "@/lib/hooks/useRedirectAfterLogin";


export const Navbar = () => {

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const redirectAfterLogin = useRedirectAfterLogin();

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
    <NextUINavbar isMenuOpen={isMenuOpen} maxWidth="xl" position="sticky" onMenuOpenChange={setIsMenuOpen}>
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
            <p className="font-bold text-inherit ml-2">wavedropper</p>
          </NextLink>
        </NavbarBrand>
        <ul className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium",
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
            startContent={<HeartFilledIcon className="text-danger" />}
            variant="flat"
          >
            My Activities
          </Button>
          <div className="actions flex items-center gap-4">
            {user ? (
              <>
                <p className="text-primary dark:text-slate-200 text-xs px-4 flex flex-col"><span>Logged in:</span><span className="">{user.email}</span></p>
                <Button as={Link} onClick={logout}>
                  Logout
                  <IconPower className="text-danger" />
                </Button>
              </>
            ) : (
              <Button onClick={redirectAfterLogin}>
                Login
                <IconPower className="text-success" />
              </Button>
            )}
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
        <div className="mx-4 mt-2 flex flex-col gap-2">
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
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
          <Button as={Link} onClick={logout}>
            Logout
          </Button>
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};
