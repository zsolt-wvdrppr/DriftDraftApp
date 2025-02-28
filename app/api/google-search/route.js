import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing search query." }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  if (!apiKey || !cx) {
    return NextResponse.json({ error: "Google API credentials missing." }, { status: 500 });
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;
    
    const response = await fetch(url);

    if (!response.ok) throw new Error("Failed to fetch search results");

    const data = await response.json();

    const results = data.items
      ? data.items.map((item) => ({ title: item.title, link: item.link }))
      : [];

    return NextResponse.json({ results });
  } catch (error) {
    console.error("[Google Search API] Error:", error.message);

    return NextResponse.json({ error: "Failed to fetch search results." }, { status: 500 });
  }
}
