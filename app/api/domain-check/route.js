// app/api/domain-check/route.js
import { NextResponse } from "next/server";

import logger from "@/lib/logger"; // Adjust the import based on your logger setup

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");

  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  try {
    // Check if the domain ends with .uk but not .co.uk, .org.uk, etc.
    const isDirectUkDomain =
      domain.endsWith(".uk") &&
      !domain.endsWith(".co.uk") &&
      !domain.endsWith(".org.uk") &&
      !domain.endsWith(".me.uk") &&
      !domain.endsWith(".ac.uk") &&
      !domain.endsWith(".gov.uk") &&
      !domain.endsWith(".net.uk");

    // For direct .uk domains, convert to equivalent .co.uk for checking
    // and also prepare a list of alternative UK domain patterns to suggest
    let domainToCheck = domain;
    let fallbackSuggestions = [];

    if (isDirectUkDomain) {
      const baseName = domain.slice(0, -3); // Remove .uk

      domainToCheck = `${baseName}.co.uk`; // Convert to .co.uk for checking

      // Create fallback suggestions for UK domains
      fallbackSuggestions = [
        { domain: `${baseName}.co.uk` },
        { domain: `${baseName}.org.uk` },
        { domain: `${baseName}.me.uk` },
      ];
    }

    // Check domain availability
    const availabilityResponse = await fetch(
      `https://api.ote-godaddy.com/v1/domains/available?domain=${domainToCheck}`,
      {
        headers: {
          Authorization: `sso-key ${process.env.NEXT_PUBLIC_GODADDY_API_KEY}:${process.env.GODADDY_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Handle response errors
    if (!availabilityResponse.ok) {
      const errorText = await availabilityResponse.text();

      // If it's a direct .uk domain and we get an error, use our fallback logic
      if (isDirectUkDomain) {
        logger.debug(
          `GoDaddy API doesn't support direct .uk domains. Using fallback suggestions.`
        );

        // Return the fallback suggestions with a disclaimer
        return NextResponse.json({
          isAvailable: null, // We don't know for certain
          suggestions: fallbackSuggestions,
          message:
            "Direct .uk domains cannot be checked directly. Consider these alternatives:",
        });
      }

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
            "Content-Type": "application/json",
          },
        }
      );

      if (suggestionsResponse.ok) {
        suggestions = await suggestionsResponse.json();
      }
    }

    // If this was originally a .uk domain, add our disclaimer
    if (isDirectUkDomain) {
      return NextResponse.json({
        isAvailable: null, // We don't know the actual availability
        suggestions: fallbackSuggestions,
        message:
          "Direct .uk domains cannot be checked via DriftDraft. Consider these alternatives:",
      });
    }

    return NextResponse.json({
      isAvailable: availabilityData.available,
      suggestions,
    });
  } catch (error) {
    logger.error("GoDaddy API error:", error);

    return NextResponse.json(
      { error: "Failed to check domain availability" },
      { status: 500 }
    );
  }
}
