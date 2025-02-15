'use client';

import React, { useState, useRef, useEffect, useTransition, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { IconCheck, IconPlant, IconUsersGroup, IconMagnet, IconRocket, IconDiamond, IconWorldWww, IconWriting, IconMoodSmileBeam, IconBulb, IconAddressBook } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { Spinner } from "@heroui/react";

import logger from '@/lib/logger';
import { useAuth } from '@/lib/AuthContext';
import {
    updateUrlParams,
    handleValidation,
    goToNextStep,
    goToPreviousStep,
    handleSubmit,
    handleSectionPicker
} from '@/lib/websitePlannerFormNavigation';
import { useProfileUpdater } from '@/lib/hooks/useProfileUpdater';
import { useRestoreStep } from '@/lib/hooks/useRestoreStep';
import { useUpdateTabName } from '@/lib/hooks/useUpdateTabName';
import { useSessionContext } from "@/lib/SessionProvider";

import ProgressBar from './ProgressBar';
import StepPurpose from './StepPurpose';
import StepAudience from './StepAudience';
import StepMarketing from './StepMarketing';
import StepCompetitors from './StepCompetitors';
import StepUSPs from './StepUSPs';
import StepDomain from './StepDomain';
import StepBrandGuidelines from './StepBrandGuidelines';
import StepEmotions from './StepEmotions';
import StepInspirations from './StepInspirations';
import StepContactInfo from './StepContactInfo';
import Result from './Result';
import { PreviousButton, NextButton, SubmitButton } from '@/components/planner-layout/layout/NavigationButtons';
import RestartSessionBtn from '@/components/planner-layout/layout/RestartSessionBtn';

// Step definitions
const steps = [
    { id: 0, label: "Purpose", icon: <IconPlant />, component: StepPurpose },
    { id: 1, label: "Audience", icon: <IconUsersGroup />, component: StepAudience },
    { id: 2, label: "Marketing", icon: <IconMagnet />, component: StepMarketing },
    { id: 3, label: "Competitors", icon: <IconRocket />, component: StepCompetitors },
    { id: 4, label: "Unique Selling Points", icon: <IconDiamond />, component: StepUSPs },
    { id: 5, label: "Domain", icon: <IconWorldWww />, component: StepDomain },
    { id: 6, label: "Brand Guidelines", icon: <IconWriting />, component: StepBrandGuidelines },
    { id: 7, label: "Emotions", icon: <IconMoodSmileBeam />, component: StepEmotions },
    { id: 8, label: "Inspirations", icon: <IconBulb />, component: StepInspirations },
    { id: 9, label: "Contact Details", icon: <IconAddressBook />, component: StepContactInfo }
];

const tutorialSteps = [
    { title:"How To Start", message: "Hi there! Let’s take a quick tour to show you where everything is and how it works. You can click ‘END TUTORIAL’ anytime to skip.", targetClass: 'step-0' },
    { title:"Progress Bar", message: "This is the progress bar. It shows your progress across 10 sections in total.", targetClass: 'step-1' },
    { title:"Section Selector", message: "This drop-down menu is your section selector. Use it to quickly jump between sections. That's it for now, carry on testing.", targetClass: 'step-2' },
];

export default function LandingWizardContainer({ }) {

    const {
        sessionData,
        updateSessionData,
        isInitialised,
        initSession,
        error,
        setError,
        clearLocalStorage,
        currentStep,
        setCurrentStep,
        setSteps,
        updateSessionInDb,
        updateAiGeneratedPlanInDb,
        startNewSession,
    } = useSessionContext();

    useEffect(() => {
        setSteps(steps);
    }, []);

    const { user, loading } = useAuth(); // Access user state
    const [isSubmitted, setIsSubmitted] = useState(false); // Track submission state
    const [tabName, setTabName] = useState(steps[0]?.label || '');
    const stepRef = useRef(null);
    const [isPending, startTransition] = useTransition();
    const formData = sessionData?.formData || {};

    const router = useRouter();

    useProfileUpdater(user);
    useRestoreStep(formData, setCurrentStep, '/website-planner');
    useUpdateTabName(currentStep, steps, setTabName);

    const errorToast = (message) => {
        toast.error(message, { duration: 5000, closeButton: true, classNames: { toast: "text-danger" } });
    }

    /*useEffect(() => {
        if (!isInitialised && !sessionData?.sessionId) {
            logger.debug('[WIZZ] No session data found. Starting new session.');
            startNewSession();
        }
    }, [isInitialised, sessionData]);*/

    // Handle error toast and reset
    useEffect(() => {
        if (error) {
            errorToast(error);
            handleFormDataUpdate("isValid", false);
            const timeout = setTimeout(() => setError(null), 5000);

            return () => clearTimeout(timeout);
        }
    }, [error]);

    const handleFormDataUpdate = (keyOrStep, valueOrObject) => {
        const isFullStepUpdate = typeof keyOrStep === "number" && typeof valueOrObject === "object";
        const stepNumber = isFullStepUpdate ? keyOrStep : currentStep;

        const stepData = formData[stepNumber] || {};

        const update = isFullStepUpdate
            ? { ...stepData, ...valueOrObject }
            : { ...stepData, [keyOrStep]: valueOrObject };

        // Check if update is actually needed
        if (JSON.stringify(formData[stepNumber]) === JSON.stringify(update)) {
            console.debug("No meaningful change detected. Skipping update.");

            return; // Prevent unnecessary update
        }

        const updatedFormData = {
            ...formData,
            [stepNumber]: update,
        };

        updateSessionData("formData", updatedFormData);
    };


    // Validate the current step and move to the next one
    const handleNext = () => {
        goToNextStep(
            currentStep,
            steps,
            validateStep,
            stepRef,
            formData,
            handleFormDataUpdate,
            setCurrentStep,
            updateUrlParams
        );
        if(user?.id && sessionData){
            logger.debug('[WIZZ] updating session data')
            const _userId = user.id;
            const _sessionId = sessionData.sessionId;
            const _sessionData = sessionData;

            updateSessionInDb(_userId, _sessionId, _sessionData);
        } else {
            logger.debug('[WIZZ] database update failed')
        }
        
    };

    // Navigate to the previous step
    const handlePrevious = () => {
        goToPreviousStep(currentStep, setCurrentStep, updateUrlParams);
    };


    // Handle form submission
    const handleFormSubmit = () => {
        handleSubmit(
            loading,
            user,
            router,
            currentStep,
            steps,
            stepRef,
            formData,
            handleFormDataUpdate,
            clearLocalStorage,
            setError,
            setIsSubmitted,
            startTransition
        );
        if(user?.id && sessionData){
            const _userId = user.id;
            const _sessionId = sessionData.sessionId;
            const _sessionData = sessionData;

            updateSessionInDb(_userId, _sessionId, _sessionData);
        }
    };


    const CurrentStepComponent = steps[currentStep]?.component;

    const handlePicker = (index) => {
        handleSectionPicker(
            index,
            currentStep,
            validateStep,
            formData,
            setCurrentStep,
            updateUrlParams,
            setError
        );
    };

    const validateStep = () => {
        return handleValidation(stepRef, currentStep, formData, handleFormDataUpdate);
    };

    if (loading || isPending || !isInitialised) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner color="primary" size="large" />
            </div>
        );
    }

    return (
        <div className="wizard-container w-full">
            <div className="step-0 sicky w-full -z-50"/>

            {isSubmitted && <Result formData={formData} />}

            {(!isSubmitted) &&

                <div className="wizard-container relative max-w-screen-xl w-full h-max px-0 md:py-4">
                    <div className="step-1 flex">
                    <RestartSessionBtn />
                    <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
                    </div>
                    {/* Dropdown for Navigation */}
                    <div className='step-2 w-full flex justify-around px-6 md:px-0 py-6 md:py-0'>
                        <Dropdown>
                            <DropdownTrigger>
                                <Button className="capitalize w-full md:max-w-80" color="secondary" variant="flat">
                                    <div className="grid grid-cols-4 items-center w-full">
                                        <span className="col-span-1 text-primary">{steps[currentStep]?.icon}</span>
                                        <span className="col-span-2 text-lg">{tabName}</span>
                                        <span className="col-span-1 justify-self-end">
                                            {formData && formData[currentStep]?.isValid && <IconCheck className='text-secondaryPersianGreen' size={20} />}
                                        </span>
                                    </div>
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Step navigation" color="primary" variant="flat">
                                {steps.map((step, index) => (
                                    <DropdownItem
                                        key={step.id}
                                        className={`flex flex-row hover:!text-neutralDark dark:hover:!text-slate-200 ${currentStep === index ? "bg-slate-200 dark:text-neutralDark font-bold" : ""}`}
                                        textValue={step.label}
                                        onPress={() => handlePicker(index)}
                                    >
                                        <div className="grid grid-cols-4 items-center w-full">
                                            <span className="col-span-1 text-primary">{step.icon}</span>
                                            <span className="col-span-2">{step.label}</span>
                                            <span className="col-span-1 justify-self-end">
                                                {formData && formData[step.id]?.isValid && <IconCheck className='text-secondaryPersianGreen' size={16} />}
                                            </span>
                                        </div>
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                    {/* Step Content with Loading Placeholder */}
                    <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
                        <AnimatePresence mode="wait">
                            {CurrentStepComponent ? (
                                <motion.div
                                    key={currentStep}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                    initial={{ opacity: 0, x: 50 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <CurrentStepComponent
                                        ref={stepRef}
                                    />
                                </motion.div>
                            ) : (
                                <div className="text-center p-4">No component defined for this step.</div>
                            )}
                        </AnimatePresence>
                    </Suspense>
                    {/* Navigation Buttons */}
                    <div className="navigation-buttons w-full flex gap-2 justify-evenly py-8">
                        <PreviousButton
                            disabled={currentStep <= 0}
                            onPress={handlePrevious}
                        />
                        {currentStep < steps.length - 1 ? (
                            <NextButton
                                isPending={isPending}
                                onPress={handleNext}
                            />
                        ) : (
                            <SubmitButton
                                isPending={isPending}
                                onPress={handleFormSubmit}
                            />
                        )}
                    </div>
                </div>
            }
        </div>
    );
}
