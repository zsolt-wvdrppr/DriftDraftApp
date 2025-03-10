"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Link } from "@heroui/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import logger from "@/lib/logger";
import { supabase } from "@/lib/supabaseClient";
import { useToastSound } from "@/lib/hooks/useToastSound";
import { useAuth } from "@/lib/AuthContext";
import { useSessionContext } from "@/lib/SessionProvider";

export default function ResetPassword() {
  const router = useRouter();
  const play = useToastSound();
  const { user } = useAuth(); // Get the user from AuthContext
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  
  // Form validation states
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");

  // Use refs to track if toasts were already shown
  const serverErrorShown = useRef(false);
  const successShown = useRef(false);

  const { logOutUser } = useSessionContext(); // Get the logOutUser function from SessionProvider
  
  useEffect(() => {
    // Only show server error toast if it hasn't been shown for this error yet
    if (serverError && !serverErrorShown.current) {
      serverErrorShown.current = true;
      toast.dismiss(); // Dismiss any existing toasts before showing a new one
      toast.error(serverError, {
        duration: 10000,
        position: "top-center",
        closeButton: true,
        classNames: { toast: "text-danger", title: "text-md font-semibold" },
        onOpen: play(),
      });
    } else if (!serverError) {
      // Reset the flag when error is cleared
      serverErrorShown.current = false;
    }
    
    // Only show success toast if it hasn't been shown for this success message yet
    if (success && !successShown.current) {
      successShown.current = true;
      toast.dismiss(); // Dismiss any existing toasts before showing a new one
      toast.success(success, {
        position: "top-center",
        closeButton: true,
        duration: 5000,
        classNames: {
          toast: "text-green-800",
        },
      });
    } else if (!success) {
      // Reset the flag when success is cleared
      successShown.current = false;
    }
  }, [serverError, success, play]);

  // Validate password only on blur or submit, not on every change
  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  // Validate password confirmation
  const validateConfirmPassword = () => {
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return false;
    } else {
      setConfirmPasswordError("");
      return true;
    }
  };

  // Validate email
  const validateEmail = () => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    // Validate email before submitting
    if (!validateEmail()) {
      return;
    }
    
    setLoading(true);
    setServerError(null);
    setSuccess(null);
    // Reset toast flags
    serverErrorShown.current = false;
    successShown.current = false;

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess("Password reset link sent to your email. Please check your inbox.");
      logger.info("Password reset request sent");
    } catch (err) {
      logger.error("Error requesting password reset:", err.message);
      setServerError(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate both password fields before submitting
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    
    if (!isPasswordValid || !isConfirmPasswordValid) {
      return;
    }
    
    setLoading(true);
    setServerError(null);
    setSuccess(null);
    // Reset toast flags
    serverErrorShown.current = false;
    successShown.current = false;

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setSuccess("Password successfully reset! Redirecting to login...");
      logger.info("Password reset successful");
      
      // Sign out the user after a successful password reset
      await logOutUser();
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      logger.error("Error resetting password:", err.message);
      setServerError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Simple display logic: if user is logged in, show reset form; otherwise, show request form
  const showResetForm = !!user;

  return (
    <div className="light dark:dark flex h-full w-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
        <p className="pb-2 text-xl font-medium">
          {showResetForm ? "Create New Password" : "Reset Password"}
        </p>
        
        {!showResetForm ? (
          <form className="flex flex-col gap-3" onSubmit={handleRequestReset}>
            <p className="text-default-500 text-sm">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <Input
              autoComplete="email"
              label="Email Address"
              name="email"
              placeholder="Enter your email"
              type="email"
              value={email}
              variant="bordered"
              color={emailError ? "danger" : "default"}
              errorMessage={emailError}
              isInvalid={!!emailError}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={validateEmail}
              required
            />
            <Button color="primary" disabled={loading} type="submit">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
            <Link href="/login">
              <span className="text-center text-sm m-auto">
                Back to login
              </span>
            </Link>
          </form>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={handleResetPassword}>
            <p className="text-default-500 text-sm">
              Enter your new password below.
            </p>
            <Input
              autoComplete="new-password"
              label="New Password"
              name="password"
              placeholder="Enter new password"
              type={passwordVisible ? "text" : "password"}
              value={password}
              variant="bordered"
              color={passwordError ? "danger" : "default"}
              errorMessage={passwordError}
              isInvalid={!!passwordError}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={validatePassword}
              required
            />
            <Input
              autoComplete="new-password"
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Confirm new password"
              type={passwordVisible ? "text" : "password"}
              value={confirmPassword}
              variant="bordered"
              color={confirmPasswordError ? "danger" : "default"}
              errorMessage={confirmPasswordError}
              isInvalid={!!confirmPasswordError}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={validateConfirmPassword}
              required
            />
            <div className="flex items-center px-1 py-2">
              <Button
                className="min-w-0 p-0"
                type="button"
                variant="light"
                onPress={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? "Hide password" : "Show password"}
              </Button>
            </div>
            <Button color="primary" disabled={loading} type="submit">
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}