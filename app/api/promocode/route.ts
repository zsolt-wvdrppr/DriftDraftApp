// app/api/promocode/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Create a Supabase client using your environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { code, userId } = await request.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: "No promo code provided" },
        { status: 400 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Fetch the coupon from the coupons table
    const { data: coupon, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", code)
      .single();

    if (couponError || !coupon) {
      return NextResponse.json(
        { success: false, error: "Invalid or non-existent promo code" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Validate the coupon's start date if provided.
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return NextResponse.json(
        { success: false, error: "Promo code not active yet" },
        { status: 400 }
      );
    }
    // Validate the coupon's expiration date if provided.
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return NextResponse.json(
        { success: false, error: "Promo code expired" },
        { status: 400 }
      );
    }

    // Validate that redemptions have not exceeded max_redemptions.
    if (coupon.max_redemptions !== null && coupon.max_redemptions !== undefined) {
      if (coupon.redemptions >= coupon.max_redemptions) {
        return NextResponse.json(
          { success: false, error: "Promo code usage limit reached" },
          { status: 400 }
        );
      }
    }

    // Fetch the user's profile to check coupons_used
    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("coupons_used")
      .eq("user_id", userId)
      .single();

    if (profileFetchError || !profile) {
      return NextResponse.json(
        { success: false, error: "User profile not found" },
        { status: 404 }
      );
    }

    // Check if the promo code has already been used by this user.
    const couponsUsed = profile.coupons_used || [];

    if (couponsUsed.includes(code)) {
      return NextResponse.json(
        { success: false, error: "Promo code already used" },
        { status: 400 }
      );
    }

    // Determine the credits awarded from the coupon.
    const creditsAwarded = coupon.credits_awarded || 0;

    // Increment the user's top_up_credits via an RPC call.
    const { error: rpcError } = await supabase.rpc("increment_profile_credits", {
      p_user_id: userId,
      p_amount: creditsAwarded,
    });

    if (rpcError) {
      console.error("Error updating profile credits:", rpcError);

      return NextResponse.json(
        { success: false, error: "Unable to update profile credits" },
        { status: 500 }
      );
    }

    // Update the user's coupons_used array by appending the current promo code.
    const newCouponsUsed = [...couponsUsed, code];
    const { error: updateCouponsError } = await supabase
      .from("profiles")
      .update({ coupons_used: newCouponsUsed })
      .eq("user_id", userId);

    if (updateCouponsError) {
      console.error("Error updating coupons_used:", updateCouponsError);

      return NextResponse.json(
        { success: false, error: "Failed to update coupon usage" },
        { status: 500 }
      );
    }

    // Optionally update the coupon's redemption count.
    const { error: updateRedemptionsError } = await supabase
      .from("coupons")
      .update({ redemptions: coupon.redemptions + 1 })
      .eq("id", coupon.id);

    if (updateRedemptionsError) {
      console.error("Error updating coupon redemptions:", updateRedemptionsError);
      // Not returning an error here because credits have already been awarded.
    }

    return NextResponse.json({ success: true, creditsAwarded });
  } catch (err) {
    console.error("Error processing promo code:", err);

    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}
