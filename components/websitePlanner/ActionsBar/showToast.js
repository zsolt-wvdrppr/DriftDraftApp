'use client';

import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { Button } from '@nextui-org/react';
import { IconCopy, IconSquareRoundedX } from '@tabler/icons-react';

export const showHintToast = (hints, hintToastRef, onCopySuccess, onDismiss, userMsg) => {
    

  // Dismiss the existing hint toast if it exists
  if (hintToastRef.current) {
    //toast.dismiss(hintToastRef.current);
    hintToastRef.current = null;
  }

  const handleCopyClick = () => {
    // Copy hint to clipboard
    toast.dismiss(); // Close all active toasts
    navigator.clipboard.writeText(hints);
    // Show success toast
    toast.success("Hints copied to clipboard", {
      duration: 2000,
      classNames: { toast: 'text-green-600' },
    });
  };

  const newToastId = toast.custom(() => (
    <div className="p-4 shadow-lg rounded-lg bg-white/90 max-h-[90vh] overflow-y-auto select-text">
      <h4 className="font-bold">Hint</h4>
      <ReactMarkdown className="whitespace-pre-wrap py-6">{`${hints}`}</ReactMarkdown>
      {userMsg && <p className="text-sm text-gray-500 pb-6 text-right">{userMsg}</p>}
      <div className="flex justify-between">
        <Button
          color="secondary"
          variant="bordered"
          onPress={() => {
            handleCopyClick();
            onCopySuccess?.(); // Call optional onCopySuccess callback
          }}
        >
          <IconCopy size={20} />
          Copy
        </Button>
        <Button
          color="danger"
          variant="bordered"
          onPress={() => {
            toast.dismiss(newToastId);
            hintToastRef.current = null;
            onDismiss?.(); // Call optional onDismiss callback
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
      onDismiss?.(); // Call optional onDismiss callback
    },
  });

  hintToastRef.current = newToastId;
};

export const showWhyWeAskToast = (reason, whyToastRef, onDismiss) => {

  // Dismiss the existing why toast if it exists
  if (whyToastRef.current) {
    //toast.dismiss(whyToastRef.current);
    whyToastRef.current = null;
  }

  const newToastId = toast.custom(() => (
    <div className="p-4 shadow-lg rounded-lg bg-white/90">
      <h4 className="font-bold">Reason we ask</h4>
      <ReactMarkdown className="whitespace-pre-wrap py-6">{reason}</ReactMarkdown>
      <div className="flex justify-end">
        <Button
          color="danger"
          variant="bordered"
          onPress={() => {
            toast.dismiss();
            whyToastRef.current = null;
            onDismiss?.(); // Call optional onDismiss callback
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
      onDismiss?.(); // Call optional onDismiss callback
    },
  });

  whyToastRef.current = newToastId;
};
