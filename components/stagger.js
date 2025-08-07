"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { motion, useAnimate, stagger, useInView } from "framer-motion";
import clsx from "clsx";

import logger from "@/lib/logger";

const extractTextAndClassNames = (children) => {
  const extracted = [];

  React.Children.forEach(children, (child) => {
    if (typeof child === "string") {
      extracted.push({ text: child, className: "" });
    } else if (child.props && child.props.children) {
      const nestedChildren = extractTextAndClassNames(child.props.children);

      nestedChildren.forEach((nested) => {
        extracted.push({
          text: nested.text,
          className:
            `${child.props.className || ""} ${nested.className}`.trim(),
        });
      });
    } else {
      extracted.push({
        text: child.props.children,
        className: child.props.className || "",
      });
    }
  });

  return extracted;
};

const splitTextToSpans = (text, className) => {

  //logger.debug("Stagger: step 1 splitTextToSpans called with text:", text, "and className:", className);

  const removeCapitalization = (text) => {
    // If className includes "capitalize", remove the world "capitalize " by replacing it with a "" and return the new string
    let newText = text;

    if (className.includes("capitalize")) {

      //logger.debug("Stagger: step 2 removeCapitalization called with text:", text, "and className:", className);

      newText = text.replace("capitalize", "");
    }

    //logger.debug("Stagger: step 3 removeCapitalization called with className:", className, "result:", newText);

    return newText;
  };

  // Find index of first non-space characters of each word
  const firstNonSpaceIndex = text.search(/\S/);

  let indexesOfFirstCharacters = [];

  if (firstNonSpaceIndex === -1) {
    // If it's a first character of a word, find it's index and push it to the array
    text.split(/\s/).forEach((word, index) => {
      if (word.length > 0) {
        indexesOfFirstCharacters.push(index);
      }
    });
  }

  return text.split(/\s/).map((word, wordIndex) => (
    <span
      key={`word-${wordIndex}`}
      className={removeCapitalization(className)}
      style={{ display: "inline-block", marginRight: "0.25em" }}
    >
      {word.split("").map((char, charIndex) => {
        // If className includes "capitalize", capitalize the first letter of each word by checking if it's after
        const _char =
          className.includes("capitalize") && charIndex === 0 ?
            char.toUpperCase()
          : char;

        //logger.debug(`Stagger: char: ${_char}, wordIndex: ${wordIndex}, charIndex: ${charIndex}, className: ${className}`);
        
        return (
          <span
            key={`char-${wordIndex}-${charIndex}`}
            style={{ display: "inline-block", opacity: 0 }}
          >
            {_char === " " ? "\u00A0" : _char}
          </span>
        );
      })}
    </span>
  ));
};

const Stagger = ({ children, className, delay = 0 }) => {
  const [scope, animate] = useAnimate();
  const ref = useRef(null); // Create a ref for the element
  const isInView = useInView(ref, { once: true }); // Track visibility with useInView

  // Trigger animation when the element is in view and the DOM is ready
  useEffect(() => {
    if (isInView && scope.current) {
      setTimeout(() => {
        animate("span", { opacity: 1, x: 30 }, { delay: stagger(0.02) });
      }, delay || 0);
    }
  }, [isInView, animate, delay, scope]);

  const animatedElements = useMemo(() => {
    return extractTextAndClassNames(children).flatMap((item) =>
      splitTextToSpans(item.text, item.className)
    );
  }, [children]);

  if (animatedElements.length === 0) {
    return null; // Return null if no elements to animate
  }

  return (
    <motion.div
      ref={ref} // Attach the ref for useInView
      className={clsx("translate-x-[-60px]", className)}
    >
      <div ref={scope}>
        {" "}
        {/* Attach the scope ref to the parent of the spans */}
        {animatedElements}
      </div>
    </motion.div>
  );
};

export default Stagger;
