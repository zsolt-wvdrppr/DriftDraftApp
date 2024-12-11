'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@nextui-org/react';
import NewHintNotifierIcon from './NewHintNotifierIcon';
import useToastSound from '@/lib/hooks/useToastSound';

const HintButton = ({
  hints,
  handleToast,
}) => {

  const [newHintAvailable, setNewHintAvailable] = useState(false);
  const playSound = useToastSound();

  // Track changes to `hints` and show the indicator
  useEffect(() => {
    if (hints) {
      setNewHintAvailable(true);
      playSound();
    }
  }, [hints]);

  return (
    <Button
      auto
      aria-label="Check hint"
      className={`select-none md:w-32 md:h-24 break-words md:relative bottom-0 -right-4 z-10 md:bg-transparent md:shadow-md md:right-auto flex md:border-3 md:border-transparent
        ${!hints ? 'cursor-not-allowed border-3 border-transparent border-gray-200 opacity-0' : ''}
        ${newHintAvailable ? 'border-yellow-400' : ''}`}
      disabled={!hints}
      variant="none"
      onClick={() => {
        handleToast('hint');
        setNewHintAvailable(false)
      }}
    >
      {hints && (
        <span
          className={`hidden md:block absolute bottom-0 ${newHintAvailable ? 'animate-pulse font-bold' : ''
            }`}
        >
          Check Hint
        </span>
      )}
      <NewHintNotifierIcon trigger={newHintAvailable} />
    </Button>
  );
};

// Define PropTypes for the component
HintButton.propTypes = {
  hints: PropTypes.bool.isRequired, // Whether hints are available
  handleToast: PropTypes.func.isRequired, // Function to handle the click
};

export default HintButton;
