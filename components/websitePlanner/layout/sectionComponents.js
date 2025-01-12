import React from 'react'
import { cn } from '@/lib/utils'
import { Textarea, Button } from '@nextui-org/react';

export const StepOuterWrapper = ({ className, children }) => {
  return (
    <div className={cn("flex flex-col md:grid md:grid-cols-4 gap-6 md:py-10 max-w-screen-xl" + " " + className)}>
      {children}
    </div>
  )
}

export const StepInnerWrapper = ({ className, children }) => {
  return (
    <div className={cn("col-span-3 flex-1 space-y-4" + className)}>
      {children}
    </div>
  )
}

import Sidebar from '@/components/websitePlanner/ActionsBar/Sidebar'

export const StepWrapper = ({ whyDoWeAsk, userMsg, hint, className, children }) => {
  return (
    <StepOuterWrapper className={className}>
      <StepInnerWrapper>
        {children}
      </StepInnerWrapper>
      <Sidebar hint={hint} userMsg={userMsg} whyDoWeAsk={whyDoWeAsk} />
    </StepOuterWrapper>
  )
}

export const StepQuestion = ({ content, className }) => {
  return (
    <h2 className={cn("text-lg font-semibold mb-4 text-primary dark:text-accentMint my-4" + className)}>
      {content?.question} {content?.required && <span className="text-red-500">*</span>}
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
      isRequired={isRequired}
      label={label}
      minRows={4}
      maxRows={25}
      placeholder={placeholder || content.placeholder}
      value={localValue}
      onChange={handleTextareaChange}
      validationBehavior='aria'
      autoGrow
    />
  )
}

import { IconAi } from '@tabler/icons-react';

export const StepGetAiHintBtn = ({ isPending, isAIAvailable, handleUnavailableBtn, handleAvailableBtn, label = 'Get AI Hint' }) => {
  return (
    <div className="flex relative justify-end mb-4">
      <Button
        color="primary"
        isLoading={isPending}
        //isDisabled={isAIAvailable}
        onPress={handleUnavailableBtn}
        className={`${isAIAvailable ? "hidden" : "flex"} items-center gap-2 opacity-50 hover:!opacity-50`}
      >
        <IconAi size={20} />
        {label}
      </Button>
      <Button
        color="primary"
        isLoading={isPending}
        //isDisabled={!isAIAvailable}
        onPress={handleAvailableBtn}
        className={`${!isAIAvailable ? "hidden" : "flex"} items-center gap-2`}
      >
        <IconAi size={20} />
        {label}
      </Button>
    </div>
  )
}





