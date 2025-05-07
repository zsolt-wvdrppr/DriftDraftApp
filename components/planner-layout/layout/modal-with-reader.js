"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

import logger from "@/lib/logger";

/**
 * Modal with Content Reader functionality
 * This component combines HeroUI Modal with text-to-speech capabilities
 * including pause/resume functionality with icons and improved layout
 */
export default function ModalWithReader({
  triggerButtonText = "Open Modal",
  title = "Modal Title",
  content,
  footerButtons = [],
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
  onClose: externalOnClose,
  autoPop = false,
}) {
  // Use either external control or internal state for modal open/close
  const internalDisclosure = useDisclosure();
  const {
    isOpen = externalIsOpen !== undefined ? externalIsOpen : internalDisclosure.isOpen,
    onOpen = internalDisclosure.onOpen,
    onOpenChange = externalOnOpenChange !== undefined ? externalOnOpenChange : internalDisclosure.onOpenChange,
  } = {};

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

  // Auto-open modal if autoPop is true
  useEffect(() => {
    if (autoPop && externalIsOpen === undefined) {
      onOpen();
    }
  }, [autoPop, onOpen, externalIsOpen]);

  // Ensure speech is stopped when modal closes
  useEffect(() => {
    if (!isOpen && speechState !== "idle") {
      stopReading();
    }
  }, [isOpen, speechState]);

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

      // Fallback to convert content if DOM extraction didn't work
      if (!textToRead && content) {
        if (typeof content === "string") {
          // Create a temporary div to parse HTML content
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = content;
          textToRead = tempDiv.innerText;
        } else if (typeof content === "object") {
          // Try to stringify if it's an object
          textToRead = "This content cannot be read aloud.";
        }
      }

      // Create utterance with the extracted text
      utteranceRef.current = new SpeechSynthesisUtterance(textToRead);

      // Set handlers
      utteranceRef.current.onstart = () => setSpeechState("playing");
      utteranceRef.current.onend = () => setSpeechState("idle");
      utteranceRef.current.onerror = (event) => {
        // Ignore "interrupted" errors which happen when we cancel speech
        if (event.error !== "interrupted") {
          logger.error("Speech synthesis error:", event);
        }
        setSpeechState("idle");
      };

      // Start speaking
      synthRef.current.speak(utteranceRef.current);
      setSpeechState("playing");
    } catch (error) {
      logger.error("Speech synthesis error:", error);
      setSpeechState("idle");
    }
  };

  const pauseReading = () => {
    if (typeof window === "undefined" || !synthRef.current) return;

    try {
      synthRef.current.pause();
      setSpeechState("paused");
    } catch (error) {
      logger.error("Error pausing speech:", error);
    }
  };

  const resumeReading = () => {
    if (typeof window === "undefined" || !synthRef.current) return;

    try {
      synthRef.current.resume();
      setSpeechState("playing");
    } catch (error) {
      logger.error("Error resuming speech:", error);
    }
  };

  const stopReading = () => {
    if (typeof window === "undefined" || !synthRef.current) return;

    try {
      synthRef.current.cancel();
      // Clear the utterance reference to avoid the interrupted error
      utteranceRef.current = null;
      setSpeechState("idle");
    } catch (error) {
      logger.error("Error stopping speech:", error);
    }
  };

  const handleClose = () => {
    if (speechState !== "idle") {
      stopReading();
    }

    if (externalOnClose) {
      externalOnClose();
    }
  };

  // Render speech control buttons with Tabler icons
  const renderSpeechControls = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return null;

    switch (speechState) {
      case "playing":
        return (
          <div className="flex gap-2">
            <Button color="primary" onPress={pauseReading} className="h-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-player-pause-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" strokeWidth="0" fill="currentColor"></path>
                <path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" strokeWidth="0" fill="currentColor"></path>
              </svg>
              <span className="ml-1">Pause</span>
            </Button>
            <Button color="danger" onPress={stopReading} className="h-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-player-stop-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M17 4h-10a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3 -3v-10a3 3 0 0 0 -3 -3z" strokeWidth="0" fill="currentColor"></path>
              </svg>
              <span className="ml-1">Stop</span>
            </Button>
          </div>
        );
      case "paused":
        return (
          <div className="flex gap-2">
            <Button color="success" onPress={resumeReading} className="h-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-player-play-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" strokeWidth="0" fill="currentColor"></path>
              </svg>
              <span className="ml-1">Resume</span>
            </Button>
            <Button color="danger" onPress={stopReading} className="h-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-player-stop-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                <path d="M17 4h-10a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3 -3v-10a3 3 0 0 0 -3 -3z" strokeWidth="0" fill="currentColor"></path>
              </svg>
              <span className="ml-1">Stop</span>
            </Button>
          </div>
        );
      case "idle":
      default:
        return (
          <Button color="primary" onPress={startReading} className="h-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-volume" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
              <path d="M15 8a5 5 0 0 1 0 8"></path>
              <path d="M17.7 5a9 9 0 0 1 0 14"></path>
              <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5"></path>
            </svg>
            <span className="ml-1">Read Aloud</span>
          </Button>
        );
    }
  };

  return (
    <>
      {/* Only show trigger button if not externally controlled and not autoPop */}
      {externalIsOpen === undefined && !autoPop && (
        <Button onPress={onOpen}>{triggerButtonText}</Button>
      )}

      <Modal
        backdrop="opaque"
        classNames={{
          wrapper: "z-[100]",
          backdrop: "z-[60] bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
          base: "sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl", // Responsive widths
        }}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        scrollBehavior="inside" // Ensure scrollable content
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
                  <h3 className="text-xl font-semibold">{title}</h3>
                  {/* Speech controls positioned near the title */}
                  {typeof window !== "undefined" && window.speechSynthesis && renderSpeechControls()}
                </div>
              </ModalHeader>
              <ModalBody>
                <div ref={contentRef} className="max-h-[60vh] overflow-y-auto">
                  {typeof content === "string" ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  ) : (
                    content
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                {footerButtons.length > 0 ? (
                  footerButtons.map((btnProps, index) => (
                    <Button key={index} {...btnProps} />
                  ))
                ) : (
                  <Button
                    color="danger"
                    variant="light"
                    onPress={() => {
                      handleClose();
                      onClose();
                    }}
                  >
                    Close
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}