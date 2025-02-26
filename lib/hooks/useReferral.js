"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation"; // ✅ Handle URL updates

import { getJWT } from "@/lib/utils/getJWT";
import logger from "@/lib/logger";
import { useAuth } from "@/lib/AuthContext";
import { createOrUpdateProfile } from "@/lib/supabaseClient";

export const useReferral = () => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const referralName = searchParams.get("referral"); // ✅ Extract referral name from URL
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);

  // ✅ Show the confirmation modal (to be used in the parent component)
  const showReferralModal = () => {
    if (user && referralName) {
      logger.debug(`Referral detected: ${referralName}`);
      setIsReferralModalOpen(true);
    }
  };

  useEffect(() => {
    // function that awaits for user

    if (!user) {
      const redirectPath = new URLSearchParams(window.location.search).get(
        "referral"
      );

      if (redirectPath) {
        logger.debug("Redirecting to signup with referral path:", redirectPath);

        router.replace(`/login?redirect=?referral=${redirectPath}`, {
          scroll: false,
        });

        return;
      }

      return;
    }

    const createProfile = async () => {
      // ✅ Ensure profile is created before proceeding
      const profileCreated = await createOrUpdateProfile();

      if (!profileCreated) {
        setError("Failed to create user profile. Please try again.");

        return;
      }
    };

    createProfile(); // ✅ Call the function

    showReferralModal();
  }, [user, referralName]);

  // ✅ Remove referral param from URL
  const removeReferralParam = () => {
    setIsReferralModalOpen(false); // ✅ Close the modal

    const newParams = new URLSearchParams(searchParams.toString());

    newParams.delete("referral");
    router.replace(`?${newParams.toString()}`, { scroll: false });
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
        logger.info(`✅ Referral set successfully: ${result.referral_user_id}`);
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
    referralName,
  };
};
