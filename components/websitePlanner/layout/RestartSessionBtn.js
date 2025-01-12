"use client"; // Required when using useState and useTransition

import { Button } from '@nextui-org/react';
import { useSessionContext } from '@/lib/SessionProvider';
import { useRouter } from 'next/navigation';
import { IconEraser } from '@tabler/icons-react';
import logger from '@/lib/logger';
import { useTransition } from 'react';
import { Tooltip } from 'react-tooltip';

const RestartSessionBtn = () => {
    const { startNewSession } = useSessionContext();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handlePress = () => {
        startTransition(() => {
            logger.info("Starting new session...");
            startNewSession();
            router.push('/website-planner?step=0');
        });
    };

    return (
        <>
            <Button
                id="restart-session"
                onPress={handlePress}
                className='flex flex-col items-center self-end h-16 gap-2'
                isDisabled={isPending}
            >
                <IconEraser size={30} className="text-secondary" />
            </Button>
            <Tooltip anchorSelect="#restart-session" place="top">
                Start a new session
            </Tooltip>
        </>
    );
};

export default RestartSessionBtn;
