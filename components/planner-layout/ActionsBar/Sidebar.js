'use client';

import React, { useTransition, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import logger from '@/lib/logger';
import useClipboard from '@/lib/hooks/useClipboard';

import HintButton from './HintButton';
import WhyWeAskButton from './WhyWeAskButton';
import { useHintToast } from '@/lib/hooks/useShowHint';

const Sidebar = React.memo(({ hint, whyDoWeAsk, onHintClicked, onWhyClicked, userMsg, checkDomain = false }) => {
  const [isPending, startTransition] = useTransition();
  const { showHintToast, showWhyWeAskToast } = useHintToast();
  const { copyToClipboard } = useClipboard();

  // Track changes to `hints` and show the indicator
  const handleToast = (type) => {
    toast.dismiss(); // Close all active toasts
    startTransition(() => {
      if (type === 'hint' && hint) {
        logger.debug('userMsg', userMsg);
        showHintToast(
          hint,
          () => {
            logger.info("Hint copied to clipboard!");
            onHintClicked?.(); // Call optional handler
          },
          () => logger.info("Hint toast dismissed!"), // Optional dismiss callback
          userMsg,
          copyToClipboard,
          checkDomain
        );
      } else if (type === 'why' && whyDoWeAsk) {
        showWhyWeAskToast(
          whyDoWeAsk,
          () => {
            logger.info("Why toast dismissed!");
            onWhyClicked?.(); // Call optional handler
          }
        );
      }
    });
  };
  
  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="relative mt-8 md:mt-0 flex justify-around sm:justify-between md:justify-center md:flex-col md:items-end md:justify-items-center gap-4"
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