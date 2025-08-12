"use client";

import { LoadScript } from "@react-google-maps/api";

const libraries = ["places"]; // Add any libraries you need

export default function GoogleMapsProvider({ children }) {
  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
      loadingElement={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      {children}
    </LoadScript>
  );
}