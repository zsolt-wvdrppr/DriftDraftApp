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
 * @param {string} props.placement - Control placement: "left", "right", "center"
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
  const chunkIndexRef = useRef(0); // Track current chunk for Google voices
  
  // Voice selection state
  const [availableVoices, setAvailableVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const voiceMenuRef = useRef(null);

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

  // Close voice selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (voiceMenuRef.current && !voiceMenuRef.current.contains(event.target) && showVoiceSelector) {
        setShowVoiceSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showVoiceSelector]);

  // Find the most natural sounding voice available
  const findPreferredVoice = (voices) => {
    // First try to find a premium/enhanced voice
    const premiumVoices = voices.filter(voice => {
      const name = voice.name.toLowerCase();
      return (
        // Enhanced voices typically have these markers
        name.includes('premium') || 
        name.includes('enhanced') || 
        name.includes('neural') ||
        // Specific high-quality voices
        name.includes('samantha') ||  // High quality US voice (often on macOS)
        name.includes('daniel') ||    // High quality UK voice (often on macOS)
        name.includes('microsoft') || // Microsoft's voices can be good quality
        name.includes('natural')
      );
    });
    
    if (premiumVoices.length > 0) {
      // Prefer English voices if available among premium voices
      const englishPremiumVoice = premiumVoices.find(v => 
        v.lang.startsWith('en-')
      );
      return englishPremiumVoice || premiumVoices[0];
    }
    
    // Next, try to find any English voice
    const englishVoices = voices.filter(voice => voice.lang.startsWith('en-'));
    if (englishVoices.length > 0) {
      return englishVoices[0];
    }
    
    // Fall back to the first available voice
    return voices[0];
  };

  // Function to handle speaking text in chunks for Google voices
  const speakTextInChunks = (text) => {
    // Reset chunk index
    chunkIndexRef.current = 0;
    
    // Split text into sentences, then group into manageable chunks
    const sentenceDelimiters = /[.!?]+/g;
    const sentences = text.split(sentenceDelimiters)
      .map((sentence, i, arr) => {
        // Reattach the delimiter (period, exclamation, question mark)
        const delimiter = text.match(sentenceDelimiters)?.[i] || '.';
        return i < arr.length - 1 ? sentence + delimiter : sentence;
      })
      .filter(s => s.trim().length > 0);
    
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
    
    // Function to handle when one chunk ends and the next begins
    const speakNextChunk = () => {
      if (chunkIndexRef.current >= chunks.length) {
        // All done with chunks
        setSpeechState("idle");
        if (autoHighlight && contentRef.current) {
          contentRef.current.classList.remove("bg-blue-50", "dark:bg-blue-900/30");
        }
        return;
      }
      
      const chunk = chunks[chunkIndexRef.current];
      const utterance = new SpeechSynthesisUtterance(chunk);
      
      // Apply voice settings
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Set up handlers for this chunk
      utterance.onstart = () => {
        setSpeechState("playing");
        if (autoHighlight && contentRef.current) {
          contentRef.current.classList.add("bg-blue-50", "dark:bg-blue-900/30");
        }
      };
      
      utterance.onend = () => {
        // Move to next chunk
        chunkIndexRef.current++;
        // Small delay between chunks for more natural sound
        setTimeout(speakNextChunk, 50);
      };
      
      utterance.onerror = (event) => {
        if (event.error !== "interrupted") {
          console.error(`Speech synthesis error in chunk ${chunkIndexRef.current}:`, event);
        }
        setSpeechState("idle");
        if (autoHighlight && contentRef.current) {
          contentRef.current.classList.remove("bg-blue-50", "dark:bg-blue-900/30");
        }
      };
      
      // Speak this chunk
      synthRef.current.speak(utterance);
    };
    
    // Start the process
    speakNextChunk();
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

      if (!textToRead) {
        console.warn("No text content found to read");
        return;
      }
      
      // Check if using a Google voice - they have character limits
      const isGoogleVoice = selectedVoice && selectedVoice.name.toLowerCase().includes('google');
      
      if (isGoogleVoice && textToRead.length > 200) {
        // Use the chunking method for Google voices with longer text
        speakTextInChunks(textToRead);
      } else {
        // Standard approach for other voices or shorter text
        // Create utterance with the extracted text
        utteranceRef.current = new SpeechSynthesisUtterance(textToRead);

        // Apply voice if available
        if (selectedVoice) {
          utteranceRef.current.voice = selectedVoice;
        }

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
      }
    } catch (error) {
      console.error("Speech synthesis error:", error);
      setSpeechState("idle");
      if (autoHighlight && contentRef.current) {
        contentRef.current.classList.remove("bg-blue-50", "dark:bg-blue-900/30");
      }
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
      // Cancel all speech
      synthRef.current.cancel();
      
      // Reset any state
      utteranceRef.current = null;
      chunkIndexRef.current = 0;
      setSpeechState("idle");
      
      // Remove highlighting if active
      if (autoHighlight && contentRef.current) {
        contentRef.current.classList.remove("bg-blue-50", "dark:bg-blue-900/30");
      }
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  };

  // Render voice selector dropdown
  const renderVoiceSelector = () => {
    const isGoogleVoice = selectedVoice && selectedVoice.name.toLowerCase().includes('google');
    
    return (
      <div className="relative" ref={voiceMenuRef}>
        <button
          className="flex items-center text-xs px-2 py-1 bg-white hover:bg-gray-50"
          onClick={() => setShowVoiceSelector(!showVoiceSelector)}
        >
         <svg  xmlns="http://www.w3.org/2000/svg"  width="18"  height="18"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round" >
         <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
         <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
         <path d="M6 21v-2a4 4 0 0 1 4 -4h2.5" />
         <path d="M19.001 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
         <path d="M19.001 15.5v1.5" /><path d="M19.001 21v1.5" />
         <path d="M22.032 17.25l-1.299 .75" />
         <path d="M17.27 20l-1.3 .75" />
         <path d="M15.97 17.25l1.3 .75" />
         <path d="M20.733 20l1.3 .75" />
         </svg>
         <span className="ml-1 text-xs">
          Voice
          </span>
          {isGoogleVoice && <span className="ml-1 text-amber-500">⚠️</span>}
        </button>
        
        {showVoiceSelector && (
          <div className="absolute top-full left-0 z-10 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 max-h-48 overflow-y-auto text-left">
            <div className="px-3 py-2 text-xs text-gray-500 border-b">
              {isGoogleVoice ? 
                "⚠️ Google voices may cut off long text." : 
                "✓ Current voice selected"
              }
            </div>
            <div className="py-1">
              {availableVoices.map((voice) => {
                const voiceIsGoogle = voice.name.toLowerCase().includes('google');
                const isPremium = 
                  voice.name.toLowerCase().includes('premium') ||
                  voice.name.toLowerCase().includes('neural') ||
                  voice.name.toLowerCase().includes('enhanced');
                const isSelected = selectedVoice && voice.name === selectedVoice.name;
                
                return (
                  <button
                    key={`${voice.name}-${voice.lang}`}
                    className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-100 ${
                      isSelected ? 'bg-blue-50 font-medium' : ''
                    }`}
                    onClick={() => {
                      setSelectedVoice(voice);
                      setShowVoiceSelector(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>
                        {voice.name}
                        <span className="ml-1 text-gray-400 text-xs">
                          ({voice.lang})
                        </span>
                      </span>
                      <span>
                        {isSelected && "✓"}
                        {voiceIsGoogle && "⚠️"}
                        {isPremium && "★"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render speech controls with Tabler icons - PRESERVING YOUR EXACT DESIGN
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
          <div className="flex items-center gap-2">
            {renderVoiceSelector()}
            <Button className="h-7 min-w-0 p-2 w-fit self-end" color="primary" onPress={startReading}>
              <svg className="icon icon-tabler icon-tabler-volume" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none" stroke="none" />
                <path d="M15 8a5 5 0 0 1 0 8" />
                <path d="M17.7 5a9 9 0 0 1 0 14" />
                <path d="M6 15h-2a1 1 0 0 1 -1 -1v-4a1 1 0 0 1 1 -1h2l3.5 -4.5a.8 .8 0 0 1 1.5 .5v14a.8 .8 0 0 1 -1.5 .5l-3.5 -4.5" />
              </svg>
              <span className="ml-1 text-sm">Read Aloud</span>
            </Button>
          </div>
        );
    }
  };

  return (
    <div className={`text-reader ${className}`}>
      {/* Control bar - maintaining your placement options */}
      <div className={`flex mb-2 ${placement === "left" ? "justify-start" : placement === "right" ? "justify-end" : placement === "center" ? "justify-center" : placement}`}>
        {typeof window !== "undefined" && window.speechSynthesis && renderSpeechControls()}
      </div>
      
      {/* Content container - maintaining your exact classes */}
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