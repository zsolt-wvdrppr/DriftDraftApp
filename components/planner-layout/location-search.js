"use client";

import { useState } from "react";
import { Autocomplete } from "@react-google-maps/api";
import { Input } from "@heroui/react";
import { IconMapPin } from "@tabler/icons-react";

const LocationSearch = ({ onSelect, defaultValue = "" }) => {
  const [autocomplete, setAutocomplete] = useState(null);
  const [query, setQuery] = useState(defaultValue);

  const handleLoad = (auto) => {
    setAutocomplete(auto);
  };

  const handlePlaceChanged = () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();

    if (place?.formatted_address) {
      setQuery(place.formatted_address);

      // Extract necessary details
      const locationData = {
        address: place.formatted_address,
      };

      onSelect?.(locationData);
    }
  };

  const handleClear = () => {
    setQuery("");
    // Update form data to global when location is cleared
    const globalLocationData = {
      address: "global",
    };

    onSelect?.(globalLocationData);
  };

  const handleFocus = () => {
    setQuery("");
    // Update form data to global when user focuses to select new location
    const globalLocationData = {
      address: "global",
    };

    onSelect?.(globalLocationData);
  };

  return (
    <div className="relative w-full max-w-md">
      <Autocomplete
        options={{
          types: ["(regions)"],
        }}
        onLoad={handleLoad}
        onPlaceChanged={handlePlaceChanged}
      >
        <Input
          isClearable
          aria-label="Business area"
          classNames={{
            base: "p-1",
            label: "!text-primary dark:!text-accentMint",
            inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border`,
          }}
          label="Business area for competitor search"
          placeholder="Search location..."
          startContent={
            <IconMapPin className="h-5 text-primary dark:text-accentMint opacity-70 ml-[-3px]" />
          }
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={handleClear}
          onFocus={handleFocus}
        />
      </Autocomplete>
    </div>
  );
};

export default LocationSearch;
