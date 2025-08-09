"use client";

import { useEffect, useState } from "react";
import useDarkMode from "@/lib/hooks/useDarkMode";
import logger from "@/lib/logger";

const BlueprintBackground = ({
  opacity = 0.08,
  gridSize = 50,
  majorLineFrequency = 5,
  showCircles = true,
  showMeasurements = true,
}) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const darkMode = useDarkMode();

  logger.debug("darkMode", darkMode);

  useEffect(() => {
    // Suppress scroll warnings for background elements
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.("auto-scroll behavior")) return;
      originalWarn(...args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Colors based on mode
  const lineColor = darkMode ? "#FFFFFF" : "#05668d";
  const circleColor = darkMode ? "#FFFFFF" : "#05668d";
  const measurementColor = darkMode ? "#FFFFFF" : "#000000";

  // Calculate grid lines
  const horizontalLines = [];
  const verticalLines = [];
  const circles = [];
  const measurements = [];

  if (dimensions.width > 0 && dimensions.height > 0) {
    // Create horizontal lines
    for (let y = 0; y <= dimensions.height; y += gridSize) {
      const isMajorLine = y % (gridSize * majorLineFrequency) === 0;
      horizontalLines.push(
        <line
          key={`h-${y}`}
          x1="0"
          y1={y}
          x2={dimensions.width}
          y2={y}
          stroke={lineColor}
          strokeWidth={isMajorLine ? 0.8 : 0.5}
          strokeOpacity={isMajorLine ? opacity * 1.5 : opacity}
          strokeDasharray={isMajorLine ? "none" : "5,5"}
        />
      );
    }

    // Create vertical lines
    for (let x = 0; x <= dimensions.width; x += gridSize) {
      const isMajorLine = x % (gridSize * majorLineFrequency) === 0;
      verticalLines.push(
        <line
          key={`v-${x}`}
          x1={x}
          y1="0"
          x2={x}
          y2={dimensions.height}
          stroke={lineColor}
          strokeWidth={isMajorLine ? 0.8 : 0.5}
          strokeOpacity={isMajorLine ? opacity * 1.5 : opacity}
          strokeDasharray={isMajorLine ? "none" : "5,5"}
        />
      );

      // Add measurements for major lines
      if (showMeasurements && isMajorLine) {
        measurements.push(
          <text
            key={`m-${x}`}
            x={x + 15}
            y={490}
            fill={measurementColor}
            fontSize="15"
            opacity={opacity * 1.5}
          >
            {x}
          </text>
        );
      }
    }

    // Add circles at major intersections
    if (showCircles) {
      for (
        let x = gridSize * majorLineFrequency;
        x <= dimensions.width;
        x += gridSize * majorLineFrequency
      ) {
        for (
          let y = gridSize * majorLineFrequency;
          y <= dimensions.height;
          y += gridSize * majorLineFrequency
        ) {
          // Only show circles at some intersections for a more varied look
          if ((x + y) % (gridSize * majorLineFrequency * 2) === 0) {
            circles.push(
              <circle
                key={`c-${x}-${y}`}
                cx={x}
                cy={y}
                r={14}
                stroke={circleColor}
                strokeWidth="0.5"
                fill="none"
                opacity={opacity * 1.5}
              />
            );
          } else if ((x + y) % (gridSize * majorLineFrequency) === 0) {
            circles.push(
              <circle
                key={`c-${x}-${y}`}
                cx={x}
                cy={y}
                r={1.5}
                fill={circleColor}
                opacity={opacity * 1.5}
              />
            );
          }
        }
      }
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        {horizontalLines}
        {verticalLines}
        {circles}
        {measurements}

        {/* Add a few dotted "flow path" lines */}
        <path
          d="M100,150 C200,50 400,300 600,200"
          stroke={lineColor}
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="2,8"
          opacity={opacity * 0.8}
        />

        <path
          d="M300,500 C500,400 700,450 900,300"
          stroke={lineColor}
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="2,8"
          opacity={opacity * 0.8}
        />
      </svg>
    </div>
  );
};

export default BlueprintBackground;
