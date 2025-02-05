import logger from "@/lib/logger";

export const handleAuthenticatedUserRateLimit = async (userId, supabase) => {
  let profileCredits = 0;

  // Fetch the user profile with both credits
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("tier, allowance_credits, top_up_credits")
    .eq("user_id", userId.trim())
    .single();

  if (profileError) {
    logger.error(`Error fetching user profile: ${profileError.message}`);
    return { isRateLimited: true, message: 'Profile fetch error.' };
  }

  if (!profile) {
    logger.warn(`Profile not found for userId: '${userId}'`);
    return { isRateLimited: true, message: 'User profile not found. Please register or check your credentials.' };
  }

  if (profile.tier === "free" && profile.top_up_credits <= 0) {
    return { isRateLimited: true, message: 'No credits available.' };
  }

  // Handle allowance_credits for paid-tier users first
  if (profile.tier !== "free") {
    if (profile.allowance_credits > 0) {
      // Deduct from allowance_credits
      const { error: allowanceError } = await supabase
        .from("profiles")
        .update({ allowance_credits: profile.allowance_credits - 1 })
        .eq("user_id", userId);

      if (allowanceError) {
        logger.error("Error deducting allowance credit:", allowanceError.message);
        throw new Error("Failed to deduct allowance credit");
      }

      profileCredits = profile.allowance_credits - 1;
    } else if (profile.top_up_credits > 0) {
      // If no allowance_credits, deduct from top_up_credit
      const { error: topUpError } = await supabase
        .from("profiles")
        .update({ top_up_credits: profile.top_up_credits - 1 })
        .eq("user_id", userId);

      if (topUpError) {
        logger.error("Error deducting top-up credit:", topUpError.message);
        throw new Error("Failed to deduct top-up credit");
      }

      profileCredits = profile.top_up_credits - 1;
    } else {
      return { isRateLimited: true, message: 'No credits available.' };
    }
  } else {
    // Handle free-tier users with top_up_credits
    const { error: creditError } = await supabase
      .from("profiles")
      .update({ top_up_credits: profile.top_up_credits - 1 })
      .eq("user_id", userId);

    if (creditError) {
      logger.error("Error deducting free-tier credit:", creditError.message);
      throw new Error("Failed to deduct free-tier credit");
    }

    profileCredits = profile.top_up_credits - 1;
  }

  return { isRateLimited: false, profileCredits };
};

export default handleAuthenticatedUserRateLimit;
