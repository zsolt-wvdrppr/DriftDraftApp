"use client";

import { useState } from "react";
import { marked } from "marked";
import { toast } from "sonner";

const useClipboard = () => {
  const [isPending, setIsPending] = useState(false);

  const copyToClipboard = async (content) => {
    setIsPending(true);
    try {
      const htmlContent = marked.parse(content);
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([htmlContent], { type: "text/html" }),
          "text/plain": new Blob([content], { type: "text/plain" }),
        }),
      ]);
      toast.success("Text copied to clipboard", {
        duration: 2000,
        classNames: { toast: "text-green-600 w-fit" }
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
      toast.error("Failed to copy content.");
    } finally {
      setIsPending(false);
    }
  };

  return { copyToClipboard, isPending };
};

export default useClipboard;
