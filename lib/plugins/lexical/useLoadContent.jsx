"use client";
import { useEffect, useState } from "react";
import { $getRoot } from "lexical";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";

/**
 * useLoadContent Hook:
 * - Converts a markdown string to Lexical nodes using $convertFromMarkdownString.
 * - Automatically updates the editor state whenever `content` changes.
 * 
 * @param {Object} editor - Lexical editor instance.
 * @param {string} content - Markdown content to load into the editor.
 */
export const useLoadContent = (editor, content) => {

    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isLoaded) return;
        if (!editor || typeof content !== "string") return;

        editor.update(() => {
            const root = $getRoot();
            root.clear();
            $convertFromMarkdownString(content, TRANSFORMERS);
        });

        setIsLoaded(true);
        
    }, [editor, content]);
};

export default useLoadContent;