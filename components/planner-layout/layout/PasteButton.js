import React from "react";
import { Link } from "@heroui/react";
import { IconClipboard } from "@tabler/icons-react";
import { Tooltip } from 'react-tooltip';
import { marked } from "marked";

import { markdownToPlainText } from "@/lib/utils/utils";
import logger from "@/lib/logger";

// Configure marked to preserve line breaks
marked.setOptions({
    breaks: true // Converts new lines into <br> tags
});

const PasteButton = ({ value, handleChange, setError, children }) => {

    const handlePaste = async () => {
        try {
            // Read text from clipboard
            const pastedText = await navigator.clipboard.readText();
    
            // Convert Markdown to plain text (await the result)
            const plainText = await markdownToPlainText(pastedText);
    
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
            <Link className="paste-btn absolute z-10 right-10 text-secondary dark:text-neutralSnow p-2" id="paste-btn" variant="none" onPress={handlePaste}>
                <IconClipboard size={27} />
            </Link>
            {children}
            <Tooltip anchorSelect=".paste-btn" className="text-center" delayHide={500} delayShow={200} place="bottom">
                Paste from clipboard
            </Tooltip>
        </div>
    );
};

export default PasteButton;
