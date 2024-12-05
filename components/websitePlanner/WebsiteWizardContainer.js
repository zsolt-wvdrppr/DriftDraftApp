'use client';

import React, { useState, useRef, useEffect, useTransition, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { toast } from 'sonner';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@nextui-org/react";
import { IconCheck, IconPlant, IconUsersGroup, IconMagnet, IconRocket, IconDiamond, IconWorldWww, IconWriting, IconMoodSmileBeam, IconBulb, IconAddressBook, IconFlagQuestion } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

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

export default function WebsiteWizardContainer() {

    // Initialize formData from localStorage if it exists
    const initialFormData = () => {
        const savedData = localStorage.getItem('formData');
        if (savedData) {
            try {
                //console.log("restore from local storage");
                return JSON.parse(savedData); // Restore from localStorage
            } catch (error) {
                console.error("Error parsing saved formData:", error);
                localStorage.removeItem('formData'); // Clear invalid data
                //console.log("empty local storage");
                return {}; // Fallback to empty object
            }
        }
        return {}; // Default empty state
    };

    const [formData, setFormData] = useState(null); // Form data state

    const [isSubmitted, setIsSubmitted] = useState(false); // Track submission state
    const [currentStep, setCurrentStep] = useState(0);
    const [tabName, setTabName] = useState(steps[0]?.label || '');
    const stepRef = useRef(null);
    const [error, setError] = useState(null);
    const [isPending, startTransition] = useTransition();

    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(true); // Mock auth flag

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const data = initialFormData();
            setFormData(data);
        }
    }, []);

    /*useEffect(() => {
        if (!isLoggedIn) {
            const redirectUrl = `/login?redirect=/website-planner?step=${currentStep}`;
            router.push(redirectUrl);
        }
    }, [isLoggedIn, currentStep]);*/

    // Handle navigation and restore currentStep from query params
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const step = searchParams.get('step') || undefined;
        //setIsLoggedIn(true);
        if (step) {
            setCurrentStep(parseInt(step, 10));
        }
    }, []);

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('formData');
        setFormData(initialFormData); // Reset to initial state
        router.push('/login');
    };

    // Save formData to localStorage whenever it changes
    useEffect(() => {
        if (!formData) return;
        localStorage.setItem('formData', JSON.stringify(formData));
    }, [formData]);

    // Dynamically update tabName based on the current step
    useEffect(() => {
        setTabName(steps[currentStep]?.label || '');
        toast.dismiss();
    }, [currentStep]);

    const errorToast = (message) => {
        toast.error(message, { duration: 5000, closeButton: true, classNames: { toast: "text-danger" } });
    }

    // Handle error toast and reset
    useEffect(() => {
        if (error) {
            errorToast(error);
            setFormData((prev) => ({ ...prev, [currentStep]: { ...prev?.[currentStep], isValid: false } }));
            const timeout = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timeout);
        }
    }, [error]);

    const updateUrlParams = (step) => {
            //const newUrl = `${window.location.pathname}?step=${step}`;
            const newUrl = `${window.location.pathname}`;
            window.history.replaceState(null, '', newUrl);
    }

    // Validate the current step and move to the next one
    const goToNextStep = () => {
        const _isValid = handleValidation();
        if (_isValid) {
            if (currentStep < steps.length - 1) {
                setCurrentStep((prev) => prev + 1);
                updateUrlParams(currentStep + 1);
            }
        }
    };

    const handleValidation = () => {
        if (stepRef.current?.validateStep()) {
            setFormData((prev) => ({
                ...prev,
                [currentStep]: { ...prev[currentStep], isValid: true },
            }));
            return true;
        } else {
            //setError('Please complete the current step before proceeding.');
            return false;
        }
    };

    // Navigate to the previous step
    const goToPreviousStep = () => {
        if (currentStep > 0) setCurrentStep((prev) => prev - 1);
        updateUrlParams(currentStep - 1);
    };

    // Handle form submission
    const handleSubmit = async () => {
        if (!isLoggedIn) {
            const redirectPath = `/login?redirect=/website-planner?step=${currentStep}`;
            router.push(redirectPath);
            return;
        }

        // Submit the form if logged in
        console.log('Form submitted successfully!');
        // Add submission logic here


        // Validate the current step first
        const isCurrentStepValid = stepRef?.current?.validateStep();

        if (!isCurrentStepValid) {
            setError(`Please complete the current step: ${steps[currentStep]?.label}`);
            return;
        }

        // Validate all steps in formData
        const updatedFormData = { ...formData };
        let allStepsValid = true;

        for (const step of steps) {
            const stepId = step.id;
            if (!updatedFormData[stepId]?.isValid) {
                const isValid = stepRef?.current?.validateStep();
                updatedFormData[stepId] = {
                    ...updatedFormData[stepId],
                    isValid,
                };

                if (!isValid) {
                    allStepsValid = false;
                }
            }
        }

        // Update formData state
        setFormData(updatedFormData);

        // If all steps are valid, proceed with submission
        if (allStepsValid) {
            startTransition(async () => {
                try {
                    const response = await fetch('/api/submit', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedFormData),
                    });

                    if (response.ok) {
                        //alert('Form submitted successfully!');
                        localStorage.removeItem('formData'); // Clear cache on success
                        //console.log('cache cleared');
                        setIsSubmitted(true); // Switch to results view
                    } else {
                        alert('Submission failed!');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('An error occurred while submitting.');
                }
            });
        } else {
            setError(`Please complete all steps before submitting.`);
        }
    };

    const CurrentStepComponent = steps[currentStep]?.component;

    const handleSectionPicker = (index) => {
        const _isValid = handleValidation();
        if (_isValid) {
            if (index <= currentStep + 1) {
                setCurrentStep(index);
                updateUrlParams(index);
                return;
            }
            if (formData && formData[index - 1]?.isValid) {
                setCurrentStep(index);
                updateUrlParams(index);
                return;
            }
        } else {
            if (index < currentStep) {
                setCurrentStep(index);
                updateUrlParams(index);
                return;
            }
        }
        const errorMsg = `Don't jump ahead! Please navigate to the next question.`;

        if (index > currentStep + 1) {
            setError(errorMsg);
        }
        //setCurrentStep(index);
    }

    if (isSubmitted) {
        // Render the Result component if the form is submitted
        return <Result formData={formData} />;
    }

    return (
        <div className="wizard-container relative max-w-screen-xl w-full h-max px-4 md:py-4">
            <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
            {/* Dropdown for Navigation */}
            <div className='w-full flex justify-around'>
                <Dropdown>
                    <DropdownTrigger>
                        <Button variant="flat" className="capitalize w-full md:max-w-80" color="secondary">
                            <div className="grid grid-cols-4 items-center w-full">
                                <span className="col-span-1 text-primary">{steps[currentStep]?.icon}</span>
                                <span className="col-span-2 text-lg">{tabName}</span>
                                <span className="col-span-1 justify-self-end">
                                    {formData && formData[currentStep]?.isValid && <IconCheck size={20} className='text-secondaryPersianGreen' />}
                                </span>
                            </div>
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Step navigation" variant="flat" color="primary">
                        {steps.map((step, index) => (
                            <DropdownItem
                                key={step.id}
                                onClick={() => handleSectionPicker(index)}
                                className={`flex flex-row hover:!text-neutralDark dark:hover:!text-slate-200 ${currentStep === index ? "bg-slate-200 dark:text-neutralDark font-bold" : ""}`}
                                textValue={step.label}
                            >
                                <div className="grid grid-cols-4 items-center w-full">
                                    <span className="col-span-1 text-primary">{step.icon}</span>
                                    <span className="col-span-2">{step.label}</span>
                                    <span className="col-span-1 justify-self-end">
                                        {formData && formData[step.id]?.isValid && <IconCheck size={16} className='text-secondaryPersianGreen' />}
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
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.5 }}
                        >
                            <CurrentStepComponent
                                ref={stepRef}
                                formData={formData}
                                setFormData={setFormData}
                                setError={setError}
                            />
                        </motion.div>
                    ) : (
                        <div className="text-center p-4">No component defined for this step.</div>
                    )}
                </AnimatePresence>
            </Suspense>
            {/* Navigation Buttons */}
            <div className="navigation-buttons w-full flex gap-2 justify-evenly py-8">
                <Button
                    disabled={currentStep <= 0}
                    variant="shadow"
                    color="secondary"
                    className="w-32 border border-secondaryTeal font-bold tracking-wider disabled:bg-gray-300 disabled:border-none"
                    onClick={goToPreviousStep}
                >
                    Previous
                </Button>
                {currentStep < steps.length - 1 ? (
                    <Button
                        variant="shadow"
                        color="secondary"
                        className="w-32 border border-secondaryTeal font-bold tracking-wider"
                        onClick={goToNextStep}
                        disabled={isPending}
                    >
                        {isPending ? 'Loading...' : 'Next'}
                    </Button>
                ) : (
                    <Button
                        variant="shadow"
                        color="secondary"
                        className="w-32 border border-secondaryTeal font-bold tracking-wider"
                        onClick={handleSubmit}
                        disabled={isPending}
                    >
                        {isPending ? 'Submitting...' : 'Submit'}
                    </Button>
                )}
            </div>
        </div>
    );
}
