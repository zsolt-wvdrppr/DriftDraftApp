import { Link, Button } from '@nextui-org/react';
import { IconPower } from "@tabler/icons-react";
import { useSessionContext } from '@/lib/SessionProvider';
import { useRouter } from 'next/navigation';

import logger from '@/lib/logger';

const LogOutBtn = ({user, onPress}) => {

    const { logOutUser } = useSessionContext();
    const router = useRouter();

    const handleClick = () => {
        logger.info("Logging out...");
        onPress();
        logOutUser();
        router.push('/login');
    }

    return (
        <>
            <p className="text-primary dark:text-slate-200 text-xs px-4 flex flex-col"><span>Logged in:</span><span className="">{user.email}</span></p>
            <Button as={Link} onPress={handleClick}>
                Logout
                <IconPower className="text-danger" />
            </Button>
        </>
    )
}

export default LogOutBtn