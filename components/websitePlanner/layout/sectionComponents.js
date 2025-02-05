import React from 'react';
import { Textarea, Button } from '@heroui/react';

import { cn } from '@/lib/utils/utils';

export const StepOuterWrapper = ({ className = '', children }) => {

const _className = " " + className;

  return (
    <div className={cn("flex flex-col md:grid md:grid-cols-4 gap-2 md:gap-6 md:py-10 max-w-screen-xl px-6 md:px-0" + _className)}>
      {children}
    </div>
  )
}

export const StepInnerWrapper = ({ className = '', children }) => {

  const _className = " " + className;

  return (
    <div className={cn("col-span-3 flex-1 md:space-y-4" + _className)}>
      {children}
    </div>
  )
}

import Sidebar from '@/components/websitePlanner/ActionsBar/Sidebar'

export const StepWrapper = ({ whyDoWeAsk, userMsg, hint, className = null, children }) => {
  
  return (
    <StepOuterWrapper className={className}>
      <StepInnerWrapper>
        {children}
      </StepInnerWrapper>
      <Sidebar hint={hint} userMsg={userMsg} whyDoWeAsk={whyDoWeAsk} />
    </StepOuterWrapper>
  )
}

export const StepQuestion = ({ content, question, className = '' }) => {

  // check if content is an array

  const _className = " " + className;

  return (
    <h2 className={cn("text-lg font-semibold mb-4 text-primary dark:text-accentMint whitespace-break-spaces" + _className)}>
      {question ? question : content?.question} {content?.required && <span className="text-red-500">*</span>}
    </h2>
  )
}

export const StepTextarea = ({ content, label, localValue, handleTextareaChange, isRequired, isInputInvalid, placeholder }) => {
  return (
    <Textarea
      classNames={{
        label: "!text-primary dark:!text-accentMint",
        input: "resize-none pt-2",
        base: "",
        inputWrapper: `dark:bg-content1 focus-within:!bg-content1 pt-6 border ${isInputInvalid ? "!bg-red-50 border-danger dark:!bg-content1" : ""}`,
      }}
      isClearable={true}
      isRequired={isRequired}
      label={label}
      maxRows={25}
      minRows={4}
      placeholder={placeholder || content.placeholder}
      validationBehavior='aria'
      value={localValue}
      onChange={handleTextareaChange}
      onClear={() => handleTextareaChange({ target: { value: '' } })}
    />
  )
}




