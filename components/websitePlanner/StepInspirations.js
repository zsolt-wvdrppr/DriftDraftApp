'use client';

import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Input, Button, Textarea } from '@nextui-org/react';
import { IconXboxXFilled, IconRowInsertBottom, IconWorldWww } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

import questionsData from "@/data/questions-data.json";
import logger from '@/lib/logger';

import Sidebar from './actionsBar';

const StepInspirations = forwardRef(({ formData, setFormData, setError }, ref) => {
  const stepNumber = 8;
  const content = questionsData[stepNumber];
  const formRef = useRef();

  useEffect(() => {
    if (!formData[stepNumber]?.urls) {
      setFormData({
        ...formData,
        [stepNumber]: { ...formData[stepNumber], urls: [''] },
      });
    }
  }, [formData, setFormData, stepNumber]);

  const [urls, setUrls] = useState(formData[stepNumber]?.urls || ['']);
  const [inspirations, setInspirations] = useState(formData[stepNumber]?.inspirations || ['']);

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      if (urls.some((url) => !validateURL(url) && url !== '')) {
        setError("All URLs must be valid.");
        logger.info("urls", urls);

        return false;
      }
      /*if (urls.length === 0 || urls.includes('')) {
        setError("Additional details are required.");
        return false;
      }*/
      setError(null);

      return true; // Validation passed
    },
  }));

  const validateURL = (url) => {
    // Remove protocol if present for domain validation
    const domainPart = url.replace(/^https?:\/\//, '');
    const parts = domainPart.split('.');

    // If starts with www, need 3 parts, else need 2 parts
    if ((parts[0] === 'www' && parts.length < 3) ||
      (parts[0] !== 'www' && parts.length < 2)) return false;

    const domainPartPattern = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i;

    return parts.every(part => domainPartPattern.test(part));
  };

  const handleAddUrl = (index) => {
    if (!validateURL(urls[index])) {
      setError('Invalid URL. Please correct it before adding a new one.');

      return;
    }
    setError(null);
    const newUrls = [...urls, ''];
    const newInspirations = [...inspirations, ''];

    setUrls(newUrls);
    setInspirations(newInspirations);
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], urls: newUrls, inspirations: newInspirations } });
  };

  const handleRemoveUrl = (index) => {
    const updatedUrls = urls.filter((_, i) => i !== index);

    setUrls(updatedUrls.length > 0 ? updatedUrls : ['']);
    const updatedInspirations = inspirations.filter((_, i) => i !== index);

    setInspirations(updatedInspirations.length > 0 ? updatedInspirations : ['']);
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], urls: updatedUrls, inspirations: updatedInspirations } });
  };

  const handleChangeUrl = (value, index) => {
    const updatedUrls = urls.map((url, i) => (i === index ? value : url));

    setUrls(updatedUrls);
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], urls: updatedUrls } });
  };

  const handleTextareaChange = (value, index) => {
    const updatedInspirations = inspirations.map((inspiration, i) => (i === index ? value : inspiration));

    setInspirations(updatedInspirations);
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], inspirations: updatedInspirations } });
  };

  return (
    <form ref={formRef}>
      <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:py-10 max-w-screen-xl">
        <div className="col-span-3 flex-1 space-y-4">
        <h2 className="text-lg font-semibold my-4 text-primary dark:text-accentMint">
            {content.question} {content.required && <span className="text-red-500">*</span>}
          </h2>
          <AnimatePresence initial={false}>
            {urls.map((url, index) => (
              <motion.div
                key={index}
                animate={{ opacity: 1, height: 'auto' }}
                className="relative flex flex-col md:flex-row md:items-start items-center gap-2 pb-4"
                exit={{ opacity: 0, height: 0 }}
                initial={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Input
                  classNames={{
                    label: "!text-primary dark:!text-accentMint",
                    input: ``,
                    inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${!validateURL(url) && url ? "border-danger" : ""}`,
                  }}
                  label={`URL ${index + 1}`}
                  placeholder={content.placeholder}
                  startContent={<IconWorldWww className='h-5 text-primary dark:text-accentMint opacity-70 ml-[-3px]' />}
                  value={url}
                  //isRequired={true}
                  onChange={(e) => handleChangeUrl(e.target.value, index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevent form submission
                      handleAddUrl(index); // Call the function to add a new URL
                    }
                  }}
                />
                 {urls.length > 1 && (
                  <IconXboxXFilled className='absolute -right-3 -top-3 md:left-1/4 md:top-14 opacity-70 text-danger cursor-pointer drop-shadow-lg hover:scale-110 hover:opacity-100 transition-all' onClick={() => handleRemoveUrl(index)} />
                )}
                <Textarea
                  classNames={{
                    label: "!text-primary dark:!text-accentMint",
                    input: "",
                    inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border`,
                  }}
                  isRequired={false}
                  label="Notes"
                  minRows={4}
                  placeholder={"What do you like about this website?"}
                  value={formData?.[stepNumber]?.inspirations?.[index] || ""}
                  onChange={(e) => handleTextareaChange(e.target.value, index)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          <Button
            className="mt-4 border hover:scale-105 transition-all focus-within:shadow-none"
            type="button"
            variant='shadow'
            onClick={() => handleAddUrl(urls.length - 1)}
          >
            <IconRowInsertBottom className='text-secondaryPersianGreen' />
            Add Another URL
          </Button>
        </div>
        <Sidebar hints={content.hints} whyDoWeAsk={content.why_do_we_ask} />
      </div>
    </form>
  );
});

StepInspirations.displayName = 'StepInspirations';

export default StepInspirations;
