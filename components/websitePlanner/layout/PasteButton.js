import React from "react";
import logger from "@/lib/logger";
import { Link } from "@nextui-org/react";
import { IconClipboard } from "@tabler/icons-react";
import { Tooltip } from 'react-tooltip';
import { htmlToPlainText, markdownToPlainText } from "@/lib/utils";
import { marked } from "marked";

// Configure marked to preserve line breaks
marked.setOptions({
    breaks: true // Converts new lines into <br> tags
});

const PasteButton = ({ value, handleChange, setError, children }) => {

    logger.debug("PasteButton value:", value);

    const handlePaste = async () => {
        try {
            // Read text from clipboard
            const pastedText = await navigator.clipboard.readText();
    
            // Convert Markdown to plain text (await the result)
            const plainText = await markdownToPlainText(pastedText);
    
            logger.debug("Pasted text:", plainText);
    
            // Append the pasted text to the existing value
            const updatedValue = `${value}${value ? "\n\n" : ""}${plainText}`;
    
            // Call the existing change handler
            handleChange({ target: { value: updatedValue } });
    
        } catch (error) {
            logger.info("Failed to read from clipboard", error);
            setError("You need to grant clipboard access in your browser to use this feature.");
        }
    };
    
    
    return (
        <div className="relative">
            <Link variant="none" id="paste-btn" className="paste-btn absolute z-10 right-0 text-neutralSnow p-2" onPress={handlePaste}>
                <IconClipboard />
            </Link>
            <Tooltip anchorSelect=".paste-btn" place="top" className="text-center" delayHide={500} delayShow={200}>
                Paste from clipboard
            </Tooltip>
            {children}
        </div>
    );
};

export default PasteButton;
