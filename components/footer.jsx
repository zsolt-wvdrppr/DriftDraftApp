"use client";

import React, { useState } from "react";
import WavedropperSignature from "@/components/WavedropperSignature";
import { Divider, Link } from "@heroui/react";

const Footer = () => {
  
  return (
    <footer className="p-2 w-full flex flex-col items-center gap-y-4 pt-10 pb-4 text-gray-600 text-sm">
      <Divider />

      {/* Privacy & T&C */}
      <div className="flex gap-x-4 justify-between">
        <Link
          href="https://wavedropper.com/privacy"
          isExternal
          underline="hover"
          className="text-default-500 text-sm text-center"
        >
          Privacy Policy
        </Link>
        <Link
          href="https://wavedropper.com/terms"
          isExternal
          underline="hover"
          className="text-default-500 text-sm text-center"
        >
          Terms & Conditions
        </Link>
        <Link
          href="/cookies"
          underline="hover"
          className="text-default-500 text-sm text-center"
        >
          Cookie Policy
        </Link>
      </div>

      {/* reCAPTCHA Disclaimer (smaller and less prominent) */}
      <p className="max-w-2xl text-center text-gray-500 text-xs">
        This site is protected by reCAPTCHA and subject to the{" "}
        <Link
          href="https://policies.google.com/privacy"
          isExternal
          underline="hover"
          className="text-xs text-default-700"
        >
          Google Privacy Policy
        </Link>{" "}
        and{" "}
        <Link
          href="https://policies.google.com/terms"
          isExternal
          underline="hover"
          className="text-xs text-default-700"
        >
          Terms of Service
        </Link>
        .
      </p>

      <WavedropperSignature />

    </footer>
  );
};

export default Footer;
