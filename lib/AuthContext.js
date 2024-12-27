'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true; // To prevent state updates if the component unmounts

        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (isMounted) {
                setUser(session?.user || null);
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
        setUser(null); // Clear the user state
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
