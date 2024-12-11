import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@nextui-org/react';
import { useState } from 'react';

/** Previous Button Component */
export const PreviousButton = ({ disabled, onClick }) => (
  <Button
    className="w-32 border border-secondaryTeal font-bold tracking-wider disabled:bg-gray-300 disabled:border-none"
    color="secondary"
    disabled={disabled}
    variant="shadow"
    onClick={onClick}
  >
    Previous
  </Button>
);

PreviousButton.propTypes = {
  disabled: PropTypes.bool.isRequired, // Whether the button is disabled
  onClick: PropTypes.func.isRequired, // Function to call on click
};

/** Next Button Component */
export const NextButton = ({ isPending, onClick, debounceDelay = 500 }) => {
  const [isDebouncing, setIsDebouncing] = useState(false);

  const handleClick = () => {
    if (isDebouncing || isPending) return;

    setIsDebouncing(true);
    onClick(); // Execute the passed callback

    setTimeout(() => {
      setIsDebouncing(false); // Reset debounce after the delay
    }, debounceDelay);
  };

  return (
    <Button
      className="w-32 border border-secondaryTeal font-bold tracking-wider"
      color="secondary"
      disabled={isPending || isDebouncing} // Disable button during debounce
      variant="shadow"
      onClick={handleClick}
    >
      {isPending ? 'Loading...' : 'Next'}
    </Button>
  );
};

NextButton.propTypes = {
  isPending: PropTypes.bool.isRequired, // Whether the button shows a loading state
  onClick: PropTypes.func.isRequired, // Function to call on click
};

/** Submit Button Component */
export const SubmitButton = ({ isPending, onClick }) => (
  <Button
    className="w-32 border border-secondaryTeal font-bold tracking-wider"
    color="secondary"
    disabled={isPending}
    variant="shadow"
    onClick={onClick}
  >
    {isPending ? 'Submitting...' : 'Submit'}
  </Button>
);

SubmitButton.propTypes = {
  isPending: PropTypes.bool.isRequired, // Whether the button shows a loading state
  onClick: PropTypes.func.isRequired, // Function to call on click
};
