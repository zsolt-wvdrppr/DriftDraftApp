"use client";
import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";

/**
 * LoadContentPlugin:
 * - Converts a markdown string to Lexical nodes using $convertFromMarkdownString.
 * - Automatically updates the editor state whenever `content` changes.
 */
export default function LoadContentPlugin({ content }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (typeof content !== "string") return;

    editor.update(() => {
      // 1) Clear the current editor content
      const root = $getRoot();
      root.clear();

      // 2) Convert from markdown -> Lexical’s internal state
      //    This automatically populates the root with the parsed nodes
      $convertFromMarkdownString(content, TRANSFORMERS);
    });
  }, [content, editor]);

  return null;
}
