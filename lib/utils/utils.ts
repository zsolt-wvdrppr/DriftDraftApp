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

/**
 * Saves a user preference while respecting their consent choices.
 * 
 * This function checks if the user has granted preferences consent before
 * saving data persistently to localStorage. If preferences consent has not
 * been granted, it falls back to sessionStorage which is cleared when the
 * browser session ends, ensuring compliance with privacy regulations.
 * 
 * @param {string} key - The key to store the preference under
 * @param {T} value - The preference value to store
 * @returns {void}
 */
export const saveUserPreference = <T>(key: string, value: T): void => {
  // Define type for consent data
  interface ConsentSettings {
    necessary?: boolean;
    analytics?: boolean;
    marketing?: boolean;
    preferences?: boolean;
  }
  
  // Get current consent status
  const storedConsent: ConsentSettings = JSON.parse(
    localStorage.getItem("cookieConsent") || "{}"
  );
  
  // Convert value to string appropriately
  const valueToStore = typeof value === 'string' 
    ? value 
    : JSON.stringify(value);
  
  if (storedConsent.preferences === true) {
    // User has given preference consent, store persistently
    localStorage.setItem(key, valueToStore);
  } else {
    // User has not given preference consent
    // Use sessionStorage instead, which is cleared when the browser session ends
    sessionStorage.setItem(key, valueToStore);
  }
};

// List of countries with ISO codes, flag codes, and EU membership status
export const COUNTRIES = [
  { value: "AT", label: "Austria", flag: "at", isEU: true },
  { value: "BE", label: "Belgium", flag: "be", isEU: true },
  { value: "BG", label: "Bulgaria", flag: "bg", isEU: true },
  { value: "HR", label: "Croatia", flag: "hr", isEU: true },
  { value: "CY", label: "Cyprus", flag: "cy", isEU: true },
  { value: "CZ", label: "Czech Republic", flag: "cz", isEU: true },
  { value: "DK", label: "Denmark", flag: "dk", isEU: true },
  { value: "EE", label: "Estonia", flag: "ee", isEU: true },
  { value: "FI", label: "Finland", flag: "fi", isEU: true },
  { value: "FR", label: "France", flag: "fr", isEU: true },
  { value: "DE", label: "Germany", flag: "de", isEU: true },
  { value: "GR", label: "Greece", flag: "gr", isEU: true },
  { value: "HU", label: "Hungary", flag: "hu", isEU: true },
  { value: "IE", label: "Ireland", flag: "ie", isEU: true },
  { value: "IT", label: "Italy", flag: "it", isEU: true },
  { value: "LV", label: "Latvia", flag: "lv", isEU: true },
  { value: "LT", label: "Lithuania", flag: "lt", isEU: true },
  { value: "LU", label: "Luxembourg", flag: "lu", isEU: true },
  { value: "MT", label: "Malta", flag: "mt", isEU: true },
  { value: "NL", label: "Netherlands", flag: "nl", isEU: true },
  { value: "PL", label: "Poland", flag: "pl", isEU: true },
  { value: "PT", label: "Portugal", flag: "pt", isEU: true },
  { value: "RO", label: "Romania", flag: "ro", isEU: true },
  { value: "SK", label: "Slovakia", flag: "sk", isEU: true },
  { value: "SI", label: "Slovenia", flag: "si", isEU: true },
  { value: "ES", label: "Spain", flag: "es", isEU: true },
  { value: "SE", label: "Sweden", flag: "se", isEU: true },
  { value: "GB", label: "United Kingdom", flag: "gb", isEU: false },
  { value: "US", label: "United States", flag: "us", isEU: false },
  { value: "CA", label: "Canada", flag: "ca", isEU: false },
  { value: "AU", label: "Australia", flag: "au", isEU: false },
  { value: "NZ", label: "New Zealand", flag: "nz", isEU: false },
  { value: "JP", label: "Japan", flag: "jp", isEU: false },
  { value: "CN", label: "China", flag: "cn", isEU: false },
  { value: "IN", label: "India", flag: "in", isEU: false },
  { value: "BR", label: "Brazil", flag: "br", isEU: false },
  { value: "RU", label: "Russia", flag: "ru", isEU: false },
  { value: "ZA", label: "South Africa", flag: "za", isEU: false },
  { value: "SG", label: "Singapore", flag: "sg", isEU: false },
  { value: "CH", label: "Switzerland", flag: "ch", isEU: false },
];

// Helper function to check if a country is in the EU
export const isEUCountry = (countryCode: string) => {
  const country = COUNTRIES.find(c => c.value === countryCode);

  return country ? country.isEU : false;
};

// VAT number validation
export const validateVatNumber = (vatNumber: string, countryCode: any) => {
  if (!vatNumber || !countryCode) return false;
  
  // Basic format: 2-letter country code followed by 8-12 alphanumeric characters
  const vatRegex = new RegExp(`^${countryCode}[0-9A-Za-z]{8,12}$`);

  return vatRegex.test(vatNumber);
};