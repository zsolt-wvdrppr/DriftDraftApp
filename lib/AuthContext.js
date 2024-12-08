'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if there's an active session on initial load
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
            setLoading(false);
        };

        getUser();

        // Listen for auth state changes
        const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

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
