import { useCallback } from 'react';

const useRedoTutorial = (localStorageKey, restartTutorial) => {
    const redoTutorial = useCallback(() => {
        localStorage.removeItem(localStorageKey); // Clear tutorial completion flag
        restartTutorial(); // Restart the tutorial
    }, [localStorageKey, restartTutorial]);

    return { redoTutorial };
};

export default useRedoTutorial;
