import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Parse the request body
    const { prompt } = await req.json();

    // Ensure prompt is provided
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    // Initialize Generative AI client with your secret key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content from the API
    const result = await model.generateContent(prompt);

    // Return the generated content
    return NextResponse.json({ content: result.response.text() });
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json(
      { error: "Failed to generate content." },
      { status: 500 }
    );
  }
}
