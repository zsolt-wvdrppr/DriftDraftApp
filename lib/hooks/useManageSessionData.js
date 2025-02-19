import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRouter, usePathname } from "next/navigation";

import logger from "@/lib/logger";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { getPlannerTypeFromPath } from "@/lib/utils/utils";

const generateSessionId = () => uuidv4();

export function useManageSessionData(userId, steps) {
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const getSessionDataFromLocalStorage = () => {
    if (typeof window === "undefined") {
      logger.warn("localStorage is not yet available.");

      return null;
    }
    try {
      const localSessionData = localStorage.getItem("sessionData");

      if (!localSessionData) return null;

      const sessionJSON = JSON.parse(localSessionData);

      // Decide which type we expect for this route
      const expectedType = getPlannerTypeFromPath(pathname);

      // If the stored session's type doesn't match, force a new session
      if (
        expectedType &&
        sessionJSON.type &&
        sessionJSON.type !== expectedType
      ) {
        logger.info(
          `Session type mismatch (stored: ${sessionJSON.type}, current: ${expectedType}). Forcing new session.`
        );

        return null;
      }

      return sessionJSON;
    } catch (error) {
      logger.error(
        "Error reading sessionData from localStorage:",
        error.message
      );

      return null;
    }
  };

  const [sessionData, setSessionData] = useState(
    getSessionDataFromLocalStorage() || {
      sessionId: null,
      userId: null,
      formData: {},
      aiGeneratedPlan: null,
    }
  ); // Current session data
  const [isInitialised, setIsInitialised] = useState(false);

  // Cheat blocking user from going ahead by tempering with url params if previous step is empty
  useEffect(() => {
    const isPrevEmpty = (step) => {
      if (step <= 0) return false;
      if (!sessionData) return true;
      const prevStep = step - 1;
      const prevStepData = sessionData?.formData?.[prevStep];

      // If previous step is not empty check if the objects it has have keys but empty values, if values are empty or false return true
      const isEmpty = (obj) => {
        if (typeof obj === "object") {
          return Object.values(obj).every(
            (x) => x === "" || x === false || x[0] === ""
          );
        }

        return false;
      };

      return (
        (prevStepData && Object.keys(prevStepData).length === 0) ||
        isEmpty(prevStepData)
      );
    };

    // get current step from url
    const urlParams = new URLSearchParams(window.location.search);
    const step = urlParams.get("step");

    if (window && isPrevEmpty(step)) {
      logger.debug("isPrevEmpty", isPrevEmpty(step));

      //router.replace(`${window.location.origin}/${pathname}?step=0`);
      //router.refresh();
      //logger.info("not initialised");

      const newUrl = `${window.location.pathname}?step=0`;

      window.history.replaceState(null, "", newUrl);
    }
  }, [isInitialised]);

  useEffect(() => {
    if (!isInitialised) return;

    const localData = getSessionDataFromLocalStorage();

    if (!localData) {
      logger.info(
        "No valid session or type mismatch found. Starting new session..."
      );
      startNewSession();
    } else {
      setSessionData(localData);
    }
  }, [pathname, isInitialised]);

  // Initialize a specific session
  const initSession = async (planType = "") => {
    //const _userId = specifiedUserId === "remove-userId" ? null : userId;
    const _userId = userId;

    logger.info("Starting session initialisation...");
    const localSessionId = localStorage.getItem("sessionId");
    let session = null;

    try {
      if (localSessionId) {
        logger.info("Found sessionId in localStorage:", localSessionId);
        const localData = JSON.parse(localStorage.getItem("sessionData"));

        if (localData) {
          logger.info("Restored session data from localStorage:", localData);
          session = localData;
        }
      }

      if (!session) {
        logger.info("No session found; generating a new one.");
        const newSessionId = generateSessionId();

        // Determine the 'type' based on pathname
        const sessionType = planType || getPlannerTypeFromPath(pathname);

        const formData = {}; // Initialize formData with placeholders for all steps

        steps.forEach((step) => {
          formData[step.id] = {}; // Each step gets an empty object
        });

        session = {
          sessionId: newSessionId,
          userId: _userId || null,
          type: sessionType,
          formData, // Pre-populated formData for all steps
          aiGeneratedPlan: null,
        };
        localStorage.setItem("sessionId", newSessionId);
        localStorage.setItem("sessionData", JSON.stringify(session));
        logger.info("New session created with sessionId:", newSessionId);
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

      return session;
    } catch (error) {
      logger.error("Error during session initialisation:", error.message);
    } finally {
      setIsInitialised(true);
    }
  };

  const updateSessionData = (key, value) => {
    const updatedSession = { ...sessionData, [key]: value };

    // Check for changes before updating state
    if (JSON.stringify(updatedSession) === JSON.stringify(sessionData)) {
      logger.info("No changes detected. Skipping update.");

      return;
    }

    logger.info("Updating sessionData:", updatedSession);
    setSessionData(updatedSession);
    localStorage.setItem("sessionData", JSON.stringify(updatedSession));
  };

  const clearSessionData = () => {
    return new Promise((resolve, reject) => {
      try {
        logger.info("Clearing session states & local storage..");
        setSessionData({
          sessionId: null,
          formData: {},
          aiGeneratedPlan: null,
        });
        localStorage.removeItem("sessionId");
        localStorage.removeItem("sessionData");
        resolve("Local storage and session data cleared successfully."); // Resolve with a success message
      } catch (error) {
        reject(new Error("Failed to clear local storage.", error)); // Reject with an error
      }
    });
  };

  // Clear local storage
  const clearLocalStorage = () => {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem("sessionId");
        localStorage.removeItem("sessionData");
        resolve("Local storage cleared successfully."); // Resolve with a success message
      } catch (error) {
        reject(new Error("Failed to clear local storage.", error)); // Reject with an error
      }
    });
  };

  const [isLogoutInProgress, setIsLogoutInProgress] = useState(false);

  const logOutUser = async () => {
    setIsLogoutInProgress(true);

    try {
      await logout();

      // Trigger the navigation
      router.push("/login");

      // Poll to ensure the route changes before clearing the session
      const checkNavigation = async () => {
        return new Promise((resolve) => {
          const interval = setInterval(() => {
            if (window.location.pathname === "/login") {
              clearInterval(interval);
              resolve(true);
            }
          }, 100); // Check every 100ms
        });
      };

      await checkNavigation();

      // Clear session data after navigation
      await clearSessionData();
      setIsInitialised(false);
    } catch (error) {
      logger.error("Error during logout:", error.message);
    } finally {
      setIsLogoutInProgress(false);
    }
  };

  // Start new Session
  const startNewSession = async (planType = "") => {
    if (isLogoutInProgress) return;

    await clearSessionData(); // Ensure session is cleared first

    try {
      const newSession = await initSession(planType); // Ensure session initializes

      if (!newSession || !newSession.sessionId) {
        logger.error(
          "Session initialization failed: initSession() returned null or undefined."
        );

        return null; // Explicitly return null on failure
      }

      logger.debug("New session started successfully:", newSession);

      return newSession; // ✅ Return the session object
    } catch (error) {
      logger.error("Error initializing session:", error);

      return null;
    }
  };

  useEffect(() => {
    if (!isInitialised && steps?.length > 0) {
      logger.info("Initialising session...");
      initSession();
    }
  }, [steps, userId, isInitialised]);

  /* Database operations */
  const fetchAllSessionsFromDb = async (userId) => {
    if (!userId) {
      logger.error("User ID is required to fetch sessions.");

      return [];
    }

    try {
      //const supabaseWithAuth = getSupabaseClient(jwt);

      const { data, error } = await supabase
        .from("sessions")
        .select("session_title, created_at, session_id, type, user_id, updated_at")
        .eq("user_id", userId); // Filter by the logged-in user ID

      if (error) throw error;

      logger.info(`Fetched sessions for user ID: ${userId}`, data);

      return data || [];
    } catch (error) {
      logger.error("Error fetching user-specific sessions:", error.message);

      return [];
    }
  };

  const fetchAiGeneratedPlanFromDb = async (sessionId) => {
    if (!sessionId) {
      logger.error("Session ID is required to fetch AI-generated plan.");

      return null;
    }
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("ai_generated_plan")
        .eq("session_id", sessionId)
        .single();

      if (error || !data) throw error;

      logger.info("Fetched AI-generated plan:", data?.ai_generated_plan);

      return data?.ai_generated_plan || null;
    } catch (error) {
      logger.error(
        `Error fetching AI-generated plan for sessionId: ${sessionId}`,
        error.message
      );

      return null;
    }
  };

  const fetchSessionFromDb = async (userId, sessionId) => {
    if (!userId || !sessionId) {
      logger.error(
        "Both userId and sessionId are required to fetch a session."
      );

      return null;
    }
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .single();

      if (error || !data) throw error;

      logger.info("Fetched session:", data);

      return data;
    } catch (error) {
      logger.error(
        `Error fetching session for userId: ${userId}, sessionId: ${sessionId}`,
        error.message
      );

      return null;
    }
  };

  const updateSessionInDb = async (userId, sessionId, updates) => {
    if (!userId || !sessionId) {
      logger.error(
        "Both userId and sessionId are required for session updates."
      );

      return false;
    }

    // Convert camelCase to snake_case for Supabase compatibility
    const snakeCaseUpdates = Object.keys(updates).reduce((acc, key) => {
      const snakeKey = key.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();

      acc[snakeKey] = updates[key];

      return acc;
    }, {});

    try {
      // Step 1: Check if the session already exists
      const { data: existingSession, error: fetchError } = await supabase
        .from("sessions")
        .select("session_id")
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError; // Re-throw only if it's not a "row not found" error
      }

      if (existingSession) {
        // Step 2: If exists, perform an update
        const { error: updateError } = await supabase
          .from("sessions")
          .update({
            ...snakeCaseUpdates,
            updated_at: new Date().toISOString(),
          })
          .eq("session_id", sessionId)
          .eq("user_id", userId);

        if (updateError) throw updateError;
        logger.debug("Session updated successfully:", snakeCaseUpdates);
      } else {
        // Step 3: If not exists, perform an insert (upsert behavior)
        const { error: insertError } = await supabase.from("sessions").insert([
          {
            user_id: userId,
            session_id: sessionId,
            ...snakeCaseUpdates,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

        if (insertError) throw insertError;
        logger.debug("New session inserted successfully:", snakeCaseUpdates);
      }

      return true;
    } catch (error) {
      logger.error(
        `Error updating session for sessionId: ${sessionId}`,
        error.message
      );

      return false;
    }
  };

  const updateFormInDb = async (userId, sessionId, formData) => {
    if (!userId || !sessionId) {
      logger.error(
        "Both userId and sessionId are required to update form data."
      );

      return false;
    }

    return await updateSessionInDb(userId, sessionId, { form_data: formData });
  };

  const updateAiGeneratedPlanInDb = async (
    userId,
    sessionId,
    aiGeneratedPlan
  ) => {
    if (!userId || !sessionId) {
      logger.error(
        "Both userId and sessionId are required to update AI-generated plan."
      );

      return false;
    }
    logger.info("Updating AI-generated plan in DB:", aiGeneratedPlan);

    return await updateSessionInDb(userId, sessionId, {
      ai_generated_plan: aiGeneratedPlan,
    });
  };

  const updateSessionTitleInDb = async (userId, sessionId, newSessionTitle) => {
    logger.debug("Updating session title in DB:", newSessionTitle);
    if (!userId || !sessionId || !newSessionTitle) {
      logger.error(
        "userId, sessionId, and newSessionTitle are required to update the session title."
      );

      return false;
    }

    return await updateSessionInDb(userId, sessionId, {
      session_title: newSessionTitle,
    });
  };

  const updateEditedInDb = async (userId, sessionId) => {
    if (!userId || !sessionId) {
      logger.error(
        'Both userId and sessionId are required to update "updated_at".'
      );

      return false;
    }
    try {
      const { error } = await supabase
        .from("sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("session_id", sessionId)
        .eq("user_id", userId);

      if (error) throw error;

      logger.info(
        `"updated_at" updated successfully for sessionId: ${sessionId}`
      );

      return true;
    } catch (error) {
      logger.error(
        `Error updating "updated_at" for sessionId: ${sessionId}`,
        error.message
      );

      return false;
    }
  };

  const deleteSessionFromDb = async (userId, sessionId) => {
    try {
      if (!userId || !sessionId) {
        throw new Error(
          "Both userId and sessionId are required to delete a session."
        );
      }

      // Perform the deletion in Supabase
      const { error } = await supabase
        .from("sessions")
        .delete()
        .eq("session_id", sessionId)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      logger.info(
        `Session with sessionId: ${sessionId} deleted successfully for userId: ${userId}`
      );

      return true; // Indicate successful deletion
    } catch (error) {
      logger.error(
        `Error erasing session for userId: ${userId}, sessionId: ${sessionId}`,
        error.message
      );

      return false; // Indicate failure
    }
  };

  const toCamelCase = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(toCamelCase); // Recursively handle arrays
    } else if (obj && typeof obj === "object") {
      return Object.keys(obj).reduce((acc, key) => {
        const camelCaseKey = key.replace(/_([a-z])/g, (_, char) =>
          char.toUpperCase()
        );

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
        throw new Error(
          "Both userId and sessionId are required to init a session from the database."
        );
      }

      // Fetch the session from the database
      const session = await fetchSessionFromDb(userId, sessionId);

      if (!session) {
        throw new Error(
          `No session found for userId: ${userId} and sessionId: ${sessionId}`
        );
      }

      const camelCasedSession = toCamelCase(session);

      logger.debug("Camel-cased session:", camelCasedSession);

      // Update the local sessionData state
      setSessionData({
        sessionId: camelCasedSession.sessionId,
        userId: camelCasedSession.userId,
        formData: camelCasedSession.formData || {},
        aiGeneratedPlan: camelCasedSession.aiGeneratedPlan || null,
        sessionTitle: camelCasedSession.sessionTitle || "Untitled Session",
      });

      localStorage.setItem("sessionId", camelCasedSession.sessionId);
      localStorage.setItem("sessionData", JSON.stringify(camelCasedSession));

      // Log the success
      logger.info(`Session initialised from DB: ${sessionId}`);

      return true; // Indicate successful initialization
    } catch (error) {
      logger.error(
        `Error initialising session from DB for userId: ${userId}, sessionId: ${sessionId}`,
        error.message
      );

      return false; // Indicate failure
    }
  };

  // New state to store credits
  const [topUpCredits, setTopUpCredits] = useState(null);
  const [allowanceCredits, setAllowanceCredits] = useState(null);
  const [creditsError, setCreditsError] = useState(null);

  // Fetch the user's top-up and allowance credits
  const fetchUserCredits = async (userId) => {
    if (!userId) {
      logger.error("User ID is required to fetch credits.");

      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles") // Ensure this table exists and user has a row
        .select("top_up_credits, allowance_credits")
        .eq("user_id", userId)
        .maybeSingle(); // Use maybeSingle() instead of single()

      if (error) {
        throw error;
      }

      if (!data) {
        logger.warn("No profile found for user. Retrying in 2 seconds...");
        setTimeout(() => fetchUserCredits(userId), 2000); // Retry after 2 seconds

        return;
      }

      logger.info("Fetched user credits:", data);
      setTopUpCredits(data.top_up_credits);
      setAllowanceCredits(data.allowance_credits);
    } catch (err) {
      logger.error("Error fetching user credits:", err.message);
      setCreditsError(err.message);
    }
  };

  const refreshCredits = async () => {
    logger.info("Refreshing credits...");
    if (!userId) {
      logger.error("User ID is required to refresh credits.");

      return;
    }
    await fetchUserCredits(userId);
  };

  // Automatically fetch credits when userId changes
  useEffect(() => {
    if (userId) {
      fetchUserCredits(userId);
    }
  }, [userId]);

  return {
    sessionData,
    isInitialised,
    topUpCredits,
    allowanceCredits,
    creditsError,
    refreshCredits,
    initSession,
    updateSessionData,
    clearSessionData,
    clearLocalStorage,
    logOutUser,
    startNewSession,
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
