import React, { useState, useEffect, useTransition, useRef } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { IconCopy, IconSquareRoundedX, IconBulbFilled, IconZoomQuestionFilled } from '@tabler/icons-react';

const Sidebar = React.memo(({ hints, whyDoWeAsk, onHintClicked, onWhyClicked }) => {
  const [isPending, startTransition] = useTransition();
  const [hintToastId, setHintToastId] = useState(null);
  const [whyToastId, setWhyToastId] = useState(null);
  const [newHintAvailable, setNewHintAvailable] = useState(false);

  // Track changes to `hints` and show the indicator
  useEffect(() => {
    if (hints) {
      setNewHintAvailable(true);
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
        const newToastId = toast.custom((t) => (
          <div className='p-4 shadow-lg rounded-lg bg-white/90 max-h-[90vh] overflow-y-auto select-text'>
            <h4 className='font-bold'>Hint</h4>
            <ReactMarkdown className="whitespace-pre-wrap py-6">{hints}</ReactMarkdown>
            <div className='flex justify-between'>
              <Button
                variant='bordered'
                color='secondary'
                onClick={() => {
                  navigator.clipboard.writeText(hints);
                  toast.success("Hints copied to clipboard", { duration: 2000, classNames: { toast: 'text-green-600' } });
                }}
              >
                <IconCopy size={20} />
                Copy
              </Button>
              <Button
                variant='bordered'
                color='danger'
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
          onDismiss: (t) => {
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
        const newToastId = toast.custom((t) => (
          <div className='p-4 shadow-lg rounded-lg bg-white/90'>
            <h4 className='font-bold'>Reason we ask</h4>
            <ReactMarkdown className="whitespace-pre-wrap py-6">{whyDoWeAsk}</ReactMarkdown>
            <div className='flex justify-between'>
              <Button
                variant='bordered'
                color='danger'
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
          onDismiss: (t) => {
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
        variant="none"
        disabled={!whyDoWeAsk}
        onClick={() => handleToast('why')}
        auto
        aria-label='Why do we ask?'
        //isLoading={isPending}
        className={`fixed bottom-0 -left-4 z-10 md:bg-transparent md:shadow-md md:relative md:left-auto md:w-32 md:h-24 flex border-3 border-transparent ${!whyDoWeAsk ? 'cursor-not-allowed border border-gray-200 hidden' : ''}`}
      >
        {!whyDoWeAsk && <span> No Reason <br /> Available </span>}
        {whyDoWeAsk && <span className={`hidden absolute bottom-0 md:block`}> Why We Ask </span>}
        <IconZoomQuestionFilled
          size={28}
          className="dark:text-white text-accentMint"
        />
      </Button>
    );
  }

  const HintButton = () => {
    return (
      <Button
        variant="none"
        //color={!hints ? '' : 'transparent'}
        disabled={!hints}
        onClick={() => handleToast('hint')}
        auto
        aria-label='Check hint'
        //isLoading={isPending}
        className={`md:w-32 md:h-24 break-words md:relative fixed bottom-0 -right-4 z-10 md:bg-transparent md:shadow-md md:right-auto flex md:border-3 md:border-transparent
                ${!hints ? 'cursor-not-allowed border-3 border-transparent border-gray-200 hidden' : ''}
                ${newHintAvailable ? 'border-yellow-400' : ''}`}
      >
        {!hints && <span> No Hint<br />Available </span>}
        {hints && <span className={`hidden md:block absolute bottom-0 ${newHintAvailable ? 'animate-pulse font-bold' : ''}`}> Check Hint </span>}
        {newHintAvailable && (
          <IconBulbFilled
            size={32}
            className="top-2 left-1 text-yellow-400 animate-bounce"
          />
        )}
        {!newHintAvailable && (
          <IconBulbFilled
            size={32}
            className="top-2 left-1 dark:text-white text-accentMint"
          />
        )}
      </Button>
    )
  }


  return (
    <motion.div
      className="flex md:flex-col items-center justify-items-center gap-4"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0 }}
    >
      <HintButton />
      <WhyWeAskButton />
    </motion.div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
