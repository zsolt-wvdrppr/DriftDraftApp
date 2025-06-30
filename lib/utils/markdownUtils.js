// Utils for handling markdown content in Activities modal

/**
 * Strips section markers from markdown content
 * Removes all <!-- SECTION_START: ... --> and <!-- SECTION_END: ... --> comments
 */
export const stripSectionMarkers = (markdownContent) => {
  if (!markdownContent) return "";

  return markdownContent
    .replace(/<!--\s*SECTION_START:[^>]*-->/g, "")
    .replace(/<!--\s*SECTION_END:[^>]*-->/g, "")
    .replace(/\n\s*\n\s*\n/g, "\n\n") // Clean up extra newlines
    .trim();
};

/**
 * Extracts headers from markdown and generates table of contents with anchor links
 */
export const generateTableOfContents = (markdownContent) => {
  if (!markdownContent) return [];

  const cleanContent = stripSectionMarkers(markdownContent);
  const headerRegex = /^(#{1,2})\s+(.+)$/gm;
  const headers = [];
  let match;

  while ((match = headerRegex.exec(cleanContent)) !== null) {
    const level = match[1].length; // Number of # characters
    const title = match[2].trim();
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim();

    headers.push({
      id,
      title,
      level,
    });
  }

  return headers;
};

/**
 * Adds anchor IDs to headers in markdown for smooth scrolling
 */
export const addHeaderAnchors = (markdownContent) => {
  if (!markdownContent) return "";

  const cleanContent = stripSectionMarkers(markdownContent);

  return cleanContent.replace(/^(#{1,2})\s+(.+)$/gm, (match, hashes, title) => {
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    return `${hashes} ${title} {#${id}}`;
  });
};
