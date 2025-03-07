"use client";

import { useState, useEffect } from "react";

const CookieConsent = () => {
  // Consent states: null (not decided), true (accepted), false (rejected)
  const [consent, setConsent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    preferences: false,
  });

  // Set default consent to denied BEFORE GTM loads
  useEffect(() => {
    // Create dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    // Set default consent to denied for all types
    window.dataLayer.push({
      event: "default_consent",
      consent: "default",
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }, []);

  // Check for existing consent on component mount
  useEffect(() => {
    const storedConsent = localStorage.getItem("cookieConsent");

    if (storedConsent) {
      try {
        const parsedConsent = JSON.parse(storedConsent);
        setConsent(true);
        setPreferences(parsedConsent);

        // Apply stored consent settings
        initializeGTM(parsedConsent);
      } catch (e) {
        // If stored value is corrupted, reset it
        localStorage.removeItem("cookieConsent");
        setIsOpen(true);
      }
    } else {
      // No stored consent, show the banner
      setIsOpen(true);
    }
  }, []);

  // Initialize Google Tag Manager based on consent
  const initializeGTM = (consentPreferences) => {
    // Create dataLayer if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    // Push consent settings to dataLayer
    window.dataLayer.push({
      event: "update_consent",
      consent: "update",
      analytics_storage: consentPreferences.analytics ? "granted" : "denied",
      ad_storage: consentPreferences.marketing ? "granted" : "denied",
      ad_user_data: consentPreferences.marketing ? "granted" : "denied",
      ad_personalization: consentPreferences.marketing ? "granted" : "denied",
    });

    // If analytics consent is granted, trigger a page view event
    if (consentPreferences.analytics) {
      // Small timeout to ensure consent is processed first
      setTimeout(() => {
        window.dataLayer.push({
          event: "consent_driven_pageview",
        });
      }, 100);
    }

    // Also push our custom event for any custom logic
    window.dataLayer.push({
      event: "cookie_consent_update",
      consent: {
        analytics: consentPreferences.analytics,
        marketing: consentPreferences.marketing,
        preferences: consentPreferences.preferences,
      },
    });
  };

  // Handle accepting all cookies
  const acceptAll = () => {
    const allConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };

    setPreferences(allConsent);
    setConsent(true);
    setIsOpen(false);
    localStorage.setItem("cookieConsent", JSON.stringify(allConsent));
    initializeGTM(allConsent);
  };

  // Handle rejecting optional cookies
  const rejectOptional = () => {
    const minimalConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };

    setPreferences(minimalConsent);
    setConsent(false);
    setIsOpen(false);
    localStorage.setItem("cookieConsent", JSON.stringify(minimalConsent));

    // Still initialize GTM but with restricted consent
    initializeGTM(minimalConsent);
  };

  // Handle saving preferences
  const savePreferences = () => {
    setConsent(true);
    setIsOpen(false);
    setShowPreferences(false);
    localStorage.setItem("cookieConsent", JSON.stringify(preferences));
    initializeGTM(preferences);
  };

  // Handle preference changes
  const handlePreferenceChange = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Open consent settings
  const openConsentSettings = () => {
    setIsOpen(true);
  };

  if (!isOpen) {
    return (
      <button
        onClick={openConsentSettings}
        className="fixed bottom-4 left-4 p-2 bg-gray-200 rounded-full shadow-md z-50 text-sm"
        aria-label="Cookie settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Cookie Consent</h2>

          {!showPreferences ? (
            <>
              <p className="mb-4">
              We use cookies only to anonymously analyse site traffic and improve your browsing experience and site features.<br /><br />We do not use your data for advertising or personalisation purposes.<br /><br />By continuing to use this website, you agree to our use of cookies.
              </p>

              <div className="flex flex-wrap gap-3 mt-6 w-full justify-end">
                {/*<button
                  onClick={() => setShowPreferences(true)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                >
                  Cookie Preferences
                </button>
                <button
                  onClick={rejectOptional}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                >
                  Reject Optional
                </button>*/}
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Acknowledge
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-4">
                Customize your cookie preferences. Necessary cookies help make
                the website usable by enabling basic functions.
              </p>

              <div className="space-y-4 my-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Necessary Cookies</h3>
                    <p className="text-sm text-gray-500">
                      Required for the website to function. Cannot be disabled.
                    </p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className="sr-only"
                    />
                    <div className="block bg-gray-300 w-14 h-8 rounded-full"></div>
                    <div
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform translate-x-6`}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Analytics Cookies</h3>
                    <p className="text-sm text-gray-500">
                      Help us improve by tracking anonymous usage data.
                    </p>
                  </div>
                  <div
                    className="relative cursor-pointer"
                    onClick={() => handlePreferenceChange("analytics")}
                  >
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => {}} // Empty handler since onClick is on parent
                      className="sr-only"
                    />
                    <div
                      className={`block w-14 h-8 rounded-full ${preferences.analytics ? "bg-blue-600" : "bg-gray-300"}`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${preferences.analytics ? "translate-x-6" : ""}`}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Marketing Cookies</h3>
                    <p className="text-sm text-gray-500">
                      Allow us to provide personalized ads on other platforms.
                    </p>
                  </div>
                  <div
                    className="relative cursor-pointer"
                    onClick={() => handlePreferenceChange("marketing")}
                  >
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => {}} // Empty handler since onClick is on parent
                      className="sr-only"
                    />
                    <div
                      className={`block w-14 h-8 rounded-full ${preferences.marketing ? "bg-blue-600" : "bg-gray-300"}`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${preferences.marketing ? "translate-x-6" : ""}`}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Preferences Cookies</h3>
                    <p className="text-sm text-gray-500">
                      Remember your settings and provide enhanced functionality.
                    </p>
                  </div>
                  <div
                    className="relative cursor-pointer"
                    onClick={() => handlePreferenceChange("preferences")}
                  >
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={() => {}} // Empty handler since onClick is on parent
                      className="sr-only"
                    />
                    <div
                      className={`block w-14 h-8 rounded-full ${preferences.preferences ? "bg-blue-600" : "bg-gray-300"}`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${preferences.preferences ? "translate-x-6" : ""}`}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition"
                >
                  Back
                </button>
                <button
                  onClick={savePreferences}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Save Preferences
                </button>
              </div>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
            <p>
              To learn more about how we use cookies, please see our{" "}
              <a
                href="/privacy-policy"
                className="text-blue-600 hover:underline"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
