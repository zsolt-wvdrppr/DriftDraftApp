import { Link, Button } from '@nextui-org/react';
import { IconPower } from "@tabler/icons-react";

const LogOutBtn = ({user, onPress}) => {
    return (
        <>
            <p className="text-primary dark:text-slate-200 text-xs px-4 flex flex-col"><span>Logged in:</span><span className="">{user.email}</span></p>
            <Button as={Link} onPress={onPress}>
                Logout
                <IconPower className="text-danger" />
            </Button>
        </>
    )
}

export default LogOutBtn