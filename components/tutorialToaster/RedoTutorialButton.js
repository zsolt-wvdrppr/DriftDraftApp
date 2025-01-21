import { Button } from '@heroui/react';
import { IconRefresh } from '@tabler/icons-react';

const RedoTutorialButton = ({ onRedo }) => {
    return (
        <Button
            color="primary"
            variant="flat"
            onPress={onRedo}
            icon={<IconRefresh size={20} />}
        >
            Redo Tutorial
        </Button>
    );
};

export default RedoTutorialButton;
