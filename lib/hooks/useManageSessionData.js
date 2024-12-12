import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { supabase } from '@/lib/supabaseClient';
import logger from '@/lib/logger';

const generateSessionId = () => uuidv4();

export function useManageSessionData(userId, steps) {
    const [sessions, setSessions] = useState([]); // List of session IDs
    const [sessionData, setSessionData] = useState({ sessionId: null, formData: {}, aiGeneratedPlan: null }); // Current session data
    const [isInitialised, setIsInitialized] = useState(false);

    useEffect(() => {
        logger.debug('sessionData updated:', sessionData);
    }, [sessionData]);


    // Fetch all session IDs and metadata
    const fetchAllSessions = async () => {
        if (!userId) return [];
        const { data, error } = await supabase
            .from('sessions')
            .select('id, created_at'); // Fetch only IDs and creation timestamps

        if (error) {
            logger.error('Error fetching sessions:', error.message);

            return [];
        }
        setSessions(data || []);
    };

    // Fetch specific session data
    const fetchSessionData = async (sessionId, columns = '*') => {
        const { data, error } = await supabase.from('sessions').select(columns).eq('id', sessionId).single();

        if (error) {
            logger.error(`Error fetching session (${columns}):`, error.message);

            return null;
        }

        return data;
    };

    // Initialize a specific session
    const initialiseSession = async () => {
        logger.info('Starting session initialisation...');
        const localSessionId = localStorage.getItem('sessionId');
        let session = null;
    
        try {
            if (localSessionId) {
                logger.info('Found sessionId in localStorage:', localSessionId);
                const localData = JSON.parse(localStorage.getItem('sessionData'));

                if (localData) {
                    logger.info('Restored session data from localStorage:', localData);
                    session = localData;
                }
            }
    
            if (!session) {
                logger.info('No session found; generating a new one.');
                const newSessionId = generateSessionId();
                const formData = {}; // Initialize formData with placeholders for all steps

                steps.forEach((step) => {
                    formData[step.id] = {}; // Each step gets an empty object
                });
    
                session = {
                    sessionId: newSessionId,
                    userId: userId || null,
                    formData, // Pre-populated formData for all steps
                    aiGeneratedPlan: null,
                };
                localStorage.setItem('sessionId', newSessionId);
                localStorage.setItem('sessionData', JSON.stringify(session));
                logger.info('New session created with sessionId:', newSessionId);
    
                if (userId) {
                    const { error } = await supabase.from('sessions').insert(session);

                    if (error) {
                        logger.error('Error inserting new session:', error.message);
                    }
                }
            }
    
            // Ensure formData always includes placeholders for all steps
            const updatedFormData = { ...session.formData };

            steps.forEach((step) => {
                if (!updatedFormData[step.id]) {
                    updatedFormData[step.id] = {}; // Add missing step keys
                }
            });
            session.formData = updatedFormData;
    
            setSessionData(session);
        } catch (error) {
            logger.error('Error during session initialisation:', error.message);
        } finally {
            setIsInitialized(true);
        }
    };
    




    // Fetch only formData
    const fetchFormData = async (sessionId) => {
        const data = await fetchSessionData(sessionId, 'formData');

        return data?.formData || {};
    };

    // Fetch only output
    const fetchOutput = async (sessionId) => {
        const data = await fetchSessionData(sessionId, 'aiGeneratedPlan');

        return data?.aiGeneratedPlan || null;
    };

    // Update session data
    let updateTimeout = null;

    const updateSessionData = (key, value) => {
        const updatedSession = { ...sessionData, [key]: value };

        // Check for changes before updating state
        if (JSON.stringify(updatedSession) === JSON.stringify(sessionData)) {
            logger.info('No changes detected. Skipping update.');

            return;
        }

        logger.info('Updating sessionData:', updatedSession);
        setSessionData(updatedSession);
        localStorage.setItem('sessionData', JSON.stringify(updatedSession));
    };

    // Clear current session
    const clearSessionData = () => {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('sessionData');
        setSessionData({ sessionId: null, formData: {}, aiGeneratedPlan: null });
    };

    // Fetch all sessions and initialise the current session
    useEffect(() => {
        if (!isInitialised) {
            logger.info('Initialising session...');
            initialiseSession();
        }
    }, [userId, isInitialised]);

    return {
        sessions,               // List of session metadata
        sessionData,            // Current session data
        isInitialised,          // Whether the current session is initialised
        initialiseSession,      // Initialize a session by ID
        fetchFormData,          // Fetch only formData
        fetchOutput,            // Fetch only AI output
        updateSessionData,      // Update session data (e.g., formData or output)
        clearSessionData,       // Clear the current session
    };
}
