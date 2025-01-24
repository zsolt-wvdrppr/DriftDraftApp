export const useGeneratePdf = () => {
    const generatePdf = async (markdownContent = `# Hello, World!`, title, fileName = 'document.pdf') => {

      try {
        // Send Markdown content to the server-side route
        const response = await fetch('/api/generatePdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markdownContent, title }),
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
      }
    };
  
    return { generatePdf };
  };
  