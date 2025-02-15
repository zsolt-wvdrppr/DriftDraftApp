import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@heroui/react';
import { IconZoomQuestionFilled } from '@tabler/icons-react';

const WhyWeAskButton = ({ whyDoWeAsk, handleToast }) => {
  return (
    <Button
      auto
      aria-label="Why do we ask?"
      className={`select-none bottom-0 -left-4 z-10 md:bg-transparent md:shadow-md md:relative md:left-auto md:w-32 md:h-24 flex border-3 border-transparent dark:md:border-1 dark:md:border-content1 
        ${!whyDoWeAsk ? 'cursor-not-allowed border border-gray-200 opacity-0' : ''}`}
      disabled={!whyDoWeAsk}
      variant="none"
      onPress={() => handleToast('why')}
    >
      {whyDoWeAsk && (
        <span className="hidden absolute bottom-0 dark:md:bottom-1 md:block">
          Why We Ask
        </span>
      )}
      <IconZoomQuestionFilled
        className="dark:text-white text-accentMint"
        size={28}
      />
    </Button>
  );
};

// Define PropTypes for the component
WhyWeAskButton.propTypes = {
  whyDoWeAsk: PropTypes.bool.isRequired, // Whether the feature is enabled
  handleToast: PropTypes.func.isRequired, // Function to handle the click
};

export default WhyWeAskButton;
