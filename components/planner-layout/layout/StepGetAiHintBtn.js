import React, { useState } from 'react';
import { Button } from '@heroui/react';
import { IconAi, IconBulb } from '@tabler/icons-react';
import { useReCaptcha } from "next-recaptcha-v3";

import logger from '@/lib/logger';
import { fetchAIHint } from '@/lib/fetchAIHint';

export const StepGetAiHintBtn = ({
    prompt, 
    isAIAvailable, 
    setAiHint, 
    setUserMsg, 
    stepNumber, 
    content, 
    sessionData, 
    updateFormData, 
    setError
}) => {

    const { executeRecaptcha } = useReCaptcha();

    const [isPending, setIsPending] = useState(false);

    const handleFetchHint = async () => {
        if (!isAIAvailable) {
            setError('AI hint is currently unavailable due to incomplete fields.');
            
            return;
        }

        setIsClicked(true);
        
        try {
            setIsPending(true);
            logger.debug('Fetching AI hint with prompt:', prompt);
            await fetchAIHint({
                stepNumber,
                prompt,
                content,
                setAiHint,
                setUserMsg,
                sessionData,
                updateFormData,
                executeRecaptcha,
            });
        } catch (error) {
            logger.error('Error fetching AI hint:', error);
            setError('Error fetching AI hint. Please try again.');
        } finally {
            setIsPending(false);
        }
    };

    const [isClicked, setIsClicked] = useState(false);

    return (
        <div className="get-ai-hint-btn flex relative justify-end mb-4 mt-0">
            <Button
                className={`${!isAIAvailable ? "hidden" : "flex"} items-center gap-2`}
                color="primary"
                isLoading={isPending}
                onPress={handleFetchHint}
            >
                <IconBulb className={`text-warning ${isClicked ? "" : "animate-bounce"}`} size={20} />
                Get AI Hint
            </Button>
            <Button
                className={`${isAIAvailable ? "hidden" : "flex"} items-center gap-2 opacity-50 hover:!opacity-50`}
                color="primary"
                isLoading={isPending}
                onPress={() => setError('Please fill in all required fields before getting an AI hint.')}
            >
                <IconAi size={20} />
                Get AI Hint
            </Button>
        </div>
    );
};

export default StepGetAiHintBtn;