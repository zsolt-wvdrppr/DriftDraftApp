import React from "react";

export const withColorCode = (Component) => {
  const WrappedComponent = ({ children, ...props }) => {
    const processContent = (content) => {
      if (typeof content !== "string") return content;

      // Regex to match hex color codes
      return content.replace(
        /#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})/g,
        (match) =>
          `<span class="inline-flex items-center gap-1">
            <span class="inline-block w-3 h-3 rounded-full drop-shadow-md" style="background-color: ${match};"></span>
            ${match}
          </span>`
      );
    };

    // Process all string children using dangerouslySetInnerHTML
    const processedChildren = React.Children.map(children, (child) => {
      if (typeof child === "string") {
        return <span dangerouslySetInnerHTML={{ __html: processContent(child) }} />;
      }
      
      return child;
    });

    return <Component {...props}>{processedChildren}</Component>;
  };

  WrappedComponent.displayName = `WithColorCode(${Component.displayName || Component.name || "Component"})`;

  return WrappedComponent;
};

export default withColorCode;
