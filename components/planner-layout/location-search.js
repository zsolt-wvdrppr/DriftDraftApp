'use client';

import { useState } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Input } from '@heroui/react';
import { IconMapPin } from '@tabler/icons-react';

const LocationSearch = ({ onSelect }) => {
  const [autocomplete, setAutocomplete] = useState(null);
  const [query, setQuery] = useState('');

  const handleLoad = (auto) => {
    setAutocomplete(auto);
  };

  const handlePlaceChanged = () => {
    if (!autocomplete) return;
  
    const place = autocomplete.getPlace();

    if (place?.formatted_address) {
      setQuery(place.formatted_address);
  
      // Extract necessary details, replacing utc_offset with utc_offset_minutes
      const locationData = {
        address: place.formatted_address,
      };
  
      onSelect?.(locationData);
    }
  };
  

  return (
    <div className="relative w-full max-w-md my-4">
      <Autocomplete onLoad={handleLoad} onPlaceChanged={handlePlaceChanged}>
        <Input
        aria-label= "Business area"
        classNames={{
            label: "!text-primary dark:!text-accentMint",
            input: ``,
            inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border`,
          }}
          label= "Business area for competitor search"
          placeholder="Search location..."
          startContent={<IconMapPin className='h-5 text-primary dark:text-accentMint opacity-70 ml-[-3px]' />}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </Autocomplete>
    </div>
  );
};

export default LocationSearch;
