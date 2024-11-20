'use client';

import React, { use, useState, useTransition } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';

const Sidebar = React.memo(({ hints, whyDoWeAsk, onHintClicked, onWhyClicked }) => {
  const [isPending, startTransition] = useTransition();
  const [hintToastId, setHintToastId] = useState(null);
  const [whyToastId, setWhyToastId] = useState(null);

  const handleToast = (type) => {
    startTransition(() => {
      if (type === 'hint' && hints) {
        if (hintToastId) {
          toast.dismiss(hintToastId);
          setHintToastId(null);
        } else {
          const id = toast("Hints", {
            description: <><br /><ReactMarkdown className='whitespace-pre-wrap'>{hints}</ReactMarkdown></>,
            duration: Infinity,
            action: {
              label: 'Close',
              onClick: () => {
                toast.dismiss(id);
                setHintToastId(null);
              },
            },
          });
          setHintToastId(id);
          onHintClicked?.(); // Call the handler if provided
        }
      } else if (type === 'why' && whyDoWeAsk) {
        if (whyToastId) {
          toast.dismiss(whyToastId);
          setWhyToastId(null);
        } else {
          const id = toast("Why we ask this question", {
            description: <><br/><ReactMarkdown className='whitespace-pre-wrap'>{whyDoWeAsk}</ReactMarkdown></>,
            duration: Infinity,
            action: {
              label: 'Close',
              onClick: () => {
                toast.dismiss(id);
                setWhyToastId(null);
              },
            },
          });
          setWhyToastId(id);
          onWhyClicked?.(); // Call the handler if provided
        }
      }
    });
  };

  return (
    <motion.div
      className="flex md:flex-col items-center justify-items-center gap-4"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0 }}
    >
      <Button
        variant="shadow"
        color={!hints ? '' : 'primary'}
        disabled={!hints}
        onClick={() => handleToast('hint')}
        auto
        isLoading={isPending}
        className={`w-[150px] min-h-20 break-words ${!hints ? 'cursor-not-allowed border border-gray-200' : ''}`}
      >
        { !hints && <span> No Hint<br/>Available </span>}
        { hints && <span> Show Hints </span> }
      </Button>
      <Button
        variant="shadow"
        color={!whyDoWeAsk ? '' : 'primary'}
        disabled={!whyDoWeAsk}
        onClick={() => handleToast('why')}
        auto
        isLoading={isPending}
        className={`w-[150px] min-h-20 flex ${!whyDoWeAsk ? 'cursor-not-allowed border-gray-200' : ''}`}
      >
        { !whyDoWeAsk && <span> No Reason<br/>Available </span>}
        { whyDoWeAsk && <span> Why Do We<br/>Ask This? </span> }
      </Button>
    </motion.div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
