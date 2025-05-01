import React from "react";
import PropTypes from "prop-types";
import { Button } from "@heroui/react";
import { useState } from "react";
import {
  IconArrowBigRight,
} from "@tabler/icons-react";

/** Previous Button Component */
export const PreviousButton = ({ disabled, onPress }) => (
  <Button
    className="md:w-32 text-primary dark:text-white border-primary dark:border-secondaryPersianGreen border-2 text-md font-bold tracking-wider flex justify-center items-center rounded-l-none rounded-br-none md:rounded-l-xl md:rounded-br-sm md:rounded-r-xl shadow-none disabled:bg-gray-300 disabled:border-gray-300 disabled:opacity-60 disabled:shadow-none disabled:text-default-100"
    disabled={disabled}
    title="Previous Section"
    variant="shadow"
    onPress={onPress}
  >
    <IconArrowBigRight className="rotate-180 scale-x-110" size={34}/>
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
      className="next-btn md:w-32 border-2 text-white shadow-none bg-primary border-primary dark:bg-secondaryPersianGreen dark:border-secondaryPersianGreen text-md font-bold tracking-wider flex justify-center items-center rounded-r-none rounded-bl-none md:rounded-bl-xl md:roudned-l-xl md:rounded-r-xl"
      disabled={isPending || isDebouncing} // Disable button during debounce
      title="Next Section"
      variant="shadow"
      onPress={handleClick}
    >
      {isPending ? "" : <IconArrowBigRight className="scale-x-110 pt-0.5 md:pt-0" size={34}/>}
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
    className="md:w-32 border-2 text-white shadow-none bg-primary border-primary dark:bg-secondaryPersianGreen dark:border-secondaryPersianGreen text-md font-bold tracking-wider flex justify-center items-center rounded-r-none rounded-bl-none md:rounded-bl-xl md:roudned-l-xl md:rounded-r-xl"
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
