import { toast } from 'sonner';
import { Button, Link } from '@heroui/react';
import { IconArrowNarrowUpDashed } from '@tabler/icons-react';

import logger from '@/lib/logger';

export const showAnchoredToast = (title, message, targetClass, options = {}) => {
  const element = document.querySelector(`.${targetClass}`);

  if (!element) {
    logger.error(`[TUTORIAL] - Target element with class "${targetClass}" not found.`);

    return;
  }

  // Scroll to the target element
  element.scrollIntoView({
    behavior: 'smooth', // Smooth scrolling
    block: 'center',    // Center the element in the viewport
    inline: 'nearest',  // Align to the nearest edge if needed
  });

  const rect = element.getBoundingClientRect();

  logger.debug(`[TUTORIAL] - Target element position: ${JSON.stringify(rect || {})}`);
  const scrollY = window.scrollY || document.documentElement.scrollTop; // Get scroll offset
  const top = rect.bottom + scrollY; // Adjust position based on scroll offset
  const left = rect.left + rect.width / 2; // Center horizontally on the element

  logger.debug(`[TUTORIAL] - options: ${JSON.stringify(options)}`);

  const toastContent = (
    <div className="bg-transparent">
      {(targetClass !== 'step-0') && (
        <IconArrowNarrowUpDashed className="absolute left-1/2 top-1 text-fuchsia-600 animate-bounce" size={20} />
      )}
      <div className='p-4 bg-neutralCream bg-opacity-85 dark:bg-white dark:bg-opacity-85' >
        <h4 className="font-bold dark:text-neutralDark mb-2">{title}</h4>
        <p className="dark:text-neutralDark">{message}</p>
      </div>
      <div className={`justify-between btns-wrapper flex bg-neutralCream bg-opacity-85 dark:bg-white dark:bg-opacity-85 space-x-2 w-full -mb-1 bg-transparent`}>
        {options.previous && (
          <Button
            className='rounded-tr-lg rounded-bl-md -ml-1'
            color="primary"
            radius='none'
            variant="solid"
            onPress={options.onPrevious}
          >
            Previous
          </Button>
        )}
        {options.next && (
          <div className='w-full flex justify-end'>
            <Button
              className='rounded-tl-lg rounded-br-md -mr-1'
              color="primary"
              radius='none'
              variant="solid"
              onPress={options.onNext}
            >
              Next
            </Button>
          </div>
        )}
        {(options && !options?.end) && (
          <Link
            alt="End Tutorial"
            className='w-fi absolute text-xs border-b-1 border-l-1 border-gray-700 cursor-pointer px-2 py-1 top-[-1px] right-[-1px] rounded-tr-md rounded-bl-lg font-bold text-gray-700 uppercase'
            onPress={options.onEnd}
          >
            End Tutorial
          </Link>
        )}
        {options.end && (
          <div className='w-full flex justify-end'>
          <Button
            className='rounded-tl-lg rounded-br-md -mr-1'
            color="danger"
            radius='none'
            variant="solid"
            onPress={options.onEnd}
          >
            End Tutorial
          </Button>
          </div>
        )}

      </div>
    </div>
  );

  logger.debug(`[TUTORIAL] - Showing anchored toast at position: (${left}, ${top})`);

  toast(toastContent, {
    ...options,
    unstyled: true,
    duration: Infinity, // Keep the toast open until explicitly dismissed
    onDismiss: options.onDismiss,
    closeButton: false,
    position: 'none',
    className: `fixed w-fit h-fit max-w-[350px] transform translate-x-[-50%] p-0 shadow-md rounded-lg border-0 z-50 overflow-hidden`,
    style: {
      top: `${top}px`,
      left: `${left}px`,
      ...options.style,
    },
  });
};
