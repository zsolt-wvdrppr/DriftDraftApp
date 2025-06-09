"use client";

import React, { useState, useEffect } from "react";
import { Button, Link } from "@heroui/react";

const WaasPromo = () => {
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
        <p className="font-semibold">Website as a Service (WaaS)</p>
        <p>
          {`Professional websites from £83/month. No massive upfront investment.`}
        </p>
        <Link
          href="https://wavedropper.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more at wavedropper.com
        </Link>
      </div>
    </div>
  );
};

export default WaasPromo;
