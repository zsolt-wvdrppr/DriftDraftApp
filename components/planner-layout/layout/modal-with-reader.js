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
  Slider,
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
    isOpen = externalIsOpen !== undefined ? externalIsOpen : (
      internalDisclosure.isOpen
    ),
    onOpen = internalDisclosure.onOpen,
    onOpenChange = externalOnOpenChange !== undefined ? externalOnOpenChange : (
      internalDisclosure.onOpenChange
    ),
  } = {};

  // Speech synthesis state
  const [speechState, setSpeechState] = useState("idle"); // "idle", "playing", "paused"
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const contentRef = useRef(null);
  // Voice selection state
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1); // 0.5 to 2
  const [pitch, setPitch] = useState(1); // 0 to 2
  const [showVoiceOptions, setShowVoiceOptions] = useState(false);

  // Initialize speech synthesis on client-side only
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;

      // Load available voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();

        if (voices.length > 0) {
          setAvailableVoices(voices);

          // Try to find a good default voice
          const preferredVoice = findPreferredVoice(voices);

          setSelectedVoice(preferredVoice);
        }
      };

      // Chrome and some browsers need this event
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      // Initial load attempt
      loadVoices();
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

  // Find the most natural sounding voice available
  const findPreferredVoice = (voices) => {
    // First try to find a premium/enhanced voice
    const premiumVoices = voices.filter((voice) => {
      const name = voice.name.toLowerCase();

      return (
        // Enhanced voices typically have these markers
        name.includes("premium") ||
        name.includes("enhanced") ||
        name.includes("neural") ||
        // Specific high-quality voices
        name.includes("samantha") || // High quality US voice (often on macOS)
        name.includes("daniel") || // High quality UK voice (often on macOS)
        name.includes("google") || // Google's voices are usually better quality
        name.includes("microsoft") || // Microsoft's voices can be good quality
        name.includes("natural")
      );
    });

    if (premiumVoices.length > 0) {
      // Prefer English voices if available among premium voices
      const englishPremiumVoice = premiumVoices.find((v) =>
        v.lang.startsWith("en-")
      );

      return englishPremiumVoice || premiumVoices[0];
    }

    // Next, try to find any English voice
    const englishVoices = voices.filter((voice) =>
      voice.lang.startsWith("en-")
    );

    if (englishVoices.length > 0) {
      return englishVoices[0];
    }

    // Fall back to the first available voice
    return voices[0];
  };

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

      // Experimental: Add some subtle pause punctuation enhancement
      // This can make some voices sound more natural with their pacing
      textToRead = textToRead.replace(/[.]/g, ". ");
      textToRead = textToRead.replace(/[,]/g, ", ");
      textToRead = textToRead.replace(/[!]/g, "! ");
      textToRead = textToRead.replace(/[?]/g, "? ");

      // Check if using a Google voice - they have character limits
      const isGoogleVoice =
        selectedVoice && selectedVoice.name.toLowerCase().includes("google");

      if (isGoogleVoice && textToRead.length > 200) {
        // Split the text into sentences for Google voices
        // This helps prevent the voice from stopping mid-sentence
        speakTextInChunks(textToRead);
      } else {
        // Create utterance with the extracted text
        utteranceRef.current = new SpeechSynthesisUtterance(textToRead);

        // Apply voice settings if a voice is selected
        if (selectedVoice) {
          utteranceRef.current.voice = selectedVoice;
        }

        // Apply rate and pitch
        utteranceRef.current.rate = rate;
        utteranceRef.current.pitch = pitch;

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
      }
    } catch (error) {
      logger.error("Speech synthesis error:", error);
      setSpeechState("idle");
    }
  };

  // Render voice selection dropdown
  const renderVoiceSelector = () => {
    return (
      <div className="relative inline-block text-left w-full">
        <button
          className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
          type="button"
          onClick={() => {
            const voicesMenu = document.getElementById("voices-menu");

            if (voicesMenu) {
              voicesMenu.classList.toggle("hidden");
            }
          }}
        >
          {selectedVoice ? selectedVoice.name.substring(0, 15) : "Select Voice"}
          <svg
            aria-hidden="true"
            className="-mr-1 ml-2 h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clipRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              fillRule="evenodd"
            />
          </svg>
        </button>

        <div
          className="hidden origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20 max-h-60 overflow-y-auto"
          id="voices-menu"
        >
          <div className="px-3 py-2 border-b text-xs text-gray-500">
            {`ℹ️ Google voices may cut off long text. Apple/Microsoft voices often
            work better.`}
          </div>
          <div
            aria-labelledby="options-menu"
            aria-orientation="vertical"
            className="py-1"
            role="menu"
          >
            {availableVoices.map((voice) => {
              const isGoogleVoice = voice.name.toLowerCase().includes("google");
              const isPremiumVoice =
                voice.name.toLowerCase().includes("premium") ||
                voice.name.toLowerCase().includes("neural") ||
                voice.name.toLowerCase().includes("enhanced");

              return (
                <button
                  key={`${voice.name}-${voice.lang}`}
                  className={`w-full text-left block px-4 py-2 text-sm hover:bg-gray-100 ${
                    isGoogleVoice ? "text-amber-700"
                    : isPremiumVoice ? "text-green-700 font-medium"
                    : "text-gray-700"
                  }`}
                  role="menuitem"
                  onClick={() => {
                    setSelectedVoice(voice);
                    document
                      .getElementById("voices-menu")
                      .classList.add("hidden");
                  }}
                >
                  {voice.name} ({voice.lang})
                  {isPremiumVoice && <span className="ml-2">✓</span>}
                  {isGoogleVoice && <span className="ml-2">⚠️</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // The function will speak text in chunks for Google voices

  const speakTextInChunks = (text) => {
    // Store the original text for debugging
    const originalText = text;

    // Function to handle when one chunk ends and the next begins
    const speakNextChunk = () => {
      if (chunkIndex >= chunks.length) {
        // All done with chunks
        setSpeechState("idle");

        return;
      }

      const chunk = chunks[chunkIndex];
      const utterance = new SpeechSynthesisUtterance(chunk);

      // Apply voice, rate, pitch settings
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Set up handlers for this chunk
      utterance.onstart = () => {
        setSpeechState("playing");
      };

      utterance.onend = () => {
        // Move to next chunk
        chunkIndex++;
        // Small delay between chunks for more natural sound
        setTimeout(speakNextChunk, 50);
      };

      utterance.onerror = (event) => {
        if (event.error !== "interrupted") {
          logger.error(`Speech synthesis error in chunk ${chunkIndex}:`, event);
        }
        setSpeechState("idle");
      };

      // Speak this chunk
      synthRef.current.speak(utterance);
    };

    // Split text into sentences, then group into manageable chunks
    // This approach works better than arbitrary character counts
    const sentenceDelimiters = /[.!?]+/g;
    const sentences = text
      .split(sentenceDelimiters)
      .map((sentence, i, arr) => {
        // Reattach the delimiter (period, exclamation, question mark)
        const delimiter = text.match(sentenceDelimiters)?.[i] || ".";

        return i < arr.length - 1 ? sentence + delimiter : sentence;
      })
      .filter((s) => s.trim().length > 0);

    // Group sentences into chunks of reasonable size (around 200 chars)
    const chunks = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > 200) {
        chunks.push(currentChunk);
        currentChunk = sentence;
      } else {
        currentChunk += " " + sentence;
      }
    }

    // Add the last chunk if there's anything left
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk);
    }

    // Initialize chunk index
    let chunkIndex = 0;

    // Start the process
    speakNextChunk();
  };

  // Render voice options UI
  const renderVoiceOptions = () => {
    const isGoogleVoice =
      selectedVoice && selectedVoice.name.toLowerCase().includes("google");

    return (
      <div className="absolute z-50 flex flex-col space-y-4 shadow-lg backdrop-blur-sm bg-gray-50/80 dark:bg-zinc-600/80 p-4 rounded-md mb-4 text-sm border dark:border-zinc-500">
        <Button
          className="w-fit absolute right-0 top-0 border-t-0 border-r-0 rounded-t-none rounded-r-none text-primary dark:text-zinc-200 bg-zinc-200 dark:bg-zinc-700 border-primary/50 dark:border-primary"
          variant="bordered"
          onPress={() => {
            setShowVoiceOptions(false);
          }}
        >
          Close
        </Button>
        <div className="flex flex-col gap-2">
          <label
            className="font-medium text-primary dark:text-white"
            htmlFor="voice-selector"
          >
            Voice:
            {isGoogleVoice && (
              <span className="ml-2 text-xs text-amber-700">
                {`⚠️ Google voices may cut longer text. We'll try to fix this
                automatically.`}
              </span>
            )}
          </label>
          <div id="voice-selector">{renderVoiceSelector()}</div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary dark:text-white">
            Speed: {rate.toFixed(1)}x
          </label>
          <Slider
            classNames={{
              base: "w-full",
              track: "bg-zinc-500 dark:bg-zinc-800",
              filler: "bg-accent rounded-sm",
            }}
            defaultValue={rate}
            fillOffset={1}
            getValue={rate}
            maxValue={2}
            minValue={0.5}
            size={"md"}
            step={0.1}
            onChange={(value) => setRate(parseFloat(value))}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-primary dark:text-white">
            Pitch: {pitch.toFixed(1)}
          </label>
          <Slider
            classNames={{
              base: "w-full",
              track: "bg-zinc-500 dark:bg-zinc-800",
              filler: "bg-accent rounded-sm",
            }}
            defaultValue={pitch}
            fillOffset={1}
            getValue={pitch}
            maxValue={1.5}
            minValue={0.5}
            size={"md"}
            step={0.1}
            onChange={(value) => setPitch(parseFloat(value))}
          />
        </div>

        <div className="text-xs border-t pt-2 mt-2">
          <p className="mb-1 text-primary dark:text-white">
            📝 Voice Quality Tips:
          </p>
          <ul className="list-disc pl-4 text-primary dark:text-white">
            <li className="">
              Apple and Microsoft voices often work better for longer texts
            </li>
            <li>Try slowing down to 0.9x for more natural reading</li>
            <li>Adjust pitch slightly for better sounding voices</li>
          </ul>
        </div>
      </div>
    );
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
      // This will stop all utterances, including chunked ones
      synthRef.current.cancel();
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
          <div className="flex justify-end gap-2">
            <Button className="h-10" variant="bordered" onPress={pauseReading}>
              <svg
                className="icon icon-tabler icon-tabler-player-pause-filled"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 0h24v24H0z" fill="none" stroke="none" />
                <path
                  d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"
                  fill="currentColor"
                  strokeWidth="0"
                />
                <path
                  d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z"
                  fill="currentColor"
                  strokeWidth="0"
                />
              </svg>
              <span className="ml-1">Pause</span>
            </Button>
            <Button className="h-10" variant="bordered" onPress={stopReading}>
              <svg
                className="icon icon-tabler icon-tabler-player-stop-filled"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 0h24v24H0z" fill="none" stroke="none" />
                <path
                  d="M17 4h-10a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3 -3v-10a3 3 0 0 0 -3 -3z"
                  fill="currentColor"
                  strokeWidth="0"
                />
              </svg>
              <span className="ml-1">Stop</span>
            </Button>
          </div>
        );
      case "paused":
        return (
          <div className="flex justify-end gap-2">
            <Button className="h-10" variant="bordered" onPress={resumeReading}>
              <svg
                className="icon icon-tabler icon-tabler-player-play-filled"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 0h24v24H0z" fill="none" stroke="none" />
                <path
                  d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z"
                  fill="currentColor"
                  strokeWidth="0"
                />
              </svg>
              <span className="ml-1">Resume</span>
            </Button>
            <Button className="h-10" variant="bordered" onPress={stopReading}>
              <svg
                className="icon icon-tabler icon-tabler-player-stop-filled"
                fill="none"
                height="24"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                width="24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 0h24v24H0z" fill="none" stroke="none" />
                <path
                  d="M17 4h-10a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3 -3v-10a3 3 0 0 0 -3 -3z"
                  fill="currentColor"
                  strokeWidth="0"
                />
              </svg>
              <span className="ml-1">Stop</span>
            </Button>
          </div>
        );
      case "idle":
      default:
        return (
          <Button
            className="h-10 w-fit self-end border-primary dark:border-secondary"
            variant="bordered"
            onPress={startReading}
          >
            <svg
              className="icon icon-tabler icon-tabler-volume stroke-primary dark:stroke-zinc-200"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 0h24v24H0z" fill="none" stroke="none" />
              <path d="M15 8a5 5 0 0 1 0 8" />
              <path d="M17.7 5a9 9 0 0 1 0 14" />
              <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
            </svg>
            <span className="ml-1 font-semibold text-primary dark:text-zinc-200">Read Aloud</span>
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
          backdrop:
            "z-[90] bg-gradient-to-t from-zinc-900 to-zinc-900/10 backdrop-opacity-20",
          base: "sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-4xl", // Responsive widths
        }}
        isOpen={isOpen}
        scrollBehavior="inside" // Ensure scrollable content
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 p-2 sm:p-4">
                <div className="flex flex-col md:flex-row sm:items-center justify-between w-full gap-2 mb-4 sm:mb-0">
                  <h3 className="text-xl font-semibold self-start">{title}</h3>

                  <div className="flex flex-col gap-2 self-end">
                    <div className="flex gap-2 items-center justify-end md:mr-5">
                      {speechState === "idle" && (
                        <Button
                          className="h-8"
                          size="sm"
                          variant="light"
                          onPress={() => setShowVoiceOptions(!showVoiceOptions)}
                        >
                          <svg
                            className="icon icon-tabler icon-tabler-adjustments"
                            fill="none"
                            height="20"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            width="20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M0 0h24v24H0z" fill="none" stroke="none" />
                            <path d="M4 10a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                            <path d="M6 4v4" />
                            <path d="M6 12v8" />
                            <path d="M10 16a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                            <path d="M12 4v10" />
                            <path d="M12 18v2" />
                            <path d="M16 7a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
                            <path d="M18 4v1" />
                            <path d="M18 9v11" />
                          </svg>
                          <span className="ml-1 text-xs">Voice Settings</span>
                        </Button>
                      )}

                      {typeof window !== "undefined" &&
                        window.speechSynthesis &&
                        renderSpeechControls()}
                    </div>

                    {showVoiceOptions &&
                      speechState === "idle" &&
                      renderVoiceOptions()}
                  </div>
                </div>
              </ModalHeader>
              <ModalBody className="p-2 sm:p-4">
                <div ref={contentRef} className="max-h-[60vh] overflow-y-auto">
                  {typeof content === "string" ?
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  : content}
                </div>
              </ModalBody>
              <ModalFooter className="flex justify-end p-2 sm:p-4">
                {footerButtons.length > 0 ?
                  footerButtons.map((btnProps, index) => (
                    <Button key={index} {...btnProps} />
                  ))
                : <Button
                    color="danger"
                    variant="bordered"
                    onPress={() => {
                      handleClose();
                      onClose();
                    }}
                  >
                    Close
                  </Button>
                }
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
