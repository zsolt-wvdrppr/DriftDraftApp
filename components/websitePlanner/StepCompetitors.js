'use client';

import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { Input, Button } from '@nextui-org/react';
import Sidebar from './actionsBar';
import questionsData from "@/data/questions-data.json";
import { IconXboxXFilled, IconRowInsertBottom, IconWorldWww } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

const StepCompetitors = forwardRef(({ formData, setFormData, setError }, ref) => {
  const stepNumber = 3;
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

  useImperativeHandle(ref, () => ({
    validateStep: () => {
      if (urls.some((url) => !validateURL(url) && url !== '')) {
        setError("All URLs must be valid.");
        console.log("urls", urls);
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
    setUrls(newUrls);
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], urls: newUrls } });
  };

  const handleRemoveUrl = (index) => {
    const updatedUrls = urls.filter((_, i) => i !== index);
    setUrls(updatedUrls.length > 0 ? updatedUrls : ['']);
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], urls: updatedUrls } });
  };

  const handleChangeUrl = (value, index) => {
    const updatedUrls = urls.map((url, i) => (i === index ? value : url));
    setUrls(updatedUrls);
    setFormData({ ...formData, [stepNumber]: { ...formData[stepNumber], urls: updatedUrls } });
  };

  return (
    <form ref={formRef}>
      <div className="flex flex-col md:grid md:grid-cols-4 gap-6 md:py-10 max-w-screen-xl">
        <div className="col-span-4 flex-1">
          <h2 className="text-lg font-semibold my-4 text-primary dark:text-slate-100">
            {content.question} {content.required && <span className="text-red-500">*</span>}
          </h2>
        </div>
        <div className="col-span-3 flex-1 space-y-4">
          <AnimatePresence initial={false}>
            {urls.map((url, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Input
                  label={`Competitor URL ${index + 1}`}
                  placeholder={content.placeholder}
                  value={url}
                  startContent={<IconWorldWww className='h-5 text-primary dark:text-accentMint opacity-70 ml-[-3px]' />}
                  //isRequired={true}
                  onChange={(e) => handleChangeUrl(e.target.value, index)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault(); // Prevent form submission
                      handleAddUrl(index); // Call the function to add a new URL
                    }
                  }}
                  classNames={{
                    label: "!text-primary dark:!text-accentMint",
                    input: ``,
                    inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border ${!validateURL(url) && url ? "border-danger" : ""}`,
                  }}
                />
                {urls.length > 1 && (
                  <IconXboxXFilled onClick={() => handleRemoveUrl(index)} className='text-danger cursor-pointer drop-shadow-lg opacity-70 hover:opacity-100 hover:scale-110 transition-all' />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <Button
            type="button"
            variant='shadow'
            onClick={() => handleAddUrl(urls.length - 1)}
            className="mt-4 border hover:scale-105 transition-all focus-within:shadow-none"
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

StepCompetitors.displayName = 'StepCompetitors';

export default StepCompetitors;
