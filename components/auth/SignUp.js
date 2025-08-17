"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Checkbox, Link, Divider } from "@heroui/react";
import { IconLock } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Icon } from "@iconify-icon/react";

import { supabase } from "@/lib/supabaseClient";
import logger from "@/lib/logger";
import { useAuth } from "@/lib/AuthContext";
import { useToastSound } from "@/lib/hooks/useToastSound";

export default function SignUp() {
  const [name, setName] = useState(""); // State for full name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState(null);
  const { user } = useAuth(); // Access user state
  const router = useRouter();
  const searchParams = useSearchParams();
  const [referral, setReferral] = useState(null);
  const [redirect, setRedirect] = useState(null);
  const [mounted, setMounted] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const play = useToastSound();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      const urlRedirect = searchParams.get("redirect");
      const urlReferral = searchParams.get("ref");

      setReferral(urlReferral);

      if (urlReferral) {
        setRedirect(`${urlRedirect}?ref=${urlReferral}`);
      } else if (urlRedirect) {
        setRedirect(urlRedirect);
      }
    }
  }, [mounted, searchParams]);

  useEffect(() => {
    if (user && referral !== undefined) {
      // ✅ Ensure referral has been resolved
      const targetUrl = `${redirect}${referral ? `?ref=${referral}` : ""}`;

      router.replace(targetUrl);
    }
  }, [user, referral, redirect]);

  useEffect(() => {
    // Display error and message in toast
    if (error) {
      toast.error(error, {
        duration: 20000,
        position: "top-center",
        closeButton: true,
        classNames: { toast: "text-danger", title: "text-md font-semibold" },
        onOpen: play(),
      });
    }
    if (message) {
      toast.success(message, {
        duration: 20000,
        position: "top-center",
        closeButton: true,
        classNames: { toast: "text-green-700", title: "text-md font-semibold" },
        onOpen: play(),
      });
    }
  }, [error, message]);

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setError(null);

    try {
      const redirectPath =
        new URLSearchParams(window.location.search).get("redirect") ||
        "/account";

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}${redirectPath}`,
        },
      });

      if (error) throw error;

      logger.info("Google login initiated");
    } catch (err) {
      logger.error("Error during social login:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    try {
      const redirectParam = new URLSearchParams(window.location.search).get(
        "redirect"
      );
      const redirectPath =
        redirectParam ? `?redirect=${redirectParam}` : "/activities";

      logger.info(`${window.location.origin}${redirectPath}`);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${redirectPath}`,
          data: {
            full_name: name,
            referral_name: referral,
          },
        },
      });

      if (error) {
        logger.error("Signup error details:", error);

        // Handle password-related errors FIRST
        if (
          error.message.includes("Password should be at least") ||
          error.message.includes("Password is known to be weak")
        ) {
          throw new Error(
            "Password must be at least 6 characters long and not easily guessable. Please choose a stronger password."
          );
        }

        // Handle email validation errors
        if (error.message.includes("Invalid email")) {
          throw new Error("Please enter a valid email address.");
        }

        // Handle user already exists errors
        if (
          error.message.includes("User already registered") ||
          error.message.includes("already been registered")
        ) {
          throw new Error(
            `This email address is already registered. Please try logging in instead.`
          );
        }

        // For 422 errors that aren't password-related, might be existing user
        if (error.status === 422 && !error.message.includes("Password")) {
          throw new Error(
            `This email address is already registered. Please try logging in instead.`
          );
        }

        // Generic fallback - show the actual error message
        throw new Error(error.message);
      }

      // Check if this is an existing user (Supabase sometimes returns user with no identities)
      if (
        data.user &&
        data.user.identities &&
        data.user.identities.length === 0
      ) {
        logger.info("User already exists - no new identity created");
        throw new Error(
          `This email address is already registered. Please try logging in instead.`
        );
      }

      // Success case
      setMessage("Check your email to confirm your account.");
      setEmail("");
      setPassword("");
      setName("");

      logger.info("Email signup completed");
    } catch (err) {
      logger.error("Error during email signup:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6">
        <p className="pb-4 text-left text-3xl font-semibold flex justify-between">
          Sign Up
          <span aria-label="emoji" className="ml-2" role="img">
            <IconLock size={24} />
          </span>
        </p>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            handleSignUp();
          }}
        >
          {/*(!error && message) && <p className="text-green-700 dark:text-green-500">{message}</p>} {/* Show success message */}
          {/*error && <p className="text-danger">{error}</p>} {/* Show error */}
          <Input
            isRequired
            label="Full Name"
            labelPlacement="outside-top"
            name="name"
            placeholder="Enter your full name"
            type="text"
            value={name}
            variant="bordered"
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            isRequired
            label="Email"
            labelPlacement="outside-top"
            name="email"
            placeholder="Enter your email"
            type="email"
            value={email}
            variant="bordered"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            isRequired
            classNames={{
              inputWrapper: "pr-0",
            }}
            endContent={
              <Button
                className="min-w-0"
                type="button"
                onPress={toggleVisibility}
              >
                {isVisible ?
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-closed-linear"
                  />
                : <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-bold"
                  />
                }
              </Button>
            }
            label="Password"
            labelPlacement="outside-top"
            name="password"
            placeholder="Enter your password"
            type={isVisible ? "text" : "password"}
            value={password}
            variant="bordered"
            onChange={(e) => setPassword(e.target.value)}
          />
          <Checkbox isRequired className="py-4" size="sm">
            I agree with the&nbsp;
            <Link href="#" size="sm">
              Terms
            </Link>
            &nbsp; and&nbsp;
            <Link href="#" size="sm">
              Privacy Policy
            </Link>
          </Checkbox>
          <Button
            color="primary"
            disabled={loading}
            isLoading={loading}
            type="submit"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
          <p className="text-center text-small">
            <Link
              href={
                redirect ?
                  `/login?redirect=${encodeURIComponent(redirect)}`
                : "/login"
              }
              size="sm"
            >
              Already have an account? Log In
            </Link>
          </p>
          <div className="flex items-center gap-4 py-2">
            <Divider className="flex-1" />
            <p className="shrink-0 text-tiny text-default-500">OR</p>
            <Divider className="flex-1" />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              disabled={loading}
              startContent={<Icon icon="flat-color-icons:google" width={24} />}
              variant="bordered"
              onPress={() => handleSocialLogin("google")}
            >
              Continue with Google
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
