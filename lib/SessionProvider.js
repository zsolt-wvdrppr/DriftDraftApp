import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useManageSessionData } from "@/lib/hooks/useManageSessionData";
import logger from "@/lib/logger";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
    const { user, loading } = useAuth();
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    const {
        sessionData,
        updateSessionData,
        isInitialised,
        initialiseSession,
        clearLocalStorage,
    } = useManageSessionData(user?.id, steps); // Dynamically manage steps
    const [error, setError] = useState(null);

    // Function to handle form data updates
    const updateFormData = (keyOrStep, valueOrObject) => {
        const formData = sessionData?.formData || {};
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

    useEffect(() => {
        if (isInitialised) {
            logger.debug("[SessionProvider] - Session Data Initialized", sessionData);
        }
    }, [isInitialised, sessionData]);

    return (
        <SessionContext.Provider
            value={{
                sessionData,
                updateSessionData,
                steps,
                setSteps,
                currentStep,
                setCurrentStep,
                updateFormData, // Retain this method
                isInitialised,
                initialiseSession,
                error,
                setError,
                clearLocalStorage,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};

export const useSessionContext = () => useContext(SessionContext);
