import { Button } from '@heroui/react';
import { IconRefresh } from '@tabler/icons-react';

const RedoTutorialButton = ({ onRedo }) => {
    return (
        <Button
            color="primary"
            icon={<IconRefresh size={20} />}
            variant="flat"
            onPress={onRedo}
        >
            Redo Tutorial
        </Button>
    );
};

export default RedoTutorialButton;
