"use client";

import { Link } from "@heroui/react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

const References = ({ contentList = [] }) => {
  if (!contentList || contentList.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 p-4 bg-default-50 rounded-lg border border-default-200">
      <h3 className="text-sm mt-0 font-semibold text-neutralDark mb-3 uppercase tracking-wide">
        References
      </h3>
      <div className="space-y-2">
        {contentList.map((reference, index) => (
          <div key={index} className="flex items-start gap-2">
            <span className="text-xs text-default-500 mt-1 min-w-[20px]">
              [{index + 1}]
            </span>
            <div className="flex-1">
              <Link
                href={reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary-600 transition-colors"
                data-tooltip-id={`reference-${index}`}
                data-tooltip-html={`
                  <div class="max-w-xs">
                    <div class="font-semibold mb-1">${reference.text}</div>
                    <div class="text-xs text-gray-300">${reference.url}</div>
                  </div>
                `}
              >
                {reference.text}
              </Link>
              <Tooltip
                id={`reference-${index}`}
                place="top"
                className="bg-default-900 border-1 border-zinc-700"
                style={{
                  backgroundColor: "rgb(15 15 15)",
                  color: "white",
                  borderRadius: "6px",
                  fontSize: "12px",
                  maxWidth: "300px",
                  zIndex: 9999,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default References;
