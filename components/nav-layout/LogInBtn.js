import { Button } from '@nextui-org/react';
import { IconPower } from "@tabler/icons-react";

const LogInBtn = ({onPress}) => {
    return (
        <Button onPress={onPress}>
            Login
            <IconPower className="text-success" />
        </Button>
    )
}

export default LogInBtn