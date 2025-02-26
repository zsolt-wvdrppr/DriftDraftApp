"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Checkbox, Link, Divider } from "@heroui/react";
import { IconLock } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
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

  const toggleVisibility = () => setIsVisible(!isVisible);
  const play = useToastSound();

  useEffect(() => {
     // Redirect to activities page if user is already logged in
     if (user) {
       router.push("/activities");
     }
   }, [user]);

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
        "/profile";

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
      const redirectPath = new URLSearchParams(window.location.search).get("redirect") || "/activities";

      logger.info(`${window.location.origin}${redirectPath}`);
  
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}${redirectPath}`,
          data: {
            full_name: name,
            referral_name: referralName || null, // ✅ Store referral name if exists
          },
        },
      });
  
      if (error) throw error;
  
      setMessage("Check your email to confirm your account.");
      setEmail("");
      setPassword("");
      setName("");
  
      logger.info("Email signup initiated");
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
            name="email"
            placeholder="Enter your email"
            type="email"
            value={email}
            variant="bordered"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            isRequired
            classNames = {{
              inputWrapper: "pr-0"
            }}
            endContent={
              <Button type="button" className="min-w-0" onPress={toggleVisibility}>
                {isVisible ? (
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
            <Link href="/login" size="sm">
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
