"use client";

import { useState, useEffect } from "react";

import { motion } from "framer-motion";
import Stagger from "@/components/stagger";
import clsx from "clsx";
import logger from "@/lib/logger";

const CalloutText = ({
  classNames = {
    wrapper: "bg-primary bg-opacity-80",
    base: "text-lg bg-opacity-80 from-brandPink via-highlightPurple to-transparent",
    text: "text-white text-lg",
  },
  text = "",
  disappear = true,
}) => {
  logger.debug("CalloutText rendered with text:", classNames.text);

  const [phase, setPhase] = useState("in");

  useEffect(() => {
    if (!disappear) return;

    const timer1 = setTimeout(() => setPhase("visible"), 1); // After slide in
    const timer2 = setTimeout(() => setPhase("out"), 1000); // After 2s visible
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div
      className={clsx(
        `relative mx-auto text-center border-l-1 border-transparent p-4 rounded-lg overflow-hidden`,
        classNames.wrapper
      )}
    >
      {/* Animated left border - slides in from right */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-1 bg-brand-secondary"
        initial={{ x: "100vw", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100vw", opacity: 0 }}
        transition={{
          duration: 0.8,
          ease: "easeInOut",
          delay: 0.2,
        }}
      />

      {/* Animated gradient background - follows the border */}
      <motion.div
        className={clsx(
          `absolute inset-0 bg-gradient-to-r rounded-r-lg`,
          classNames.base
        )}
        initial={{ x: "100%", opacity: 0 }}
        animate={
          phase === "in" ? { x: 0, opacity: 1 }
          : phase === "visible" ?
            { x: 0, opacity: 1 }
          : { x: "-150%", opacity: 0 }
        }
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      {/* Text with stagger - starts after border animation */}
      <div className="relative z-10">
        <Stagger delay={400}>
          <p
            className={`duration-500 ease-in-out transition-all ${classNames.text} ${phase === "visible" ? "brightness-0 invert" : ""}`}
            style={{
              transitionDelay: disappear ? `${0.3}s` : "0s",
            }}
          >
            {text.toString()}
          </p>
        </Stagger>
      </div>
    </div>
  );
};

export default CalloutText;
