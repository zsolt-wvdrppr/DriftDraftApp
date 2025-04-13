import logger from "@/lib/logger";

export const handleAuthenticatedUserRateLimit = async (userId, supabase, requiredCredits) => {
  logger.debug("[HANDLE USER RATE LIMIT] Required credits:", requiredCredits);

  // Fetch the user profile with all credits
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("tier, allowance_credits, top_up_credits, promo_credits")
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

  // Calculate total available credits
  const totalCredits = profile.promo_credits + profile.allowance_credits + profile.top_up_credits;

  // Check if user has enough credits for the entire operation
  if (requiredCredits > totalCredits) {
    return { isRateLimited: true, message: 'Insufficient credits.' };
  }

  // Initialize the updated credit values - only deduct 1 credit per request
  let updatedPromoCredits = profile.promo_credits;
  let updatedAllowanceCredits = profile.allowance_credits;
  let updatedTopUpCredits = profile.top_up_credits;
  
  // Always deduct exactly 1 credit, in order of priority
  if (updatedPromoCredits > 0) {
    // Deduct from promo credits first
    updatedPromoCredits -= 1;
  } else if (updatedAllowanceCredits > 0) {
    // Then from allowance credits
    updatedAllowanceCredits -= 1;
  } else if (updatedTopUpCredits > 0) {
    // Finally from top-up credits
    updatedTopUpCredits -= 1;
  }

  // Update the user's credits in the database
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      promo_credits: updatedPromoCredits,
      allowance_credits: updatedAllowanceCredits,
      top_up_credits: updatedTopUpCredits
    })
    .eq("user_id", userId);

  if (updateError) {
    logger.error("Error updating credits:", updateError.message);
    throw new Error("Failed to update credits");
  }

  // Return the remaining total credits
  const remainingTotalCredits = updatedPromoCredits + updatedAllowanceCredits + updatedTopUpCredits;
  
  return { 
    isRateLimited: false, 
    profileCredits: remainingTotalCredits,
    totalCreditsRemaining: remainingTotalCredits
  };
};

export default handleAuthenticatedUserRateLimit;