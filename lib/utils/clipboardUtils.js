// lib/utils/clipboardUtils.js
import { markdownToPlainText } from "@/lib/utils/utils";
import logger from "@/lib/logger";

 export const handlePaste = async (currentValue, setError = () => {}) => {
    try {
      // Read text from clipboard
      const pastedText = await navigator.clipboard.readText();

      logger.debug("Pasted clipboard text:", pastedText);

      // Convert Markdown to plain text (await the result)
      const plainText = await markdownToPlainText(pastedText);

      // Append the pasted text to the existing value
      const updatedValue = `${currentValue}${currentValue ? "\n\n" : ""}${plainText}`;

      logger.debug("Updated value from clipboard:", updatedValue);

      return updatedValue;
    } catch (error) {
      logger.info("Failed to read from clipboard", error);
      setError(
        "You need to grant clipboard access in your browser to use this feature."
      );

      return currentValue; // Return unchanged value on error
    }
  };

export const handlePasteEvent = async (e, localValue, handleTextareaChange, setError = () => {}) => {
  try {
    e.preventDefault();
    
    // Read text from clipboard
    const pastedText = await navigator.clipboard.readText();
    
    // Convert Markdown to plain text
    const plainText = await markdownToPlainText(pastedText);
    
    if (plainText) {
      const textarea = e.target;
      
      // Focus the textarea to ensure it's the active element
      textarea.focus();
      
      // Try execCommand first (maintains undo history)
      if (document.execCommand && document.execCommand('insertText', false, plainText)) {
        // execCommand succeeded - it automatically maintains undo history
        logger.debug("Used execCommand for paste - undo history maintained");
        
        // Update React state to match the DOM
        handleTextareaChange({ target: { value: textarea.value } });
      } else {
        // Fallback: manual insertion (undo won't work)
        logger.debug("execCommand not available, using manual insertion");
        
        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        const currentValue = textarea.value;
        
        const newValue = 
          currentValue.slice(0, selectionStart) + 
          plainText + 
          currentValue.slice(selectionEnd);
        
        // Update the textarea value
        textarea.value = newValue;
        
        // Set cursor position after inserted text
        const newCursorPos = selectionStart + plainText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        
        // Update React state
        handleTextareaChange({ target: { value: newValue } });
      }
    }
  } catch (error) {
    logger.info("Failed to read from clipboard", error);
    setError("Failed to process the pasted content.");
  }
};