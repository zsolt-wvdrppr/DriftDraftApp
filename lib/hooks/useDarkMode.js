import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const updateDarkMode = () => {
      // ✅ Check if `dark` class is applied to <html>
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    // ✅ Run check on mount
    updateDarkMode();

    // ✅ Observe changes to <html> class attribute
    const observer = new MutationObserver(updateDarkMode);

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return isDarkMode;
}

export default useDarkMode;