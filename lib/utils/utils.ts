import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { marked } from "marked";

import logger from "@/lib/logger";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateToLocalBasic = (timestampz: any) => {
  if (!timestampz) return "N/A"; // Handle missing or invalid timestampz

  const date = new Date(timestampz); // Convert the timestampz to a Date object

  return date.toLocaleString(); // Format it to the user's local timezone and locale
};

export const formatDateToLocal = (timestampz: any) => {
  if (!timestampz) return "N/A";

  const date = new Date(timestampz);

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
};

export const formatTimeToLocalAMPM = (timestampz: any) => {
  if (!timestampz) return "N/A"; // Handle missing or invalid timestampz

  const date = new Date(timestampz);

  if (isNaN(date.getTime())) return "Invalid Date"; // Validate date conversion

  return date.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Ensures AM/PM formatting
  });
};

/**
 * Converts an HTML string into plain text with proper entity decoding and line break preservation.
 * Safe for both SSR and CSR in Next.js 15 & React 19.
 */
export const htmlToPlainText = (htmlString: string): string => {
  if (typeof window === "undefined") {
    // SSR Safe: Decode basic entities only without DOM manipulation
    return htmlString
      .replace(/<br\s*\/?>/gi, "\n") // Convert <br> to newlines
      .replace(/<\/?[^>]+(>|$)/g, "") // Strip all HTML tags
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .trim();
  } else {
    // CSR Safe: Use DOM parsing for better accuracy in the browser
    const tempElement = document.createElement("div");

    tempElement.innerHTML = htmlString;

    // Replace <br> tags with newlines before stripping
    tempElement.innerHTML = tempElement.innerHTML.replace(/<br\s*\/?>/gi, "\n");

    // Extract plain text with HTML entity decoding handled by the browser
    const plainText = tempElement.textContent || "";

    return plainText.trim();
  }
};

export async function markdownToPlainText(
  markdownText: string
): Promise<string> {
  // Configure marked for line break preservation
  marked.setOptions({
    breaks: true,
  });

  // Parse Markdown to HTML
  const html = await marked.parse(markdownText);

  // Create a temporary element for parsing the HTML and stripping tags
  const tempElement = document.createElement("div");

  tempElement.innerHTML = html;

  // Replace <br> tags with line breaks and decode HTML entities
  const plainText = tempElement.innerHTML
    .replace(/<br\s*\/?>/gi, "\n") // Preserve line breaks
    .replace(/<\/?[^>]+(>|$)/g, "") // Strip all HTML tags
    .replace(/&quot;/g, '"') // Decode entities
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();

  return plainText;
}

export const sanitizeFilename = (title: string) => {
  if (!title) return "document"; // Fallback to "document" if title is empty or undefined

  return title
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^a-z0-9_\-]/g, ""); // Remove invalid characters
};

export const sortItemsByDate = (items: any, isAcending = false) => {
  if (isAcending) {
    const sortedItems = [...items].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sortedItems;
  } else {
    const sortedItems = [...items].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return sortedItems;
  }
};

export const getAuthHeaders = (jwt: string) => {
  if (!jwt) {
    logger.warn("JWT is missing or not available.");

    return {};
  }

  return {
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
  };
};

export function getPlannerTypeFromPath(pathname: string) {
  if (pathname === "/landingpage-planner") {
    return "landing page";
  } else if (pathname === "/website-planner") {
    return "website";
  }

  return null;
}
