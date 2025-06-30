// components/common/TableOfContents.jsx
"use client";

import React from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { IconList } from "@tabler/icons-react";

const TableOfContents = ({
  headers = [],
  title = "Table of Contents",
  className = "",
  showIcon = true,
  variant = "bordered", // "bordered" | "flat" | "none"
}) => {
  if (!headers || headers.length === 0) return null;

  const scrollToHeader = (headerId) => {
    const element = document.getElementById(headerId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  const renderContent = () => (
    <div className="space-y-1">
      {headers.map((header) => (
        <Button
          key={header.id}
          variant="light"
          size="sm"
          className={`justify-start h-auto py-2 px-3 text-left w-full ${
            header.level === 1 ?
              "font-medium text-gray-900 dark:text-gray-100"
            : "text-gray-600 dark:text-gray-400 ml-4"
          }`}
          onPress={() => scrollToHeader(header.id)}
        >
          <span className="text-sm leading-relaxed">{header.title}</span>
        </Button>
      ))}
    </div>
  );

  // Render with card wrapper
  if (variant !== "none") {
    return (
      <Card
        className={`mb-6 ${className}`}
        shadow={variant === "bordered" ? "sm" : "none"}
      >
        <CardBody className="p-4">
          <div className="flex items-center gap-2 mb-3 h-12 w-fit">
            {showIcon && <IconList className="w-6 h-6 text-primary mr-4" />}
            <h3 className="font-semibold text-lg text-gray-600 dark:text-gray-300 m-0">
              {title}
            </h3>
          </div>
          <nav>{renderContent()}</nav>
        </CardBody>
      </Card>
    );
  }

  // Render without card wrapper
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        {showIcon && <IconList className="w-4 h-4 text-primary" />}
        <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-300">
          {title}
        </h3>
      </div>
      <nav>{renderContent()}</nav>
    </div>
  );
};

export default TableOfContents;
