'use client';

import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@heroui/react';
import { useSearchParams } from 'next/navigation';

import useToastSound from '@/lib/hooks/useToastSound';
import logger from '@/lib/logger';
import { useSessionContext } from '@/lib/SessionProvider';

import NewHintNotifierIcon from './NewHintNotifierIcon';

const HintButton = ({
  hints: hint,
  handleToast,
  animationDuration = 500, // Animation duration in ms
}) => {
  const { sessionData, updateFormData } = useSessionContext();
  const searchParams = useSearchParams();
  const stepNumber = searchParams.get('step') || 'unknown';
  const [newHintAvailable, setNewHintAvailable] = useState(false); // Track if new hint is available
  const [lastHint, setLastHint] = useState(sessionData?.formData?.[stepNumber]?.lastHint || ""); // Last known hints
  const playSound = useToastSound();

  const hintsChanged = useMemo(() => {
    logger.debug(`HintButton: hints=${hint}, lastHints=${lastHint}`);
    logger.debug(`HintButton: hintsChanged=${JSON.stringify(hint) !== JSON.stringify(lastHint)}`);
    if (!hint) return false;

    return JSON.stringify(hint) !== JSON.stringify(lastHint);
  }, [hint, lastHint]);
  

  // Detect hint changes and update state
  useEffect(() => {
    if (hintsChanged) {
      setNewHintAvailable(true);
      playSound();
    }
  }, [hint, sessionData]);

  const handleClick = () => {
    handleToast('hint');
    logger.debug('HintButton: handleClick');
    setNewHintAvailable(false);
    setLastHint(hint);
  };  

  useEffect(() => {
    updateFormData("newHintAvailable", newHintAvailable);
  }, [newHintAvailable]);

  useEffect(() => {
    updateFormData("lastHint", lastHint);
  }, [lastHint]);

  return (
      <Button
        auto
        aria-label="Check hint"
        className={`check-hint-btn select-none md:w-32 md:h-24 break-words md:relative bottom-0 -right-4 z-10 md:bg-transparent md:shadow-md dark:md:border-1 dark:md:border-content1 md:right-auto flex md:border-3 md:border-transparent
          ${!hint ? 'cursor-not-allowed border-3 border-transparent opacity-40' : ''}`}
        disabled={!hint}
        title={hint ? 'Check hint' : 'Not Available'}
        variant="none"
        onPress={handleClick}
      >
        
          <span
            className={`hidden md:block absolute bottom-0 dark:md:bottom-1 ${newHintAvailable ? 'animate-pulse font-bold' : ''}`}
          >
            {hint ? "Check Hint" : "Not Available"}
          </span>
   
        <NewHintNotifierIcon trigger={newHintAvailable} />
      </Button>
  );
};

HintButton.propTypes = {
  hints: PropTypes.bool.isRequired, // Whether hints are available
  handleToast: PropTypes.func.isRequired, // Function to handle the click
  animationDuration: PropTypes.number, // Duration of animations in ms
};

export default HintButton;
