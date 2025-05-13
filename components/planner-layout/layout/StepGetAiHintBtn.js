import React, { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/react";
import { IconAi, IconBulb, IconX } from "@tabler/icons-react";
import { useReCaptcha } from "next-recaptcha-v3";
import { AnimatePresence, motion } from "framer-motion";

import logger from "@/lib/logger";
import { fetchAIHint } from "@/lib/fetchAIHint";

// AI Hint Bubble component with nice styling
const AIHintBubble = ({
  isVisible,
  onClose,
  isFirstStep,
  sessionId,
  stepNumber,
  isHintAvailable = false,
}) => {
  const [isFired, setIsFired] = useState(isHintAvailable);

  // Check in session storage if the bubble has been shown before
  useEffect(() => {
    if (sessionId) {
      const sessionStorageKey = `aiHintBubble-${sessionId + stepNumber}`;
      const storedData = sessionStorage.getItem(sessionStorageKey);

      if (storedData) {
        const { expirationTime } = JSON.parse(storedData);
        const currentTime = new Date().getTime();

        if (currentTime < expirationTime) {
          setIsFired(true);

          logger.debug("AIHintBubble: Bubble already shown in session storage");
        } else {
          // Remove expired data
          sessionStorage.removeItem(sessionStorageKey);
          logger.debug(
            "AIHintBubble: Expired data removed from session storage"
          );
        }
      }
    }
  }, [sessionId]);

  // Log when isFired changes
  useEffect(() => {
    logger.debug("AIHintBubble: isFired changed:", isFired);
  }, [isFired]);

  const [message, setMessage] = useState("");

  // Message options
  const firstStepMessages = [
    "Stuck in a creative rut? 🧠 Let our AI give you a gentle nudge.",
    "In need of a spark? ✨ Tap here for a dash of AI brilliance.",
    "Words not playing along? ✍️ Our AI’s here to help get things flowing.",
    "Give that stubborn cursor a reason to move 🖱️ — AI help is just a click away.",
    "Details are gold—feed AI nuggets, get treasure back 🪙.",
    "Paint vividly; AI colors inside (and outside) the lines 🎨.",
    "One specific = ten ideas. Give AI a seed 🌱.",
    "Spill the context; AI stitches it into smart cloth 🧵.",
    "Think bullet points; AI builds the blockbuster 🏆.",
    "Don’t hold back—precision powers better magic 🎩✨.",
    "More clues, better moves—the AI detective awaits 🔍.",
    "Drop nouns, names, numbers; watch solutions snap in place ⚡️.",
    "Specifics save time. Invest a few, reap big returns ⏳.",
    "Give AI the raw sketch; it’ll draft the masterpiece 🖼️.",
  ];

  const followUpMessages = [
    "Tap “Refine with AI” and watch your blueprint glow ✨.",
    "Need a brainwave? The AI button is basically espresso ☕️.",
    "Blueprint stuck? Hit refine—instant upgrade, zero heavy lifting 🛠️.",
    "Press the magic button; your past answers do the hard work 🧙.",
    "AI’s itching to remix your plan—give it a poke 🎛️.",
    "Refine now: your blueprint gets sharper than your morning coffee ☀️.",
    "Shortcut to smarter ideas: that shiny AI button ➡️.",
    "Stop scrolling—click refine and unleash the blueprint beast 🐉.",
    "One tap = fresh angles, same great answers 🔄.",
    "Your inputs + AI = chef-kiss website recipe 👨‍🍳.",
    "Let AI buff your plan to a mirror shine 🪞.",
    "Blueprint feeling flat? Inflate it with AI air-power 🎈.",
    "Crowdsource your brain—AI’s on standby 👥🤖.",
    "Push refine; turn scribbles into a site-ready map 🗺️.",
    "Why guess? The AI button already read your mind 🧠.",
    "Give your draft a vitamin boost—refine with AI 💊.",
    "Press to auto-polish; sparkle comes free ✶.",
    "Blueprint 2.0 is one click south of here ↑.",
    "Skip the re-type; AI stitches new ideas neatly 🪡.",
    "Click refine: because good plans deserve killer twists 🎢.",
    "Blueprint blah? Hit AI for an instant glow-up 💅.",
    "Tap refine—AI turns ‘hmm’ into ‘heck yes’ 🚀.",
    "Draft got wrinkles? AI’s the one-tap iron 👔.",
    "Press the magic button; your plan wants a remix 🎧.",
    "Need spark? AI’s lightning in a click ⚡️.",
    "Refine now: blueprint gains ninja moves 🥷.",
    "Stuck in neutral? AI is your idea turbo 🏎️.",
    "Click for auto-awesome—no rewrites required 🔄.",
    "Blueprint yawning? Give it an AI espresso shot ☕️.",
    "One tap, countless aha! moments—refine away 💡.",
  ];

  useEffect(() => {
    if (isFired) return;
    // Select appropriate messages based on step
    const messages =
      isFirstStep ? firstStepMessages : (
        [...firstStepMessages, ...followUpMessages]
      );

    // Choose random message
    const randomIndex = Math.floor(Math.random() * messages.length);
    let selectedMessage = messages[randomIndex];

    // Sometimes add editing reminder
    if (Math.random() > 0.6) {
      selectedMessage +=
        " Don't worry, you can always edit any suggestions later.";
    }

    setMessage(selectedMessage);
  }, [isFirstStep]);

  const handleClose = () => {
    setIsFired(true);

    // Save to session storage with sessionId
    if (sessionId) {
      const sessionStorageKey = `aiHintBubble-${sessionId + stepNumber}`;
      const currentTime = new Date().getTime();
      const expirationTime = currentTime + 24 * 60 * 60 * 1000; // 24 hours
      const data = {
        expirationTime,
      };

      sessionStorage.setItem(sessionStorageKey, JSON.stringify(data));

      onClose();
    }
  };

  if (!isVisible || isFired) return null;

  return (
    <>
      {isVisible && (
        <AnimatePresence mode="wait">
          <motion.div
            key="hint-bubble"
            drag
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-20 right-10 bottom-10 w-screen transform -translate-y-full  bg-black/80 -translate-x-1/2 mb-2 backdrop-blur-sm border-2 border-lime-500/50 dark:bg-white/90 rounded-3xl rounded-br-none shadow-lg shadow-secondaryTeal dark:shadow-primary p-4 max-w-xs dark:border-primary animate-fadeIn"
            dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
            exit={{ opacity: 0, y: -10 }}
            initial={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="arrow-down" />
            <button
              aria-label="Close"
              className="absolute bottom-0 right-0 text-white dark:text-black focus:outline-none w-8 h-8 flex items-center justify-center"
              onClick={handleClose}
            >
              <span className="relative flex justify-center items-center w-full h-full hover:scale-125 active:scale-95 rounded-full transition-all">
                <IconX size={15} />
              </span>
            </button>
            <p className="text-sm text-white dark:text-neutralDark drop-shadow-sm font-semibold pr-5 mb-0">
              {message}
            </p>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
};

export const StepGetAiHintBtn = ({
  prompt,
  isAIAvailable,
  setAiHint,
  setUserMsg,
  stepNumber,
  content,
  sessionData,
  updateFormData,
  setError,
  typingDelay = 3000, // 3 seconds of no typing activity
}) => {
  const { executeRecaptcha } = useReCaptcha();
  const [isPending, setIsPending] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const typingTimerRef = useRef(null);
  const listenerAddedRef = useRef(false);
  const isFirstStep = stepNumber === 0;

  const eventTypes = [
    "keydown",
    "keypress",
    "mousemove",
    "click",
    "touchstart",
    "scroll",
  ];

  // Function to handle typing events
  const handleUserEvents = useRef((e) => {
    // Only listen for keyboard events, ignoring special keys
    if (
      eventTypes.includes(e.type) &&
      e.key !== "Enter" &&
      e.key !== "Shift" &&
      e.key !== "Control"
    ) {
      // Clear any existing timer
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }

      // Set a new timer for typing inactivity
      typingTimerRef.current = setTimeout(() => {
        if (isAIAvailable && !isClicked) {
          setShowBubble(true);

          // Remove listeners once bubble is shown with a loop
          eventTypes.forEach((eventType) => {
            document.removeEventListener(eventType, handleUserEvents.current);
          });

          listenerAddedRef.current = false;
        }
      }, typingDelay);
    }
  }).current;

  // Set up keyboard typing detection
  useEffect(() => {
    // Only add listeners if they haven't been added yet and bubble isn't shown
    if (
      !listenerAddedRef.current &&
      !showBubble &&
      isAIAvailable &&
      !isClicked
    ) {
      eventTypes.forEach((eventType) => {
        document.addEventListener(eventType, handleUserEvents);
      });
      listenerAddedRef.current = true;

      // Start initial timer if user doesn't type
      typingTimerRef.current = setTimeout(() => {
        if (isAIAvailable && !isClicked) {
          setShowBubble(true);

          // Remove listeners once bubble is shown
          eventTypes.forEach((eventType) => {
            document.removeEventListener(eventType, handleUserEvents);
          });
          listenerAddedRef.current = false;
        }
      }, typingDelay * 2); // Longer initial delay
    }

    return () => {
      // Clean up when component unmounts
      if (listenerAddedRef.current) {
        eventTypes.forEach((eventType) => {
          document.removeEventListener(eventType, handleUserEvents);
        });
        listenerAddedRef.current = false;
      }

      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [handleUserEvents, isAIAvailable, isClicked, showBubble, typingDelay]);

  const handleFetchHint = async () => {
    if (!isAIAvailable) {
      setError(
        "AI suggestion is currently unavailable due to incomplete fields."
      );

      return;
    }

    setIsClicked(true);
    setShowBubble(false); // Hide bubble when AI is requested

    try {
      setIsPending(true);
      logger.debug("Fetching AI hint with prompt:", prompt);
      await fetchAIHint({
        stepNumber,
        prompt,
        content,
        setAiHint,
        setUserMsg,
        sessionData,
        updateFormData,
        executeRecaptcha,
      });
    } catch (error) {
      logger.error("Error fetching AI suggestion:", error);
      setError("Error fetching AI suggestion. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const lastHint = sessionData?.formData?.[stepNumber]?.lastHint;
  const isHintAvailable = lastHint && lastHint.length > 0;

  return (
    <div className="flex relative justify-end mb-4 mt-0">
      <div className="relative">
        <Button
          className={`${!isAIAvailable ? "hidden" : "flex get-ai-hint-btn"} bg-brandPink text-white font-semibold text-medium items-center gap-2`}
          isLoading={isPending}
          onPress={handleFetchHint}
        >
          <IconBulb
            className={`text-white ${isClicked ? "" : "animate-bounce -mb-1.5"}`}
            size={24}
          />
          Refine with AI
        </Button>
        {isAIAvailable && (
          <AIHintBubble
            isFirstStep={isFirstStep}
            isHintAvailable={isHintAvailable}
            isVisible={showBubble && isAIAvailable}
            sessionId={sessionData?.sessionId}
            stepNumber={stepNumber}
            onClose={() => setShowBubble(false)}
          />
        )}
      </div>

      <Button
        className={`${isAIAvailable ? "hidden" : "flex get-ai-hint-btn"} items-center gap-2 opacity-50 hover:!opacity-50`}
        color="primary"
        isLoading={isPending}
        onPress={() =>
          setError(
            "Please fill in all required fields before getting an AI hint."
          )
        }
      >
        <IconAi size={20} />
        Refine with AI
      </Button>
    </div>
  );
};

export default StepGetAiHintBtn;
