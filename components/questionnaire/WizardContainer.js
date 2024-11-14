'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressBar from './ProgressBar';
import StepPurpose from './StepPurpose';
import StepAudience from './StepAudience';
import StepAttraction from './StepAttraction';

const steps = [
    { id: 1, component: StepPurpose },
    { id: 2, component: StepAudience },
    { id: 3, component: StepAttraction },
    // Add additional steps as needed
];

export default function WizardContainer() {
    const [formData, setFormData] = useState({
        purpose: '',
        targetAudience: '',
        attractionMethods: '',
        competitors: [],
        // Additional fields...
    });

    console.log(formData);

    const [currentStep, setCurrentStep] = useState(0);

    const CurrentStepComponent = steps[currentStep].component;

    const goToNextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const goToPreviousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
    
            if (response.ok) {
                console.log('Form submitted successfully');
            } else {
                console.error('Submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    

    return (
        <div className="wizard-container">
            <ProgressBar currentStep={currentStep} totalSteps={steps.length} />
            
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep} // Framer Motion needs a unique key for each step
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                >
                    <CurrentStepComponent formData={formData} setFormData={setFormData} />
                </motion.div>
            </AnimatePresence>

            <div className="navigation-buttons">
                {currentStep > 0 && <button onClick={goToPreviousStep}>Previous</button>}
                {currentStep < steps.length - 1 ? (
                    <button onClick={goToNextStep}>Next</button>
                ) : (
                    <button onClick={handleSubmit}>Submit</button>
                )}
            </div>
        </div>
    );
}
