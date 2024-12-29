import React, { useState, useEffect } from "react";
import logger from "@/lib/logger";
import { Button } from "@nextui-org/react";
import { IconClipboard } from "@tabler/icons-react";
import { Tooltip } from 'react-tooltip';

const PasteButton = ({ value, handleChange, setError, children }) => {

    const handlePaste = async () => {
        try {
            // Read text from clipboard
            const pastedText = await navigator.clipboard.readText();

            // Append the pasted text to the existing value
            const updatedValue = `${value}${value ? "\n\n" : ""}${pastedText}`;

            // Call the existing change handler to ensure everything syncs properly
            handleChange({ target: { value: updatedValue } });

            // Show the tooltip temporarily and hide it after 5 seconds
            Tooltip.hide(document.querySelector('.paste-btn'), { delayHide: 5000 });

        } catch (error) {
            
            logger.info("Failed to read from clipboard", error);
            setError("You need to grant clipboard access in your browser to use this feature.");
        }
    };

    return (
        <div className="relative">
            <Button id="paste-btn" className="paste-btn absolute z-10 right-0" onPress={handlePaste}>
                <IconClipboard />
            </Button>
            <Tooltip anchorSelect=".paste-btn" place="top" className="text-center" delayHide={200} delayShow={100}>
                Paste from clipboard
            </Tooltip>
            {children}
        </div>
    );
};

export default PasteButton;
