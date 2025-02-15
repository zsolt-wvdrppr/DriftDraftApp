import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@heroui/react';
import { useState } from 'react';
import { IconCaretRight, IconCaretLeft, IconAutomation } from '@tabler/icons-react';

/** Previous Button Component */
export const PreviousButton = ({ disabled, onPress }) => (
  <Button
    className="relative w-32 border border-secondaryTeal text-md font-bold tracking-wider flex justify-center disabled:bg-gray-300 disabled:border-none"
    color="secondary"
    disabled={disabled}
    variant="shadow"
    onPress={onPress}
  >
    <IconCaretLeft className="min-w-4  scale-y-125 absolute left-0 opacity-50" />
    <span>Previous</span>
  </Button>
);

PreviousButton.propTypes = {
  disabled: PropTypes.bool.isRequired, // Whether the button is disabled
  onPress: PropTypes.func.isRequired, // Function to call on click
};

/** Next Button Component */
export const NextButton = ({ isPending, onPress, debounceDelay = 500 }) => {
  const [isDebouncing, setIsDebouncing] = useState(false);

  const handleClick = () => {
    if (isDebouncing || isPending) return;

    setIsDebouncing(true);
    onPress(); // Execute the passed callback

    setTimeout(() => {
      setIsDebouncing(false); // Reset debounce after the delay
    }, debounceDelay);
  };

  return (
    <Button
      className="w-32 border border-secondaryTeal text-md font-bold tracking-wider flex justify-center items-center"
      color="secondary"
      disabled={isPending || isDebouncing} // Disable button during debounce
      variant="shadow"
      onPress={handleClick}
    >
      {isPending ? 'Loading...' : 'Next'}
      <IconCaretRight className="min-w-6 scale-y-125 absolute right-0 opacity-50"/>
    </Button>
  );
};

NextButton.propTypes = {
  isPending: PropTypes.bool.isRequired, // Whether the button shows a loading state
  onPress: PropTypes.func.isRequired, // Function to call on click
};

/** Submit Button Component */
export const SubmitButton = ({ isPending, onPress }) => (
  <Button
    className="w-32 border border-secondaryTeal font-bold tracking-wider"
    color="secondary"
    disabled={isPending}
    variant="shadow"
    onPress={onPress}
  >
    {isPending ? 'Processing...' : 'Process'}
    <IconAutomation className="min-w-6 absolute right-1 opacity-50"/>
  </Button>
);

SubmitButton.propTypes = {
  isPending: PropTypes.bool.isRequired, // Whether the button shows a loading state
  onPress: PropTypes.func.isRequired, // Function to call on click
};
