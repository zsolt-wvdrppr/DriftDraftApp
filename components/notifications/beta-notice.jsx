"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@heroui/react";

const BetaNotice = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (isVisible === false) return null;

  return (
    <div className="relative">
      <div className="relative overflow-hidden mx-2 backdrop-blur-sm bg-yellow-100/20 border-l-4 border-yellow-400/60 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-100 p-4 rounded-xl text-sm max-w-3xl self-center mt-6">
        <Button
          className="absolute top-0 -right-1 min-w-0 px-2 min-h-0 h-6 bg-yellow-400 text-yellow-800 rounded-t-none rounded-br-none"
          onPress={() => setIsVisible(false)}
          aria-label="Close Beta Notice"
          title="Close Beta Notice"
        >
          close
        </Button>
        <p className="font-semibold">Beta Notice</p>
        <p>
          {`This app is currently in beta.`}
        </p>
        <p className="mt-2">
          {`Spotted something odd? Feel free to use the feedback form.`}
        </p>
      </div>
    </div>
  );
};

export default BetaNotice;
