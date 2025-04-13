import logger from "@/lib/logger";

export const handleAuthenticatedUserRateLimit = async (
  userId,
  supabase,
  requiredCredits
) => {
  logger.debug("[HANDLE USER RATE LIMIT] Required credits:", requiredCredits);

  // Fetch the user profile with all credits
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("tier, allowance_credits, top_up_credits, promo_credits")
    .eq("user_id", userId.trim())
    .single();

  if (profileError) {
    logger.error(`Error fetching user profile: ${profileError.message}`);

    return { isRateLimited: true, message: "Profile fetch error." };
  }

  if (!profile) {
    logger.warn(`Profile not found for userId: '${userId}'`);

    return {
      isRateLimited: true,
      message:
        "User profile not found. Please register or check your credentials.",
    };
  }

  // Calculate total available credits
  const totalCredits =
    profile.promo_credits + profile.allowance_credits + profile.top_up_credits;

  // Check if user has enough credits
  if (requiredCredits > totalCredits) {
    return { isRateLimited: true, message: "Insufficient credits." };
  }

  // Initialize the updated credit values
  let remainingToDeduct = requiredCredits;
  let updatedPromoCredits = profile.promo_credits;
  let updatedAllowanceCredits = profile.allowance_credits;
  let updatedTopUpCredits = profile.top_up_credits;

  // Deduct from promo credits first
  if (remainingToDeduct > 0 && updatedPromoCredits > 0) {
    const promoToDeduct = Math.min(remainingToDeduct, updatedPromoCredits);

    updatedPromoCredits -= promoToDeduct;
    remainingToDeduct -= promoToDeduct;
  }

  // Then deduct from allowance credits
  if (remainingToDeduct > 0 && updatedAllowanceCredits > 0) {
    const allowanceToDeduct = Math.min(
      remainingToDeduct,
      updatedAllowanceCredits
    );

    updatedAllowanceCredits -= allowanceToDeduct;
    remainingToDeduct -= allowanceToDeduct;
  }

  // Finally deduct from top-up credits
  if (remainingToDeduct > 0 && updatedTopUpCredits > 0) {
    const topUpToDeduct = Math.min(remainingToDeduct, updatedTopUpCredits);

    updatedTopUpCredits -= topUpToDeduct;
    remainingToDeduct -= topUpToDeduct;
  }

  // Update the user's credits in the database
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      promo_credits: updatedPromoCredits,
      allowance_credits: updatedAllowanceCredits,
      top_up_credits: updatedTopUpCredits,
    })
    .eq("user_id", userId);

  if (updateError) {
    logger.error("Error updating credits:", updateError.message);
    throw new Error("Failed to update credits");
  }

  // Return the remaining total credits
  const remainingTotalCredits =
    updatedPromoCredits + updatedAllowanceCredits + updatedTopUpCredits;

  return {
    isRateLimited: false,
    profileCredits: remainingTotalCredits,
    creditDetails: {
      promo: updatedPromoCredits,
      allowance: updatedAllowanceCredits,
      topUp: updatedTopUpCredits,
    },
  };
};

export default handleAuthenticatedUserRateLimit;
