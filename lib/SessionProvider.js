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
    sessionData, // Current session data
    isInitialised, // Whether the current session is initd
    paidServicesData,
    refreshPaidServicesData,
    initSession, // Initialize a session by ID
    fetchFormData, // Fetch only formData
    fetchOutput, // Fetch only AI output
    updateSessionData, // Update session data (e.g., formData or output)
    clearSessionData, // Clear the current session
    clearLocalStorage, // Clear local storage
    logOutUser,
    startNewSession, // Start a new session
    fetchAllSessions, // Fetch all session IDs and metadata
    getSessionData, // Fetch session data by ID and
    fetchAllSessionsFromDb,
    fetchAiGeneratedPlanFromDb,
    fetchSessionFromDb,
    updateSessionInDb,
    updateFormInDb,
    updateAiGeneratedPlanInDb,
    updateSessionTitleInDb,
    updateEditedInDb,
    deleteSessionFromDb,
    initSessionFromDb,
  } = useManageSessionData(user?.id, steps); // Dynamically manage steps
  const [error, setError] = useState(null);

  // Function to handle form data updates
  const updateFormData = (keyOrStep, valueOrObject) => {
    const formData = sessionData?.formData || {};
    const isFullStepUpdate =
      typeof keyOrStep === "number" && typeof valueOrObject === "object";
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

      return () => clearTimeout(updateTimer);
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
        paidServicesData,
        refreshPaidServicesData,
        initSession,
        error,
        setError,
        clearLocalStorage,
        clearSessionData,
        logOutUser,
        startNewSession,
        fetchFormData, // Fetch only formData
        fetchOutput,
        fetchAllSessions, // Fetch all session IDs and metadata
        getSessionData, // Fetch session data by ID and
        fetchAllSessionsFromDb,
        fetchAiGeneratedPlanFromDb,
        fetchSessionFromDb,
        updateSessionInDb,
        updateFormInDb,
        updateAiGeneratedPlanInDb,
        updateSessionTitleInDb,
        updateEditedInDb,
        deleteSessionFromDb,
        initSessionFromDb,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

// Add safeguard directly in the hook
export const useSessionContext = () => {
  const context = useContext(SessionContext);
  
  // Return a safe default object with empty functions if context is undefined
  if (!context) {
    logger.warn('useSessionContext must be used within a SessionProvider');

    return {
      sessionData: null,
      updateSessionData: () => {},
      steps: [],
      setSteps: () => {},
      currentStep: 0,
      setCurrentStep: () => {},
      updateFormData: () => {},
      isInitialised: false,
      paidServicesData: null,
      refreshPaidServicesData: () => {},
      initSession: () => {},
      error: null,
      setError: () => {},
      clearLocalStorage: () => {},
      clearSessionData: () => {},
      logOutUser: () => {},
      startNewSession: () => {},
      fetchFormData: () => {},
      fetchOutput: () => {},
      fetchAllSessions: () => {},
      getSessionData: () => {},
      fetchAllSessionsFromDb: () => {},
      fetchAiGeneratedPlanFromDb: () => {},
      fetchSessionFromDb: () => {},
      updateSessionInDb: () => {},
      updateFormInDb: () => {},
      updateAiGeneratedPlanInDb: () => {},
      updateSessionTitleInDb: () => {},
      updateEditedInDb: () => {},
      deleteSessionFromDb: () => {},
      initSessionFromDb: () => {},
    };
  }
  
  return context;
};
