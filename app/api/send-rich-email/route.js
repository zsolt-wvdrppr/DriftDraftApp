import { NextResponse } from "next/server";

import logger from "@/lib/logger";

export async function POST(request) {
  const postmark = require("postmark");
  // Initialize the Postmark client
  const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

  const { email, content, senderName } = await request.json();

  try {
     // Validate template ID
     if (!content.TemplateId) {
      return NextResponse.json({ error: "Missing TemplateId" }, { status: 400 });
    }

    const { TemplateId, ...templateModel } = content;

    // log templateModel
    logger.debug("Template Model:", templateModel);

    const response = await client.sendEmailWithTemplate({
      From: `${senderName} <invite@driftdraft.app>`, // Verified sender email
      To: email,
      ReplyTo: "support@wavedropper.com",
      TemplateId: TemplateId,
      TemplateModel: templateModel,
      MessageStream: "outbound", // Optional: Ensures email goes through the correct sending stream
    });

    return NextResponse.json({ message: "Email sent successfully", response });
  } catch (error) {
    console.error("Error sending email with Postmark:", error);

    return NextResponse.json(
      { error: "Failed to send email with Postmark." },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
