import fs from "fs";
import path from "path";

import logger from "../logger.js";

// Cache for docs data to avoid repeated file system operations
let cachedDocs = null;
let cacheInitialized = false;

// Helper function to format title
function formatTitle(title) {
  // Replace dashes with spaces
  const withSpaces = title.replace(/-/g, " ");

  // Capitalize first letter of each word
  return withSpaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Initialize docs cache - this runs at build time or first access
function initializeDocsCache() {
  if (cacheInitialized) {
    return;
  }

  try {
    const docsDirectory = path.resolve(process.cwd(), "data/docs");

    // Check if directory exists
    if (!fs.existsSync(docsDirectory)) {
      logger.error("Docs directory does not exist:", docsDirectory);
      cachedDocs = [];
      cacheInitialized = true;

      return;
    }

    const fileNames = fs.readdirSync(docsDirectory);

    cachedDocs = fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => {
        try {
          const slug = fileName.replace(/\.md$/, "");

          // Sanitise slug to prevent any path issues
          const sanitisedSlug = slug.replace(/[^a-zA-Z0-9-_]/g, "");

          const fullPath = path.resolve(docsDirectory, fileName);

          // Security check - ensure path is within docs directory
          if (!fullPath.startsWith(docsDirectory)) {
            logger.error("Invalid path detected:", fullPath);

            return null;
          }

          // Check if file exists before reading
          if (!fs.existsSync(fullPath)) {
            logger.error("File does not exist:", fullPath);

            return null;
          }

          const fileContents = fs.readFileSync(fullPath, "utf8");

          // Get title from first heading or format the slug
          const titleFromHeading = fileContents.match(/# (.*)/)?.[1];
          const title = titleFromHeading || formatTitle(sanitisedSlug);

          // Get order from filename if it starts with a number
          const order =
            fileName.match(/^(\d+)-/)?.[1] ?
              parseInt(fileName.match(/^(\d+)-/)[1], 10)
            : 999;

          return {
            slug: sanitisedSlug,
            title,
            order,
            content: fileContents,
          };
        } catch (fileError) {
          logger.error(`Error processing file ${fileName}:`, fileError);

          return null;
        }
      })
      .filter(Boolean) // Remove null entries
      .sort((a, b) => a.order - b.order);

    cacheInitialized = true;
    logger.info(`Loaded ${cachedDocs.length} documentation files`);
  } catch (error) {
    logger.error("Error initializing docs cache:", error);
    cachedDocs = [];
    cacheInitialized = true;
  }
}

export function getDocBySlug(slug) {
  try {
    // Initialize cache if not done already
    if (!cacheInitialized) {
      initializeDocsCache();
    }

    // Sanitise the input slug
    const sanitisedSlug = slug ? slug.replace(/[^a-zA-Z0-9-_]/g, "") : "";

    if (!sanitisedSlug) {
      return {
        slug: "not-found",
        content: "# Not Found\n\nInvalid document identifier.",
        title: "Not Found",
      };
    }

    // Find the document in cache
    const doc = cachedDocs?.find((d) => d.slug === sanitisedSlug);

    if (!doc) {
      logger.warn(`Document not found: ${sanitisedSlug}`);

      return {
        slug: sanitisedSlug,
        content: "# Not Found\n\nThe requested document could not be found.",
        title: "Not Found",
      };
    }

    return {
      slug: doc.slug,
      content: doc.content,
      title: doc.title,
    };
  } catch (error) {
    logger.error(`Error in getDocBySlug for slug: ${slug}`, error);

    return {
      slug: slug || "error",
      content: "# Error\n\nAn error occurred while loading this document.",
      title: "Error",
    };
  }
}

export function getAllDocs() {
  try {
    // Initialize cache if not done already
    if (!cacheInitialized) {
      initializeDocsCache();
    }

    // Return docs without content for navigation purposes
    if (!cachedDocs || cachedDocs.length === 0) {
      logger.warn("No documents found or cache empty");

      return [];
    }

    return cachedDocs.map(({ content, ...doc }) => doc);
  } catch (error) {
    logger.error("Error in getAllDocs:", error);

    return [];
  }
}

// Optional: Function to force cache refresh (useful for development)
export function refreshDocsCache() {
  cacheInitialized = false;
  cachedDocs = null;
  initializeDocsCache();
}
