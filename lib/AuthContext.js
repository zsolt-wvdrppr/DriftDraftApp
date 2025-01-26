'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [logoutEvent, setLogoutEvent] = useState(false);
    const [loginEvent, setLoginEvent] = useState(false);

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
                setUser(data || null);
                if (data) {
                    setLoginEvent(true);
                }
                setLoading(false);
            }
        };



        getUser();

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
            if (isMounted) {
                setUser(session?.user || null);
            }
        });

        return () => {
            isMounted = false; // Cleanup flag
            subscription?.unsubscribe(); // Cleanup subscription
        };
    }, []); // Only runs on mount



    const logout = async () => {
        await supabase.auth.signOut();
        setLogoutEvent(true);
        setUser(null); // Clear the user state
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
        <AuthContext.Provider value={{ user, loading, logout, loginEvent, logoutEvent }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
