import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CodeNode } from "@lexical/code";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { TextNode } from "lexical";

const editorTheme = {
    code: "editor-code",
    heading: {
      h1: "editor-heading-h1",
      h2: "editor-heading-h2",
      h3: "editor-heading-h3",
      h4: "editor-heading-h4",
      h5: "editor-heading-h5",
    },
    image: "editor-image",
    link: "editor-link",
    list: {
      listitem: "editor-listitem",
      nested: {
        listitem: "editor-nested-listitem",
      },
      ol: "editor-list-ol",
      ul: "editor-list-ul",
    },
    ltr: "ltr",
    paragraph: "editor-paragraph",
    placeholder: "editor-placeholder",
    quote: "editor-quote",
    rtl: "rtl",
    text: {
      bold: "editor-text-bold",
      code: "editor-text-code",
      hashtag: "editor-text-hashtag",
      italic: "editor-text-italic",
      overflowed: "editor-text-overflowed",
      strikethrough: "editor-text-strikethrough",
      underline: "editor-text-underline",
      underlineStrikethrough: "editor-text-underlineStrikethrough",
    },
  };

  const onError = (error) => {
    try {
      if (error && error.message) {
        logger.error("Lexical error:", error.message);
      } else {
        logger.error("Unknown Lexical error occurred.", error);
      }
    } catch (err) {
      logger.error("Error in the Lexical error handler itself:", err);
    }
  };

  export const initialConfig = {
    namespace: "MyEditor",
    theme: editorTheme,
    onError,
    // 👇 Register your extra node types here
    nodes: [
      ListNode,
      ListItemNode,
      HeadingNode,
      QuoteNode,
      CodeNode,
      LinkNode,
      TextNode,
      // Add any others you need
    ],
  };

  export default initialConfig;