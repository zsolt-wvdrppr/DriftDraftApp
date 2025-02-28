import React from "react";
import PropTypes from "prop-types";
import { Button } from "@heroui/react";
import { useState } from "react";
import {
  IconArrowBigRight,
  IconCaretLeft,
  IconAutomation,
} from "@tabler/icons-react";
import { Icon } from "@iconify-icon/react/dist/iconify.js";

/** Previous Button Component */
export const PreviousButton = ({ disabled, onPress }) => (
  <Button
    className="relative w-32 border border-secondaryTeal text-md text-white/80 font-bold tracking-wider flex justify-center disabled:bg-gray-300 disabled:border-none rounded-r-sm"
    color="secondary"
    disabled={disabled}
    title="Previous Section"
    variant="shadow"
    onPress={onPress}
  >
    <IconArrowBigRight className="rotate-180 scale-x-150" size={34}/>
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
      className="w-32 border text-white/80 border-secondaryTeal text-md font-bold tracking-wider flex justify-center items-center rounded-l-sm"
      color="secondary"
      disabled={isPending || isDebouncing} // Disable button during debounce
      title="Next Section"
      variant="shadow"
      onPress={handleClick}
    >
      {isPending ? "" : <IconArrowBigRight className="scale-x-150" size={34}/>}
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
    className="w-32 border border-secondaryTeal text-md font-bold tracking-wider flex justify-center items-center rounded-l-sm"
    color="secondary"
    disabled={isPending}
    isLoading={isPending}
    title="Genearte a plan"
    variant="shadow"
    onPress={onPress}
  >
    {isPending ? "" : "Process"}
  </Button>
);

SubmitButton.propTypes = {
  isPending: PropTypes.bool.isRequired, // Whether the button shows a loading state
  onPress: PropTypes.func.isRequired, // Function to call on click
};
