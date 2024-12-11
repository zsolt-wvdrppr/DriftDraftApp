import useSound from "use-sound";
import { useRef } from "react";

export const useToastSound = () => {
    const [play] = useSound("/sounds/notification-toast.mp3", { volume: 0.5 });
    const isPlayingRef = useRef(false);

    const playSound = () => {
        if (!isPlayingRef.current) {
            isPlayingRef.current = true;
            play();

            // Reset the guard after the sound duration
            setTimeout(() => {
                isPlayingRef.current = false;
            }, 1000); // Adjust the timeout to the sound's duration in milliseconds
        }
    };

    return playSound;
};

export default useToastSound;
