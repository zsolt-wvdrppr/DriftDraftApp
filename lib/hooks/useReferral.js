"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { getJWT } from "@/lib/utils/getJWT";
import logger from "@/lib/logger";
import { useAuth } from "@/lib/AuthContext";
import { createOrUpdateProfile } from "@/lib/supabaseClient";

export const useReferral = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [referralName, setReferralName] = useState(null);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  // Track mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only access searchParams after mounting
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      const urlReferralName = searchParams.get("ref");
      setReferralName(urlReferralName);
    }
  }, [mounted, searchParams]);

  // ✅ Show the confirmation modal (to be used in the parent component)
  const showReferralModal = () => {
    if (user && referralName) {
      logger.debug(`Referral detected: ${referralName}`);
      setIsReferralModalOpen(true);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    
    const redirectPath = searchParams.get("ref");

    if (!redirectPath) return;

    if (!user) {
      if (redirectPath) {
        logger.debug("Redirecting to signup with referral path:", redirectPath);

        router.replace(`/login?redirect=/?ref=${redirectPath}`, {
          scroll: false,
        });

        return;
      }

      return;
    }

    const createProfile = async () => {
      if (!user) return;
      logger.debug("Creating user profile...", user);
      // ✅ Ensure profile is created before proceeding
      const profileCreated = await createOrUpdateProfile();

      if (!profileCreated) {
        logger.debug("Failed to create user profile. Please try again.");

        return;
      }
    };

    createProfile(); // ✅ Call the function

    showReferralModal();
  }, [mounted, user, referralName]);

  // ✅ Remove referral param from URL
  const removeReferralParam = () => {
    if (!mounted) return;
    
    setIsReferralModalOpen(false); // ✅ Close the modal

    const newParams = new URLSearchParams(searchParams?.toString());

    newParams?.delete("ref");
    router.replace(`?${newParams?.toString()}`, { scroll: false });
  };

  // ✅ Function to set referral after confirmation
  const setReferralUser = async () => {
    setIsReferralModalOpen(false); // ✅ Close the modal

    try {
      const token = await getJWT();

      if (!token) return;

      const response = await fetch("/api/referee/set-referral", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ referral_name: referralName }),
      });

      const result = await response.json();

      if (response.ok) {
        logger.info(`✅ Referral set successfully: ${result?.referral_user_id}`);
        removeReferralParam(); // ✅ Remove referral param from URL after success
      } else {
        logger.error("❌ Error setting referral:", result.error);
      }
    } catch (err) {
      logger.error("❌ Error in setReferralUser:", err.message);
    }
  };

  return {
    isReferralModalOpen,
    showReferralModal,
    setReferralUser,
    removeReferralParam,
    referralName: referralName as string | null,
  };
};