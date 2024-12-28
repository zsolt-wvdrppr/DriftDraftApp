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
        sessions,               // List of session metadata
        sessionData,            // Current session data
        isInitialised,          // Whether the current session is initialised
        initialiseSession,      // Initialize a session by ID
        fetchFormData,          // Fetch only formData
        fetchOutput,            // Fetch only AI output
        updateSessionData,      // Update session data (e.g., formData or output)
        clearSessionData,       // Clear the current session
        clearLocalStorage,      // Clear local storage
        fetchAllSessions,       // Fetch all session IDs and metadata
        getSessionData,         // Fetch session data by ID and
        fetchAllSessionsFromDb,
        fetchAiGeneratedPlanFromDb,
        fetchSessionFromDb,
        updateSessionInDb,
        updateFormInDb,
        updateAiGeneratedPlanInDb,
        updateSessionTitleInDb,
        updateEditedInDb,
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
        if (user?.id) {
            // Delay update for 1 second to prevent state update conflicts
            const updateTimer = setTimeout(() => {
                updateSessionData("userId", user.id);
            }, 1000);
        }
    }, [user]);


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
                clearSessionData,
                fetchFormData,          // Fetch only formData
                fetchOutput,
                fetchAllSessions,       // Fetch all session IDs and metadata
                getSessionData,         // Fetch session data by ID and
                fetchAllSessionsFromDb,
                fetchAiGeneratedPlanFromDb,
                fetchSessionFromDb,
                updateSessionInDb,
                updateFormInDb,
                updateAiGeneratedPlanInDb,
                updateSessionTitleInDb,
                updateEditedInDb,
            }}
        >
            {children}
        </SessionContext.Provider>
    );
};

export const useSessionContext = () => useContext(SessionContext);
