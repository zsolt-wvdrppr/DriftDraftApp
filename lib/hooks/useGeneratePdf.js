import { useState } from 'react';

import processMarkdownWithColorDots from '@/lib/utils/process-markdown-with-color-dots';
import { generateTableOfContents, stripSectionMarkers } from '@/lib/utils/markdownUtils';

export const useGeneratePdf = () => {
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const generatePdf = async (
    markdownContent = `# Hello, World!`,
    title,
    fileName = 'document.pdf',
    includeToc = true
  ) => {
    setIsPdfGenerating(true);

    try {
      const processedMarkdown = processMarkdownWithColorDots(markdownContent);
      
      // Generate TOC data if requested
      let tocData = null;

      if (includeToc) {
        // Strip section markers before generating TOC
        const cleanContent = stripSectionMarkers(markdownContent);

        tocData = generateTableOfContents(cleanContent);
      }

      // Send Markdown content and TOC to the server-side route
      const response = await fetch('/api/generatePdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          markdownContent: processedMarkdown, 
          title,
          tocData 
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();

        throw new Error(`Failed to generate PDF: ${errorMessage}`);
      }

      // Retrieve the PDF file as a blob
      const blob = await response.blob();

      // Trigger browser download
      const link = document.createElement('a');

      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating PDF:', error.message);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  return { generatePdf, isPdfGenerating };
};