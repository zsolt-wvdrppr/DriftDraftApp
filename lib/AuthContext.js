'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import logger from '@/lib/logger'; // Import your logger if available, or use console.log
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logoutEvent, setLogoutEvent] = useState(false);
    const [loginEvent, setLoginEvent] = useState(false);
    const [authEvent, setAuthEvent] = useState(null);

    useEffect(() => {
        let isMounted = true; // To prevent state updates if the component unmounts

        const getUser = async () => {
            const { data, error } = await supabase.auth.getUser();

            if (error) {
                //console.warn("No user session found or error fetching user:", error.message);
                if (isMounted) {
                    setUser(null);
                    setLoading(false);
                }

                return;
            }

            if (isMounted) {
                setUser(data?.user || null);
                if (data?.user) {
                    setLoginEvent(true);
                }
                setLoading(false);
            }
        };

        getUser();

        const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
            if (isMounted) {
                // Log the auth event type
                if (typeof logger !== 'undefined') {
                    logger.debug(`Auth state changed: ${event}`);
                } else {
                    logger.info(`Auth state changed: ${event}`);
                }
                
                // Store the event type
                setAuthEvent(event);
                
                // Handle various auth events
                switch (event) {
                    case 'PASSWORD_RECOVERY':
                        // Don't update user state or redirect on password recovery
                        // This prevents redirects when landing on reset password page
                        break;
                        
                    case 'SIGNED_IN':
                        setUser(session?.user || null);
                        setLoginEvent(true);
                        break;
                        
                    case 'SIGNED_OUT':
                        setUser(null);
                        setLogoutEvent(true);
                        break;
                        
                    case 'USER_UPDATED':
                        // Handle user profile updates including password changes
                        setUser(session?.user || null);
                        break;
                        
                    default:
                        // For other events, update the user state if session exists
                        setUser(session?.user || null);
                }
            }
        });

        return () => {
            isMounted = false; // Cleanup flag
            subscription?.unsubscribe(); // Cleanup subscription
        };
    }, []); // Only runs on mount

    const logout = async () => {
        if (!user) {
            console.warn("No active session, skipping logout.");
            
            return;
        }
    
        try {
            const { error } = await supabase.auth.signOut({ scope: "local" });
            
            if (error) throw error;
    
            setLogoutEvent(true);
            setUser(null);
        } catch (err) {
            console.error("Logout error:", err.message);
        }
    };

    useEffect(() => {
        if (logoutEvent) {
            setLogoutEvent(false);
        }
        if (loginEvent) {
            setLoginEvent(false);
        }
    }, [logoutEvent, loginEvent]);

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            logout, 
            loginEvent, 
            logoutEvent,
            authEvent 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);