"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import { title } from "@/components/primitives";

import CalloutText from "./callout-text";

const ServiceTitle = () => {
  const words = ["Website", "Landing Page"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 5000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative max-w-sm text-left justify-start min-w-max rounded-xl flex flex-col items-start sm:gap-y-1 -z-10">
      <span className={`${title({ color: "violet" })} p-0 sm:pb-1.5`}>
        Get a Strategic&nbsp;
      </span>

      <AnimatePresence mode="wait">
        <motion.span
          key={words[currentWordIndex]}
          animate={{ opacity: 1, y: 0 }}
          className={`${title({ color: "blue" })} p-0 sm:pb-1.5`}
          exit={{ opacity: 0, y: 10 }}
          initial={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          {words[currentWordIndex]}&nbsp;
        </motion.span>
      </AnimatePresence>
      <span className={`${title({ color: "blue" })}`}>Blueprint&nbsp;</span>
      <CalloutText
        classNames={{
          wrapper: "pt-2 sm:pt-3 -ml-3.5",
          base: "bg-opacity-80 from-brandPink via-highlightPurple to-transparent",
          text: `text-medium text-zinc-500 text-lg sm:text-xl md:text-2xl lg:text-2xl font-semibold`,
        }}
        text={"That Actually Works for Your Business"}
      />
    </div>
  );
};

export default ServiceTitle;
