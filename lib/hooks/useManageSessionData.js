import { useState, useEffect, useTransition } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { supabase } from '@/lib/supabaseClient';
import logger from '@/lib/logger';

const generateSessionId = () => uuidv4();

export function useManageSessionData(userId, steps) {
    const [startTransition, isPending] = useTransition();
    const [sessions, setSessions] = useState([]); // List of session IDs
    const [sessionData, setSessionData] = useState({ sessionId: null, userId: null, formData: {}, aiGeneratedPlan: null }); // Current session data
    const [isInitialised, setIsInitialized] = useState(false);

    useEffect(() => {
        logger.debug('sessionData updated:', sessionData);
    }, [sessionData]);


    // Initialize a specific session
    const initSession = async (specifiedUserId) => {

        const _userId = specifiedUserId === 'remove-userId' ? null : userId;

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
                    userId: _userId || null,
                    formData, // Pre-populated formData for all steps
                    aiGeneratedPlan: null,
                };
                localStorage.setItem('sessionId', newSessionId);
                localStorage.setItem('sessionData', JSON.stringify(session));
                logger.info('New session created with sessionId:', newSessionId);

                /*if (_userId) {
                    const { error } = await supabase.from('sessions').insert(session);

                    if (error) {
                        logger.error('Error inserting new session:', error.message);
                    }
                }*/
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
        setSessionData({ sessionId: null, userId: null, formData: {}, aiGeneratedPlan: null });
        //setIsInitialized(false);
        initSession('remove-userId'); // Re-initialize the session
    };

    // Clear local storage
    const clearLocalStorage = () => {
        localStorage.removeItem('sessionId');
        localStorage.removeItem('sessionData');
    };

    // Fetch all sessions and init the current session
    useEffect(() => {
        if (!isInitialised && steps?.length > 0) {
            logger.info('Initialising session...');
            initSession();
        }
    }, [steps, userId, isInitialised]);

    /* Database operations */
    const fetchAllSessionsFromDb = async (userId) => {
        if (!userId) {
            logger.error('User ID is required to fetch sessions.');
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('session_title, created_at, session_id, user_id, updated_at')
                .eq('user_id', userId);  // Filter by the logged-in user ID
            if (error) throw error;

            logger.info(`Fetched sessions for user ID: ${userId}`, data);
            return data || [];
        } catch (error) {
            logger.error('Error fetching user-specific sessions:', error.message);
            return [];
        }
    };


    const fetchAiGeneratedPlanFromDb = async (sessionId) => {
        if (!sessionId) {
            logger.error('Session ID is required to fetch AI-generated plan.');
            return null;
        }
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('ai_generated_plan')
                .eq('session_id', sessionId)
                .single();

            if (error || !data) throw error;

            logger.info('Fetched AI-generated plan:', data?.ai_generated_plan);
            return data?.ai_generated_plan || null;
        } catch (error) {
            logger.error(`Error fetching AI-generated plan for sessionId: ${sessionId}`, error.message);
            return null;
        }
    };



    const fetchSessionFromDb = async (userId, sessionId) => {
        if (!userId || !sessionId) {
            logger.error('Both userId and sessionId are required to fetch a session.');
            return null;
        }
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('session_id', sessionId)
                .eq('user_id', userId)
                .single();

            if (error || !data) throw error;

            logger.info('Fetched session:', data);
            return data;
        } catch (error) {
            logger.error(`Error fetching session for userId: ${userId}, sessionId: ${sessionId}`, error.message);
            return null;
        }
    };


    const updateSessionInDb = async (userId, sessionId, updates) => {
        if (!userId || !sessionId) {
            logger.error('Both userId and sessionId are required for session updates.');
            return false;
        }

        // Convert camelCase to snake_case for Supabase compatibility
        const snakeCaseUpdates = Object.keys(updates).reduce((acc, key) => {
            const snakeKey = key.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
            acc[snakeKey] = updates[key];
            return acc;
        }, {});

        try {
            const { error } = await supabase
                .from('sessions')
                .update({
                    ...snakeCaseUpdates,
                    updated_at: new Date().toISOString()
                })
                .eq('session_id', sessionId)
                .eq('user_id', userId);

            if (error) throw error;

            logger.info(`Session updated successfully for sessionId: ${sessionId}`);
            return true;
        } catch (error) {
            logger.error(`Error updating session for sessionId: ${sessionId}`, error.message);
            return false;
        }
    };



    const updateFormInDb = async (userId, sessionId, formData) => {
        if (!userId || !sessionId) {
            logger.error('Both userId and sessionId are required to update form data.');
            return false;
        }
        return await updateSessionInDb(userId, sessionId, { form_data: formData });
    };



    const updateAiGeneratedPlanInDb = async (userId, sessionId, aiGeneratedPlan) => {
        if (!userId || !sessionId) {
            logger.error('Both userId and sessionId are required to update AI-generated plan.');
            return false;
        }
        logger.info('Updating AI-generated plan in DB:', aiGeneratedPlan);
        return await updateSessionInDb(userId, sessionId, { ai_generated_plan: aiGeneratedPlan });
    };


    const updateSessionTitleInDb = async (userId, sessionId, newSessionTitle) => {
        if (!userId || !sessionId || !newSessionTitle) {
            logger.error('userId, sessionId, and newSessionTitle are required to update the session title.');
            return false;
        }
        return await updateSessionInDb(userId, sessionId, { session_title: newSessionTitle });
    };



    const updateEditedInDb = async (userId, sessionId) => {
        if (!userId || !sessionId) {
            logger.error('Both userId and sessionId are required to update "updated_at".');
            return false;
        }
        try {
            const { error } = await supabase
                .from('sessions')
                .update({ updated_at: new Date().toISOString() })
                .eq('session_id', sessionId)
                .eq('user_id', userId);

            if (error) throw error;

            logger.info(`"updated_at" updated successfully for sessionId: ${sessionId}`);
            return true;
        } catch (error) {
            logger.error(`Error updating "updated_at" for sessionId: ${sessionId}`, error.message);
            return false;
        }
    };

    const deleteSessionFromDb = async (userId, sessionId) => {
        try {
            if (!userId || !sessionId) {
                throw new Error('Both userId and sessionId are required to delete a session.');
            }

            // Perform the deletion in Supabase
            const { error } = await supabase
                .from('sessions')
                .delete()
                .eq('session_id', sessionId)
                .eq('user_id', userId);

            if (error) {
                throw error;
            }

            logger.info(`Session with sessionId: ${sessionId} deleted successfully for userId: ${userId}`);
            return true; // Indicate successful deletion
        } catch (error) {
            logger.error(`Error erasing session for userId: ${userId}, sessionId: ${sessionId}`, error.message);
            return false; // Indicate failure
        }
    };

    const toCamelCase = (obj) => {
        if (Array.isArray(obj)) {
            return obj.map(toCamelCase); // Recursively handle arrays
        } else if (obj && typeof obj === 'object') {
            return Object.keys(obj).reduce((acc, key) => {
                const camelCaseKey = key.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
                acc[camelCaseKey] = toCamelCase(obj[key]); // Recursively handle nested objects
                return acc;
            }, {});
        }
        return obj; // Return the value if it's neither an array nor an object
    };

    const initSessionFromDb = async (userId, sessionId) => {

        try {
            // Ensure both userId and sessionId are provided
            if (!userId || !sessionId) {
                throw new Error('Both userId and sessionId are required to init a session from the database.');
            }

            // Fetch the session from the database
            const session = await fetchSessionFromDb(userId, sessionId);

            if (!session) {
                throw new Error(`No session found for userId: ${userId} and sessionId: ${sessionId}`);
            }

            const camelCasedSession = toCamelCase(session);
            logger.debug('Camel-cased session:', camelCasedSession);

            // Update the local sessionData state
            setSessionData({
                sessionId: camelCasedSession.sessionId,
                userId: camelCasedSession.userId,
                formData: camelCasedSession.formData || {},
                aiGeneratedPlan: camelCasedSession.aiGeneratedPlan || null,
                sessionTitle: camelCasedSession.sessionTitle || 'Untitled Session',
            });

            localStorage.setItem('sessionId', camelCasedSession.sessionId);
            localStorage.setItem('sessionData', JSON.stringify(camelCasedSession));

            // Log the success
            logger.info(`Session initialised from DB: ${sessionId}`);
            return true; // Indicate successful initialization
        } catch (error) {
            logger.error(`Error initialising session from DB for userId: ${userId}, sessionId: ${sessionId}`, error.message);
            return false; // Indicate failure
        }
    };



    return {
        sessions,
        sessionData,
        isInitialised,
        initSession,
        updateSessionData,
        clearSessionData,
        clearLocalStorage,
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
        toCamelCase,
    };
}
