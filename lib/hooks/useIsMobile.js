import { useState, useEffect } from 'react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Define the media query for small screens
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    // Function to update the isMobile state
    const handleResize = () => {
      setIsMobile(mediaQuery.matches);
    };

    // Initial check
    handleResize();

    // Listen for changes in screen size
    mediaQuery.addEventListener('change', handleResize);

    // Cleanup listener on unmount
    return () => {
      mediaQuery.removeEventListener('change', handleResize);
    };
  }, []);

  return isMobile;
}

/* how to use

const isMobile = useIsMobile();

*/

export default useIsMobile;
