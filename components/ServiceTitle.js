"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import { title } from "@/components/primitives";
import { homePageContent } from "@/content/pages/homePageContent";

import CalloutText from "./callout-text";

const ServiceTitle = () => {

  const hero = homePageContent.hero;


  return (
    <div className="relative max-w-sm text-left justify-start min-w-max rounded-xl flex flex-col items-start sm:gap-y-1 -z-10">
      <span className={`${title({ color: "violet" })} p-0 sm:pb-1.5`}>
        {hero.headline.line1}
      </span>
      <span className={`${title({ color: "blue" })} p-0 sm:pb-1.5`}>
        {hero.headline.line2}
      </span>
      <span className={`${title({ color: "blue" })} p-0 sm:pb-1.5`}>
        {hero.headline.line3}
      </span>
      <CalloutText
        classNames={{
          wrapper: "pt-2 sm:pt-3 -ml-3.5",
          base: "bg-opacity-80 from-brandPink via-highlightPurple to-transparent",
          text: `text-medium text-zinc-500 text-lg sm:text-xl md:text-2xl lg:text-2xl font-semibold`,
        }}
        text={hero.headline.line4}
      />
    </div>
  );
};

export default ServiceTitle;
