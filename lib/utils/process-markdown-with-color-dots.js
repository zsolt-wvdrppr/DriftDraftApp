export const processMarkdownWithColorDots = (markdown) => {
    if (!markdown) return markdown;

    // Replace hex color codes with color codes + HTML for color dots
    // This uses a special HTML format that your PDF renderer can interpret
    return markdown.replace(
      /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})\b/g,
      (match) => {
        // Create a special markdown+HTML hybrid that will render in PDF
        // We need to use an approach that works with your PDF generator
        return `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background-color:${match};margin-left:2px;"></span> ${match}`;
      }
    );
  };

export default processMarkdownWithColorDots;