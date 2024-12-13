import React, { createContext, useContext } from "react";


const SessionContext = createContext();

export const SessionProvider = ({ children, sessionData, sessionId, updateSessionData, updateFormData, setError }) => {
    //logger.info("SessionProvider initialized with:", { sessionData, sessionId, updateFormData })

    return (
        <SessionContext.Provider value={{ sessionData, sessionId, updateSessionData, updateFormData, setError }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSessionContext = () => useContext(SessionContext);
