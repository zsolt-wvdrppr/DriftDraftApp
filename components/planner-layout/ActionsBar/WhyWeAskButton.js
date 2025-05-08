import React from "react";
import PropTypes from "prop-types";
import { Button } from "@heroui/react";
import { IconZoomQuestionFilled } from "@tabler/icons-react";

const WhyWeAskButton = ({ whyDoWeAsk, handleToast }) => {
  return (
    <div className="flex flex-col justify-center items-center">
      <button
        aria-label="Why do we ask?"
        className={`why-we-ask-btn select-none relative inline-flex items-center justify-center p-0.5 me-2 overflow-hidden transition-all rounded-full duration-200 text-sm font-medium text-gray-900 group bg-gradient-to-br from-primary/80 to-secondaryTeal/80 grup-ohover:from-secondaryPersianGreen group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-accentMint/20 dark:focus:ring-secondaryPersianGreen/55 
        ${!whyDoWeAsk ? "cursor-not-allowed border border-gray-200 opacity-0" : ""}`}
        disabled={!whyDoWeAsk}
        title={"Why do we ask?"}
        variant="none"
        onClick={(e) => {
          e.preventDefault();
          handleToast("why");
        }}
      >
        <span
          className={`relative transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-full group-hover:bg-transparent group-hover:dark:bg-transparent flex`}
        >
          <div className="h-full w-full p-1 md:px-2.5 md:py-2.5 transition-colors duration-200">
          <IconZoomQuestionFilled
            className="group-hover:text-white dark:text-white  text-primary/80"
            size={32}
          />
          </div>
        </span>
      </button>
      {whyDoWeAsk && (
        <span className="hidden md:block text-sm mt-2 text-primary dark:text-slate-200">
          Why We Ask
        </span>
      )}
    </div>
  );
};

// Define PropTypes for the component
WhyWeAskButton.propTypes = {
  whyDoWeAsk: PropTypes.bool.isRequired, // Whether the feature is enabled
  handleToast: PropTypes.func.isRequired, // Function to handle the click
};

export default WhyWeAskButton;
