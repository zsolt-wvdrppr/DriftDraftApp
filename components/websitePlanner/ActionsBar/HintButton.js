'use client';

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@nextui-org/react';
import { useSearchParams } from 'next/navigation';

import useToastSound from '@/lib/hooks/useToastSound';
import logger from '@/lib/logger';

import NewHintNotifierIcon from './NewHintNotifierIcon';
import { useSessionContext } from '@/lib/SessionProvider';
import { useCompareStrings } from '@/lib/hooks/useCompareStrings';

const HintButton = ({
  hints,
  handleToast,
  animationDuration = 500, // Animation duration in ms
}) => {
  const searchParams = useSearchParams();
  const stepNumber = searchParams.get('step') || 'unknown';
  const { sessionData, updateFormData } = useSessionContext();
  const storedHintState = sessionData?.formData?.[stepNumber]?.lastHint;
  const storedNewHintAvailable = sessionData?.formData?.[stepNumber]?.newHintAvailable || false;
  const [newHintAvailable, setNewHintAvailable] = useState(storedNewHintAvailable); // Track if new hint is available
  const [isAnimating, setIsAnimating] = useState(false); // Track if animation is happening
  const [lastHints, setLastHints] = useState(sessionData?.formData?.[stepNumber]?.lastHint || ""); // Last known hints
  const { calculateSimilarity } = useCompareStrings();
  const playSound = useToastSound();

  // Detect hint changes and update state
  useEffect(() => {
    if (!isAnimating) {
      logger.debug(`HintButton: hints=${hints}, lastHints=${lastHints}`);
      // stringified hints to avoid circular updates
      const _hints = JSON.stringify(hints);
      const _lastHints = JSON.stringify(lastHints);

      const similarity = calculateSimilarity(_hints, _lastHints);
      logger.debug(`Hint similarity: ${similarity}`);
      logger.debug(similarity < 0.9)
      if (hints && lastHints && similarity < 90) {
        playSound();

        // Update global state and local state
        updateFormData("newHintAvailable", true);
        setNewHintAvailable(true);

        logger.debug(`New hint detected for step ${stepNumber}`);
      } else {
        logger.debug(`No new hint detected for step ${stepNumber}`);
        setNewHintAvailable(false);
      }
    }
  }, [hints, stepNumber, isAnimating]);

  useEffect(() => {

    const _hints = JSON.stringify(hints);
    const _lastHints = JSON.stringify(lastHints);

    const similarity = calculateSimilarity(_hints, _lastHints);
    if (hints && lastHints && similarity < 90) {
      // Avoid circular updates
      //updateFormData("lastHint", hints); // Update global state
      setLastHints(hints); // Update local state
      setNewHintAvailable(true);
    }
  }, [hints, lastHints]);

  

  const handleClick = () => {
    handleToast('hint');
    setNewHintAvailable(false);
    //setLastHints(hints);
    updateFormData("newHintAvailable", false);
  };

  useEffect(() => {
    if (newHintAvailable) {
      updateFormData("lastHint", hints);
    }
    logger.debug(`HintButton: new Hint Available=${newHintAvailable}`);
  }, [newHintAvailable]);


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
        onPress={handleClick}
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
