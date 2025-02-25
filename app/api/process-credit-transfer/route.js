import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import logger from "@/lib/logger";
import { getUserIdFromJWT } from "@/lib/utils/getUserIdFromJwt";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Role Key for secure DB queries

export async function POST(req) {

    let top_up_credits = 0;
    let full_name = "";

  try {
    const authHeader = req.headers.get("authorization");
    const jwt = authHeader?.replace("Bearer ", "").trim() || null;

    // ✅ Extract userId from JWT for authentication
    const userId = await getUserIdFromJWT(authHeader);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    logger.debug("Processing credit transfer for user:", userId);
    logger.debug("JWT:", jwt);

    // ✅ Authenticate with Supabase using JWT (RLS-enabled)
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: jwt ? { Authorization: `Bearer ${jwt}` } : {} },
    });

    logger.info("Fetching sender details for credit transfer...");

    // Step 1: Fetch sender details
    const { data: senderProfile, error: fetchError } = await supabaseAuth
      .from("profiles")
      .select("pending_credits, transfer_recipient_email, top_up_credits, full_name")
      .eq("user_id", userId)
      .maybeSingle();

    if (
      fetchError ||
      !senderProfile?.transfer_recipient_email ||
      senderProfile.pending_credits === 0
    ) {
      logger.error("No pending transfer found:", fetchError);

      return NextResponse.json(
        { success: false, error: "No pending transfer found." },
        { status: 400 }
      );
    }

    const { pending_credits, transfer_recipient_email } = senderProfile;

    top_up_credits = senderProfile.top_up_credits;
    full_name = senderProfile.full_name;

    logger.debug("Sender details fetched:", senderProfile);

    // ✅ Authenticate with the role key for secure updates
    const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    logger.info("Processing credit transfer...");

    // Step 2: Transfer credits to recipient
    const { error: recipientError } = await adminSupabase.rpc(
      "increment_profile_top_up_credits_by_email",
      {
        p_email: transfer_recipient_email,
        p_amount: pending_credits,
      }
    );

    if (recipientError) {
      logger.error("Transfer failed at recipient update:", recipientError);

      return NextResponse.json(
        { success: false, error: "Transfer failed at recipient update." },
        { status: 500 }
      );
    }

    // Step 3: Reset sender’s pending_credits & transfer_recipient_email
    const { error: finalizeError } = await supabaseAuth
      .from("profiles")
      .update({ pending_credits: 0, transfer_recipient_email: null })
      .eq("user_id", userId);

    if (finalizeError) {
      logger.error("Failed to finalize transfer:", finalizeError);

      return NextResponse.json(
        { success: false, error: "Failed to finalize transfer." },
        { status: 500 }
      );
    }

    // Step 4: Log the transaction
    const result = await adminSupabase.rpc("log_credit_transfer", {
      p_user_id: userId,
      p_recipient_email: transfer_recipient_email,
      p_transfer_amount: pending_credits,
      p_balance_before_transfer: top_up_credits + pending_credits,
      p_balance_after_transfer: top_up_credits,
      p_completed: true,
    });

    // log the result
    logger.debug("Credit transfer completed successfully:", result);

    // Step 5: Notify the recipient via email
    const emailPayload = {
        email: transfer_recipient_email,
        content: {
          name: "DriftDraft",
          subject: "You've received credits!",
          text: `Hi there, ${full_name} just transferred ${pending_credits} credits to you.`,
          html: `<p>Hi there,</p><p><strong>${full_name}</strong> just transferred <strong>${pending_credits} credits</strong> to you.</p>`,
        },
      };
  
      const emailResponse = await fetch(`${process.env.URL}/api/send-rich-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });
  
      const emailData = await emailResponse.json();
  
      if (!emailResponse.ok) {
        logger.error("Failed to send notification email:", emailData.error);
      } else {
        logger.info("Email sent successfully:", emailData.message);
      }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("Unexpected error in process-credit-transfer:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
