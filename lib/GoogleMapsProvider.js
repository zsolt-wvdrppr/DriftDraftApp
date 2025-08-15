"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";

const libraries = ["places"];

// Global singleton state
let isGoogleMapsLoaded = false;
let loadingPromise = null;
let googleMapsInstance = null;

// Context for sharing the loaded state
const GoogleMapsContext = createContext(null);

export const useGoogleMaps = () => {
  const context = useContext(GoogleMapsContext);

  return context;
};

// Singleton loader function
const loadGoogleMaps = () => {
  if (loadingPromise) {
    return loadingPromise;
  }

  if (typeof window !== "undefined" && window.google && window.google.maps) {
    isGoogleMapsLoaded = true;
    googleMapsInstance = { isLoaded: true, google: window.google };

    return Promise.resolve(googleMapsInstance);
  }

  loadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=${libraries.join(",")}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isGoogleMapsLoaded = true;
      googleMapsInstance = { isLoaded: true, google: window.google };
      resolve(googleMapsInstance);
    };

    script.onerror = () => {
      const error = new Error("Failed to load Google Maps");

      loadingPromise = null; // Reset so we can try again
      reject(error);
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
};

export default function GoogleMapsProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(() => {
    // Initialize with current state if already loaded
    return isGoogleMapsLoaded;
  });
  const [loadError, setLoadError] = useState(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // If already loaded, set state immediately
    if (isGoogleMapsLoaded && googleMapsInstance) {
      setIsLoaded(true);

      return;
    }

    // Load Google Maps
    loadGoogleMaps()
      .then(() => {
        setIsLoaded(true);
      })
      .catch((error) => {
        setLoadError(error);
      });
  }, []);

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Failed to load Google Maps</div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <GoogleMapsContext.Provider value={googleMapsInstance}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

// Lightweight wrapper that doesn't show loading states
export function GoogleMapsWrapper({ children, fallback = null }) {
  const [isReady, setIsReady] = useState(() => isGoogleMapsLoaded);

  useEffect(() => {
    if (isGoogleMapsLoaded) {
      setIsReady(true);

      return;
    }

    loadGoogleMaps()
      .then(() => setIsReady(true))
      .catch(() => setIsReady(false));
  }, []);

  if (!isReady) {
    return fallback;
  }

  return (
    <GoogleMapsContext.Provider value={googleMapsInstance}>
      {children}
    </GoogleMapsContext.Provider>
  );
}
