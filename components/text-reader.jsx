"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/react";
import { cn } from "@/lib/utils/utils";

/**
 * TextReader component - Wraps text elements and adds read-aloud functionality
 * Can be used to make any paragraph or text element speak its content
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to wrap and read aloud
 * @param {string} props.className - Additional classes for the container
 * @param {boolean} props.compact - Use compact mode with smaller control buttons
 * @param {boolean} props.autoHighlight - Highlight text while reading (experimental)
 */
export default function TextReader({ 
  children, 
  className = "", 
  compact = false,
  autoHighlight = false,
  placement = "left",
}) {
  // Speech synthesis state
  const [speechState, setSpeechState] = useState("idle"); // "idle", "playing", "paused"
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const contentRef = useRef(null);

  // Initialize speech synthesis on client-side only
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }

    // Cleanup on unmount
    return () => {
      if (typeof window !== "undefined" && synthRef.current) {
        try {
          synthRef.current.cancel();
          // Clear the utterance reference to avoid the interrupted error
          utteranceRef.current = null;
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
    };
  }, []);

  const startReading = () => {
    if (typeof window === "undefined" || !synthRef.current) return;

    try {
      // If paused, just resume
      if (speechState === "paused") {
        resumeReading();
        return;
      }

      // Cancel any existing speech
      synthRef.current.cancel();

      // Get actual rendered content from the DOM
      let textToRead = "";

      if (contentRef.current) {
        // Extract text from the rendered DOM
        textToRead = contentRef.current.innerText || "";
      }

      if (!textToRead) {
        console.warn("No text content found to read");
        return;
      }

      // Create utterance with the extracted text
      utteranceRef.current = new SpeechSynthesisUtterance(textToRead);

      // Set handlers
      utteranceRef.current.onstart = () => {
        setSpeechState("playing");
        if (autoHighlight && contentRef.current) {
          contentRef.current.classList.add("bg-blue-50", "dark:bg-blue-900/30");
        }
      };
      
      utteranceRef.current.onend = () => {
        setSpeechState("idle");
        if (autoHighlight && contentRef.current) {
          contentRef.current.classList.remove("bg-blue-50", "dark:bg-blue-900/30");
        }
      };
      
      utteranceRef.current.onerror = (event) => {
        // Ignore "interrupted" errors which happen when we cancel speech
        if (event.error !== "interrupted") {
          console.error("Speech synthesis error:", event);
        }
        setSpeechState("idle");
        if (autoHighlight && contentRef.current) {
          contentRef.current.classList.remove("bg-blue-50", "dark:bg-blue-900/30");
        }
      };

      // Start speaking
      synthRef.current.speak(utteranceRef.current);
      setSpeechState("playing");
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setSpeechState("idle");
    }
  };

  const pauseReading = () => {
    if (typeof window === "undefined" || !synthRef.current) return;

    try {
      synthRef.current.pause();
      setSpeechState("paused");
    } catch (error) {
      console.error("Error pausing speech:", error);
    }
  };

  const resumeReading = () => {
    if (typeof window === "undefined" || !synthRef.current) return;

    try {
      synthRef.current.resume();
      setSpeechState("playing");
    } catch (error) {
      console.error("Error resuming speech:", error);
    }
  };

  const stopReading = () => {
    if (typeof window === "undefined" || !synthRef.current) return;

    try {
      synthRef.current.cancel();
      // Clear the utterance reference to avoid the interrupted error
      utteranceRef.current = null;
      setSpeechState("idle");
      
      if (autoHighlight && contentRef.current) {
        contentRef.current.classList.remove("bg-blue-50", "dark:bg-blue-900/30");
      }
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  };

  // Determine the sizes for buttons based on compact mode
  const buttonSize = compact ? "size-8" : "h-8";
  const iconSize = compact ? 18 : 20;
  const textClass = compact ? "sr-only" : "ml-1 text-sm";

  // Render speech controls with Tabler icons
  const renderSpeechControls = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;

     switch (speechState) {
          case "playing":
            return (
              <div className="flex justify-end gap-2">
                <Button className="h-7 p-2" variant="bordered" onPress={pauseReading}>
                  <svg className="icon icon-tabler icon-tabler-player-pause-filled" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0z" fill="none" stroke="none" />
                    <path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" fill="currentColor" strokeWidth="0" />
                    <path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" fill="currentColor" strokeWidth="0" />
                  </svg>
                  <span className="ml-1 text-xs">Pause</span>
                </Button>
                <Button className="h-7 p-2" variant="bordered" onPress={stopReading}>
                  <svg className="icon icon-tabler icon-tabler-player-stop-filled" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0z" fill="none" stroke="none" />
                    <path d="M17 4h-10a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3 -3v-10a3 3 0 0 0 -3 -3z" fill="currentColor" strokeWidth="0" />
                  </svg>
                  <span className="ml-1 text-xs">Stop</span>
                </Button>
              </div>
            );
          case "paused":
            return (
              <div className="flex justify-end gap-2">
                <Button className="h-7 p-2" variant="bordered" onPress={resumeReading}>
                  <svg className="icon icon-tabler icon-tabler-player-play-filled" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0z" fill="none" stroke="none" />
                    <path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" fill="currentColor" strokeWidth="0" />
                  </svg>
                  <span className="ml-1 text-xs">Resume</span>
                </Button>
                <Button className="h-7 p-2" variant="bordered" onPress={stopReading}>
                  <svg className="icon icon-tabler icon-tabler-player-stop-filled" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 0h24v24H0z" fill="none" stroke="none" />
                    <path d="M17 4h-10a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3 -3v-10a3 3 0 0 0 -3 -3z" fill="currentColor" strokeWidth="0" />
                  </svg>
                  <span className="ml-1 text-xs">Stop</span>
                </Button>
              </div>
            );
          case "idle":
          default:
            return (
              <Button className="h-7 min-w-0 p-2 w-fit self-end" color="primary" onPress={startReading}>
                <svg className="icon icon-tabler icon-tabler-volume" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h24v24H0z" fill="none" stroke="none" />
                  <path d="M15 8a5 5 0 0 1 0 8" />
                  <path d="M17.7 5a9 9 0 0 1 0 14" />
                  <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
                </svg>
                <span className="ml-1 text-sm">Read Aloud</span>
              </Button>
            );
        }
  };

  return (
    <div className={`text-reader ${className}`}>
      {/* Control bar */}
      <div className={`flex mb-2 ${placement === "left" ? "justify-start" : placement === "right" ? "justify-end" : placement === "center" ? "justify-center" : placement}`}>
        {typeof window !== "undefined" && window.speechSynthesis && renderSpeechControls()}
      </div>
      
      {/* Content container */}
      <div 
        ref={contentRef} 
        className={`text-reader-content transition-colors duration-200 flex justify-stretch flex-wrap ${
          autoHighlight && speechState === "playing" ? "bg-blue-50 dark:bg-blue-900/30" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}