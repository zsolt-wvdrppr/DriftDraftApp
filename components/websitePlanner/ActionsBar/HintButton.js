'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@nextui-org/react';
import { useSearchParams } from 'next/navigation';

import useToastSound from '@/lib/hooks/useToastSound';

import NewHintNotifierIcon from './NewHintNotifierIcon';

import logger from '@/lib/logger';

const HintButton = ({
  hints,
  handleToast,
  animationDuration = 500, // Animation duration in ms
}) => {
  const searchParams = useSearchParams();
  const stepNumber = searchParams.get('step') || 'unknown';

  const storedHintState = JSON.parse(localStorage.getItem(`hintState-${stepNumber}`)) || {};
  const [newHintAvailable, setNewHintAvailable] = useState(storedHintState.newHintAvailable || false);
  const [isAnimating, setIsAnimating] = useState(false); // Track if animation is happening
  const [lastHints, setLastHints] = useState(storedHintState.hints || null); // Last known hints

  const playSound = useToastSound();

  // Detect hint changes and update state
  useEffect(() => {
    if (!isAnimating) {
      if (hints && hints !== lastHints) {
        setNewHintAvailable(true);
        playSound();

        localStorage.setItem(`hintState-${stepNumber}`, JSON.stringify({
          newHintAvailable: true,
          hints,
        }));
        setLastHints(hints); // Update the last known hints
        logger.info(`New hint detected for step ${stepNumber}`);
      } else if (hints === lastHints) {
        logger.info(`No new hint detected for step ${stepNumber}`);
      }
    }
  }, [hints, lastHints, stepNumber, isAnimating]);

  // Handle animation and state transitions during step changes
  useEffect(() => {
    setIsAnimating(true); // Start animation when step changes
    const timer = setTimeout(() => {
      setIsAnimating(false); // End animation after duration
    }, animationDuration);

    return () => clearTimeout(timer); // Cleanup on unmount
  }, [stepNumber, animationDuration]);

  const handleClick = () => {
    handleToast('hint');
    setNewHintAvailable(false);

    localStorage.setItem(`hintState-${stepNumber}`, JSON.stringify({
      newHintAvailable: false,
      hints: lastHints,
    }));
  };

  return (
    <div
      className={isAnimating ? 'exiting-animation-class' : 'entering-animation-class'} // Apply appropriate animation
    >
      <Button
        auto
        aria-label="Check hint"
        className={`select-none md:w-32 md:h-24 break-words md:relative bottom-0 -right-4 z-10 md:bg-transparent md:shadow-md md:right-auto flex md:border-3 md:border-transparent
          ${!hints ? 'cursor-not-allowed border-3 border-transparent border-gray-200 opacity-0' : ''}
          ${newHintAvailable ? 'border-yellow-400' : ''}`}
        disabled={!hints}
        variant="none"
        onClick={handleClick}
      >
        {hints && (
          <span
            className={`hidden md:block absolute bottom-0 ${newHintAvailable ? 'animate-pulse font-bold' : ''}`}
          >
            Check Hint
          </span>
        )}
        <NewHintNotifierIcon trigger={newHintAvailable} />
      </Button>
    </div>
  );
};

HintButton.propTypes = {
  hints: PropTypes.bool.isRequired, // Whether hints are available
  handleToast: PropTypes.func.isRequired, // Function to handle the click
  animationDuration: PropTypes.number, // Duration of animations in ms
};

export default HintButton;
