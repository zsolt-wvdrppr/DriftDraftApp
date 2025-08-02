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
    <div className="max-w-sm text-center justify-center min-w-max rounded-xl backdrop-blur-sm flex flex-col items-center gap-y-1">
      <span className={`${title({ color: "violet" })} pb-1.5`}>
        Get a Strategic&nbsp;
      </span>

      <AnimatePresence mode="wait">
        <motion.span
          key={words[currentWordIndex]}
          animate={{ opacity: 1, y: 0 }}
          className={`${title({ color: "blue" })} pb-1.5`}
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
          wrapper: "pt-2",
          base: "text-lg bg-opacity-80 from-brandPink via-highlightPurple to-transparent",
          text: `text-zinc-500 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold`,
        }}
        text={"that turns visitors into customers"}
      />
    </div>
  );
};

export default ServiceTitle;
