'use client';

import React, { useRef, useState, useImperativeHandle, useEffect } from 'react';
import { Input, Button, Textarea } from '@heroui/react';
import { IconXboxXFilled, IconRowInsertBottom, IconWorldWww } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';

import questionsData from "@/data/questions-data.json";
import logger from '@/lib/logger';
import { useSessionContext } from '@/lib/SessionProvider';
import { StepWrapper, StepQuestion } from '@/components/planner-layout/layout/sectionComponents';

const StepInspirations = ({ ref }) => {
  const { sessionData, updateFormData, setError } = useSessionContext();
  const stepNumber = 8;
  const content = questionsData?.[stepNumber];
  const formRef = useRef();
  const formData = sessionData?.formData;

  useEffect(() => {
    if (!formData?.[stepNumber]?.urls) {

      updateFormData("urls", ['']);

    }
  }, [formData, stepNumber]);

  const [urls, setUrls] = useState(['']);
  const [inspirations, setInspirations] = useState(['']);

  useEffect(()=>{
    setUrls(formData?.[stepNumber]?.urls || ['']);
    setInspirations(formData?.[stepNumber]?.inspirations || ['']);
  },[])

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
    try {
      // Add protocol if missing to allow parsing with URL constructor
      const urlString = url?.includes('://') ? url : `https://${url}`;
      
      // Use the URL constructor to validate the structure
      const urlObj = new URL(urlString);
      
      // Extract the hostname for validation
      const hostname = urlObj?.hostname;
      
      // Basic domain validation
      const domainRegex = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]([a-z0-9-]*[a-z0-9])?$/i;
      
      return domainRegex.test(hostname);
    } catch (error) {
      // If URL constructor throws an error, the URL is invalid
      return false;
    }
  };

  const handleAddUrl = (index) => {
    if (!validateURL(urls?.[index])) {
      setError('Invalid URL. Please correct it before adding a new one.');

      return;
    }
    setError(null);
    const newUrls = [...urls, ''];
    const newInspirations = [...inspirations, ''];

    setUrls(newUrls);
    setInspirations(newInspirations);
    updateFormData('')
    updateFormData("urls", newUrls);
    updateFormData("inspirations", newInspirations);
  };

  const handleRemoveUrl = (index) => {
    const updatedUrls = urls?.filter((_, i) => i !== index);

    setUrls(updatedUrls?.length > 0 ? updatedUrls : ['']);

    const updatedInspirations = inspirations?.filter((_, i) => i !== index);

    setInspirations(updatedInspirations?.length > 0 ? updatedInspirations : ['']);

    updateFormData("urls", updatedUrls);
    updateFormData("inspirations", updatedInspirations?.length > 0 ? updatedInspirations : ['']);
  };

  const handleChangeUrl = (value, index) => {
    const updatedUrls = urls.map((url, i) => (i === index ? value : url));

    setUrls(updatedUrls);
    updateFormData("urls", updatedUrls);
  };

  const handleTextareaChange = (value, index) => {
    const updatedInspirations = inspirations?.map((inspiration, i) => (i === index ? value : inspiration));

    setInspirations(updatedInspirations);
    updateFormData("inspirations", updatedInspirations);
  };

  return (
    <form ref={formRef}>
      <StepWrapper hint={content?.hint} userMsg={content?.user_msg} whyDoWeAsk={content?.why_do_we_ask}>
        <StepQuestion content={content} />
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
                    base: "p-1",
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
                 {urls?.length > 1 && (
                  <IconXboxXFilled className='absolute -right-3 -top-3 md:left-1/4 md:top-14 opacity-70 text-danger cursor-pointer drop-shadow-lg hover:scale-110 hover:opacity-100 transition-all' onClick={() => handleRemoveUrl(index)} />
                )}
                <Textarea
                  classNames={{
                    base: "p-1",
                    label: "!text-primary dark:!text-accentMint",
                    input: "",
                    inputWrapper: `dark:bg-content1 focus-within:!bg-content1 border`,
                  }}
                  isRequired={false}
                  label="Notes"
                  minRows={4}
                  placeholder={"What do you like about this website?"}
                  value={inspirations?.[index] || ""}
                  onChange={(e) => handleTextareaChange(e.target.value, index)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          <Button
            className="m-1 mt-4 border hover:scale-105 transition-all focus-within:shadow-none"
            type="button"
            variant='shadow'
            onPress={() => handleAddUrl(urls?.length - 1)}
          >
            <IconRowInsertBottom className='text-secondaryPersianGreen' />
            Add Another URL
          </Button>
        </StepWrapper>
    </form>
  );
};

export default StepInspirations;
