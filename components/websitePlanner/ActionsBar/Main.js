'use client';

import React, { useTransition, useRef } from 'react';
import { motion } from 'framer-motion';

import logger from '@/lib/logger';

import HintButton from './HintButton';
import WhyWeAskButton from './WhyWeAskButton';
import {showHintToast, showWhyWeAskToast} from './showToast';
import { toast } from 'sonner';
import useClipboard from '@/lib/hooks/useClipboard';


const Sidebar = React.memo(({ hint, whyDoWeAsk, onHintClicked, onWhyClicked, userMsg }) => {
  const [isPending, startTransition] = useTransition();
  const { copyToClipboard } = useClipboard();
  const hintToastRef = useRef(null);
  const whyToastRef = useRef(null);

  // Track changes to `hints` and show the indicator
  const handleToast = (type) => {
    toast.dismiss(); // Close all active toasts
    startTransition(() => {
      if (type === 'hint' && hint) {
        logger.debug('userMsg', userMsg);
        showHintToast(
          hint,
          hintToastRef,
          () => logger.info("Hint copied to clipboard!"), // Optional success callback
          () => logger.info("Hint toast dismissed!"), // Optional dismiss callback
          userMsg,
          copyToClipboard // Optional copy handler
        );
        //setNewHintAvailable(false); // Reset the indicator
        onHintClicked?.(); // Call optional handler
      } else if (type === 'why' && whyDoWeAsk) {
        showWhyWeAskToast(
          whyDoWeAsk,
          whyToastRef,
          () => logger.info("Why toast dismissed!") // Optional dismiss callback
        );
        onWhyClicked?.(); // Call optional handler
      }
    });
  };
  

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="relative mt-8 md:mt-0 flex justify-between md:justify-center md:flex-col md:items-center md:justify-items-center gap-4"
      initial={{ opacity: 1 }}
      transition={{ duration: 0 }}
    >
      <HintButton
        handleToast={() => handleToast('hint')}
        hints={hint}
        userMsg={userMsg}
      />
      <WhyWeAskButton
        handleToast={() => handleToast('why')}
        whyDoWeAsk={whyDoWeAsk}
      />

    </motion.div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
