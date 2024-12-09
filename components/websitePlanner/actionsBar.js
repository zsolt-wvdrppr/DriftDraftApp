import React, { useState, useEffect, useTransition, useRef } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { IconCopy, IconSquareRoundedX, IconBulbFilled, IconZoomQuestionFilled } from '@tabler/icons-react';
import useToastSound from '@/lib/useToastSound';

const Sidebar = React.memo(({ hints, whyDoWeAsk, onHintClicked, onWhyClicked }) => {
  const [isPending, startTransition] = useTransition();
  const [newHintAvailable, setNewHintAvailable] = useState(false);
  const playSound = useToastSound();

  // Track changes to `hints` and show the indicator
  useEffect(() => {
    if (hints) {
      setNewHintAvailable(true);
      playSound();
    }
  }, [hints]);

  const hintToastRef = useRef(null);
  const whyToastRef = useRef(null);

  // Track changes to `hints` and show the indicator
  const handleToast = (type) => {

    startTransition(() => {
      if (type === 'hint' && hints) {
        if (hintToastRef.current) {
          // Dismiss the toast and reset state
          toast.dismiss(hintToastRef.current);
          hintToastRef.current = null;
        }
        const newToastId = toast.custom(() => (
          <div className='p-4 shadow-lg rounded-lg bg-white/90 max-h-[90vh] overflow-y-auto select-text'>
            <h4 className='font-bold'>Hint</h4>
            <ReactMarkdown className="whitespace-pre-wrap py-6">{hints}</ReactMarkdown>
            <div className='flex justify-between'>
              <Button
                color='secondary'
                variant='bordered'
                onClick={() => {
                  navigator.clipboard.writeText(hints);
                  toast.success("Hints copied to clipboard", { duration: 2000, classNames: { toast: 'text-green-600' } });
                }}
              >
                <IconCopy size={20} />
                Copy
              </Button>
              <Button
                color='danger'
                variant='bordered'
                onClick={() => {
                  // Ensure the correct ID is dismissed
                  toast.dismiss(newToastId);
                  hintToastRef.current = null;
                }}
              >
                <IconSquareRoundedX size={20} />
                Close
              </Button>
            </div>
          </div>
        ), {
          duration: Infinity,
          onDismiss: () => {
            hintToastRef.current = null;
          }

        });

        hintToastRef.current = newToastId;
        setNewHintAvailable(false); // Reset the indicator
        onHintClicked?.(); // Call the handler if provided

      } else if (type === 'why' && whyDoWeAsk) {
        if (whyToastRef.current) {
          toast.dismiss(whyToastRef.current);
          whyToastRef.current = null;
        }
        const newToastId = toast.custom(() => (
          <div className='p-4 shadow-lg rounded-lg bg-white/90'>
            <h4 className='font-bold'>Reason we ask</h4>
            <ReactMarkdown className="whitespace-pre-wrap py-6">{whyDoWeAsk}</ReactMarkdown>
            <div className='flex justify-between'>
              <Button
                color='danger'
                variant='bordered'
                onClick={() => {
                  toast.dismiss(newToastId);
                  whyToastRef.current = null;
                }}
              >
                <IconSquareRoundedX size={20} />
                Close
              </Button>
            </div>
          </div>
        ), {
          duration: Infinity,
          onDismiss: () => {
            whyToastRef.current = null;
          }
        });

        whyToastRef.current = newToastId;
        onWhyClicked?.(); // Call the handler if provided

      }
    });
  };

  const WhyWeAskButton = () => {
    return (
      <Button
        auto
        aria-label='Why do we ask?'
        className={`select-none bottom-0 -left-4 z-10 md:bg-transparent md:shadow-md md:relative md:left-auto md:w-32 md:h-24 flex border-3 border-transparent ${!whyDoWeAsk ? 'cursor-not-allowed border border-gray-200 opacity-0' : ''}`}
        disabled={!whyDoWeAsk}
        //isLoading={isPending}
        variant="none"
        onClick={() => handleToast('why')}
      >
        {whyDoWeAsk && <span className={`hidden absolute bottom-0 md:block`}> Why We Ask </span>}
        <IconZoomQuestionFilled
          className="dark:text-white text-accentMint"
          size={28}
        />
      </Button>
    );
  }

  const HintButton = () => {
    return (
      <Button
        auto
        aria-label='Check hint'
        className={`select-none md:w-32 md:h-24 break-words md:relative bottom-0 -right-4 z-10 md:bg-transparent md:shadow-md md:right-auto flex md:border-3 md:border-transparent
          ${!hints ? 'cursor-not-allowed border-3 border-transparent border-gray-200 opacity-0' : ''}
          ${newHintAvailable ? 'border-yellow-400' : ''}`}
        disabled={!hints}
        //isLoading={isPending}
        variant="none"
        onClick={() => handleToast('hint')}
      >
        {hints && <span className={`hidden md:block absolute bottom-0 ${newHintAvailable ? 'animate-pulse font-bold' : ''}`}> Check Hint </span>}
        <IconBulbFilled
          className={`top-2 left-1 ${newHintAvailable ? "text-yellow-400 animate-bounce" : "dark:text-white text-accentMint"}`}
          size={32}
        />
      </Button>
    )
  }


  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="relative mt-8 md:mt-0 flex justify-between md:justify-center md:flex-col md:items-center md:justify-items-center gap-4"
      initial={{ opacity: 1 }}
      transition={{ duration: 0 }}
    >
      <HintButton />
      <WhyWeAskButton />
    </motion.div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
