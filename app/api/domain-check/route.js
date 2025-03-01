// app/api/domain-check/route.js
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'Domain is required' }, { status: 400 });
  }

  try {
    // Check domain availability
    const availabilityResponse = await fetch(
      `https://api.ote-godaddy.com/v1/domains/available?domain=${domain}`,
      {
        headers: {
          Authorization: `sso-key ${process.env.NEXT_PUBLIC_GODADDY_API_KEY}:${process.env.GODADDY_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!availabilityResponse.ok) {
      const errorText = await availabilityResponse.text();

      throw new Error(`GoDaddy API error: ${errorText}`);
    }

    const availabilityData = await availabilityResponse.json();
    let suggestions = [];

    // If the domain is NOT available, fetch similar domain suggestions
    if (!availabilityData.available) {
      const suggestionsResponse = await fetch(
        `https://api.ote-godaddy.com/v1/domains/suggest?query=${domain}&limit=5`,
        {
          headers: {
            Authorization: `sso-key ${process.env.NEXT_PUBLIC_GODADDY_API_KEY}:${process.env.GODADDY_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (suggestionsResponse.ok) {
        suggestions = await suggestionsResponse.json();
      }
    }

    return NextResponse.json({ isAvailable: availabilityData.available, suggestions });
  } catch (error) {
    console.error('GoDaddy API error:', error);

    return NextResponse.json(
      { error: 'Failed to check domain availability' },
      { status: 500 }
    );
  }
}
