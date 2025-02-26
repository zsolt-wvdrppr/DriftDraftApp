"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Checkbox, Link, Divider } from "@heroui/react";
import { Icon } from "@iconify-icon/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import logger from "@/lib/logger";
import { supabase, createOrUpdateProfile } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useToastSound } from "@/lib/hooks/useToastSound";

export default function LogIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const searchParams = useSearchParams();
  const [redirect, setRedirect] = useState(null);
  const play = useToastSound();
  const { user } = useAuth(); // Access user state
  const [referral, setReferral] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {

      const urlRedirect = searchParams.get("redirect");
      const urlReferral = searchParams.get("referral");

      if (urlRedirect) setRedirect(urlRedirect);
      setReferral(urlReferral); // ✅ Now `referral` is `null` if missing, ensuring reactivity
    }
  }, []);

  useEffect(() => {
    if (user && referral !== undefined) { // ✅ Ensure referral has been resolved
      const targetUrl = `${redirect}${referral ? `?referral=${referral}` : ""}`;

      router.replace(targetUrl);
    }
  }, [user, referral, redirect]);

  useEffect(() => {
    // Display error in toast
    if (error) {
      toast.error(error, {
        duration: 10000,
        position: "top-center",
        closeButton: true,
        classNames: { toast: "text-danger", title: "text-md font-semibold" },
        onOpen: play(),
      });
    }
  }, [error]);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Display a user-friendly error message
        if (error.message === "Invalid login credentials") {
          setError("Invalid email or password. Please try again.");
        } else if (error.message === "User not found") {
          setError("No account found with this email. Please sign up first.");
        } else {
          logger.error("Error logging in:", error.message);
          setError(error.message);
        }

        return; // Stop execution after error
      }

      // ✅ Ensure profile is created before proceeding
      const profileCreated = await createOrUpdateProfile();

      if (!profileCreated) {
        setError("Failed to create user profile. Please try again.");

        return;
      }

      const redirectUrl =
        new URLSearchParams(window.location.search).get("redirect") ||
        "/activities";

      router.push(redirectUrl);
    } catch (err) {
      setError("Something went wrong. Please try again later.");
      logger.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setLoading(true);
    setError(null);
    try {
      const redirectPath =
        new URLSearchParams(window.location.search).get("redirect") ||
        "/activities";

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

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
        <p className="pb-2 text-xl font-medium">Log In</p>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault(); // Prevent default form submission
            handleLogin(email, password); // Pass email and password explicitly
          }}
        >
          {/*error && <p className="text-red-500">{error}</p>} {/* Show error */}
          <Input
            autoComplete="email"
            label="Email Address"
            name="email"
            placeholder="Enter your email"
            type="email"
            value={email}
            variant="bordered"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            autoComplete="current-password"
            classNames={{
              inputWrapper: "pr-0",
            }}
            endContent={
              <Button
                type="button"
                className="min-w-0"
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-bold"
                  />
                )}
              </Button>
            }
            label="Password"
            name="password"
            placeholder="Enter your password"
            type={passwordVisible ? "text" : "password"}
            value={password}
            variant="bordered"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex items-center justify-between px-1 py-2">
            <Checkbox name="remember" size="sm">
              Remember me
            </Checkbox>
            <Link className="text-default-500" href="#" size="sm">
              Forgot password?
            </Link>
          </div>
          <Button color="primary" disabled={loading} type="submit">
            {loading ? "Logging in..." : "Log In"}
          </Button>
          <Link href={`/signup?redirect=${encodeURIComponent(redirect)}`}>
            <span className="text-center text-sm m-auto">
              {"Don't have an account? Sign Up"}
            </span>
          </Link>
        </form>
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
      </div>
    </div>
  );
}
