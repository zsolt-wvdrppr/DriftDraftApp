import React, { useState } from 'react';
import { Button } from '@nextui-org/react';
import { IconAi } from '@tabler/icons-react';
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
    const [isPending, setIsPending] = useState(false);

    const handleFetchHint = async () => {
        if (!isAIAvailable) {
            setError('AI hint is currently unavailable due to incomplete fields.');
            return;
        }
        
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
            });
        } catch (error) {
            logger.error('Error fetching AI hint:', error);
            setError('Error fetching AI hint. Please try again.');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="flex relative justify-end mb-4 mt-0">
            <Button
                color="primary"
                isLoading={isPending}
                onPress={handleFetchHint}
                className={`${!isAIAvailable ? "hidden" : "flex"} items-center gap-2`}
            >
                <IconAi size={20} />
                Get AI Hint
            </Button>
            <Button
                color="primary"
                isLoading={isPending}
                onPress={() => setError('Please fill in all required fields before getting an AI hint.')}
                className={`${isAIAvailable ? "hidden" : "flex"} items-center gap-2 opacity-50 hover:!opacity-50`}
            >
                <IconAi size={20} />
                Get AI Hint
            </Button>
        </div>
    );
};

export default StepGetAiHintBtn;