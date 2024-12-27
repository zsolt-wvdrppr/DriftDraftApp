import React, { createContext, useContext } from "react";
import { useAuth } from "@/lib/AuthContext";
import logger from "@/lib/logger";


const SessionContext = createContext();

export const SessionProvider = ({ children, sessionData, sessionId, updateSessionData, updateFormData, setError }) => {
    logger.info("SessionProvider initialized with:", { sessionData, sessionId, updateFormData })
    const { user } = useAuth();

    logger.debug("[SessionProvider] - user ID", user?.id);
    if (user?.id) {
        updateSessionData( "userId", user.id );
    }


    return (
        <SessionContext.Provider value={{ sessionData, sessionId, updateSessionData, updateFormData, setError }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSessionContext = () => useContext(SessionContext);
