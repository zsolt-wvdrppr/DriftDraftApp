"use client"; // Required when using useState and useTransition

import { Button } from '@nextui-org/react';
import { useSessionContext } from '@/lib/SessionProvider';
import { useRouter } from 'next/navigation';
import { IconEraser } from '@tabler/icons-react';
import logger from '@/lib/logger';
import { useTransition } from 'react';

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
        <Button 
            onPress={handlePress}
            className='flex flex-col items-center self-end h-16 gap-2'
            isDisabled={isPending}
        >
            <IconEraser size={30} className="text-secondary" />
        </Button>
    );
};

export default RestartSessionBtn;
