import { NextResponse } from 'next/server';

export async function POST(request) {
  const postmark = require('postmark');
  // Initialize the Postmark client
  const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN);

  const { email, content } = await request.json();
  const name = content.name;

  try {
    const response = await client.sendEmail({
      From: `${name} <invite@driftdraft.app>`, // Replace with your verified sender email address
      To: email,
      ReplyTo: "support@wavedropper.com",
      Subject: content.subject,
      TextBody: content.text,
      HtmlBody: content.html,
    });

    return NextResponse.json({ message: "Email sent successfully", response });
  } catch (error) {
    console.error('Error sending email with Postmark:', error);

    return NextResponse.json({ error: 'Failed to send email with Postmark.' }, { status: 500 });
  }
}

export function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }
  });
}
