import React, { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';
import { IconCopy, IconSquareRoundedX, IconBulbFilled } from '@tabler/icons-react';

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

  // Track changes to `hints` and show the indicator
  const handleToast = (type) => {
    startTransition(() => {
      if (type === 'hint' && hints) {
        if (hintToastId) {
          // Dismiss the toast and reset state
          toast.dismiss(hintToastId);
          setHintToastId(null);
        } else {
          const id = toast.custom((t) => (
            <div className='p-4 shadow-lg rounded-lg bg-white/90 max-h-[90vh] overflow-y-auto'>
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
                    toast.dismiss(hintToastId);
                    setHintToastId(null);
                  }}
                >
                  <IconSquareRoundedX size={20} />
                  Close
                </Button>
              </div>
            </div>
          ), { duration: Infinity });

          setHintToastId(id);
          setNewHintAvailable(false); // Reset the indicator
          onHintClicked?.(); // Call the handler if provided
        }
      } else if (type === 'why' && whyDoWeAsk) {
        if (whyToastId) {
          toast.dismiss(whyToastId);
          setWhyToastId(null);
        } else {
          const id = toast.custom((t) => (
            <div className='p-4 shadow-lg rounded-lg bg-white/90'>
              <h4 className='font-bold'>Reason we ask</h4>
              <ReactMarkdown className="whitespace-pre-wrap py-6">{whyDoWeAsk}</ReactMarkdown>
              <div className='flex justify-between'>
                <Button
                  variant='bordered'
                  color='danger'
                  onClick={() => {
                    toast.dismiss(whyToastId);
                    setWhyToastId(null);
                  }}
                >
                  <IconSquareRoundedX size={20} />
                  Close
                </Button>
              </div>
            </div>
          ), { duration: Infinity });

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
        //isLoading={isPending}
        className={`w-[150px] min-h-20 break-words relative ${!hints ? 'cursor-not-allowed border border-gray-200 hidden' : ''}`}
      >
        {!hints && <span> No Hint<br />Available </span>}
        {hints && <span> Show Hints </span>}
        {newHintAvailable && (
          <IconBulbFilled
            size={16}
            className="absolute top-2 left-1 text-yellow-400 animate-bounce"
          />
        )}
      </Button>
      <Button
        variant="shadow"
        color={!whyDoWeAsk ? '' : 'primary'}
        disabled={!whyDoWeAsk}
        onClick={() => handleToast('why')}
        auto
        //isLoading={isPending}
        className={`w-[150px] min-h-20 flex ${!whyDoWeAsk ? 'cursor-not-allowed border border-gray-200 hidden' : ''}`}
      >
        {!whyDoWeAsk && <span> No Reason<br />Available </span>}
        {whyDoWeAsk && <span> Why Do We<br />Ask This? </span>}
      </Button>
    </motion.div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
