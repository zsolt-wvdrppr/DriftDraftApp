"use client";

import { useState, useEffect } from "react";
import { Button } from "@heroui/react";
import ReactMarkdown from "react-markdown";
import { IconSettings, IconAdCircleOff, IconCircleCheck, IconCookie } from "@tabler/icons-react";
import { Logo } from "./icons";
import Link from "next/link";

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

  // Check for existing consent on component mount
  useEffect(() => {
    const storedConsent = localStorage.getItem("cookieConsent");

    if (storedConsent) {
      try {
        const parsedConsent = JSON.parse(storedConsent);
        setConsent(true);
        setPreferences(parsedConsent);

        // Apply stored consent settings
        updateConsent(parsedConsent);
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

  // Update consent using the proper gtag format
  const updateConsent = (consentPreferences) => {
    if (typeof window === "undefined") return;

    // Define gtag function - ensure it exists
    window.dataLayer = window.dataLayer || [];
    // Use the existing gtag function if available or create it
    const gtag = function () {
      window.dataLayer.push(arguments);
    };

    // Important: Update consent FIRST, as a standalone call
    gtag("consent", "update", {
      analytics_storage: consentPreferences.analytics ? "granted" : "denied",
      ad_storage: consentPreferences.marketing ? "granted" : "denied",
      ad_user_data: consentPreferences.marketing ? "granted" : "denied",
      ad_personalization: consentPreferences.marketing ? "granted" : "denied",
    });

    // Then trigger our custom event for GTM triggers
    setTimeout(() => {
      window.dataLayer.push({
        event: "cookie_consent_update",
        consent: {
          analytics: consentPreferences.analytics,
          marketing: consentPreferences.marketing,
          preferences: consentPreferences.preferences,
        },
      });

      // If analytics consent granted, trigger a pageview
      if (consentPreferences.analytics) {
        gtag("event", "page_view");
      }
    }, 300);
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
    updateConsent(allConsent);
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
    updateConsent(minimalConsent);
  };

  // Handle accepting analytics cookies
  const acceptAnalytics = () => {
    const analyticsConsent = {
      necessary: true,
      analytics: true,
      marketing: false,
      preferences: true,
    };

    setPreferences(analyticsConsent);
    setConsent(true);
    setIsOpen(false);
    localStorage.setItem("cookieConsent", JSON.stringify(analyticsConsent));
    updateConsent(analyticsConsent);
  };

  // Handle saving preferences
  const savePreferences = () => {
    setConsent(true);
    setIsOpen(false);
    setShowPreferences(false);
    localStorage.setItem("cookieConsent", JSON.stringify(preferences));
    updateConsent(preferences);
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
      <Button
        onPress={openConsentSettings}
        className="hidden md:block md:fixed bottom-4 left-4 min-w-0 bg-default-200 rounded-full shadow-md z-50 text-sm"
        aria-label="Cookie settings"
      >
        <IconCookie className="w-6 h-6 text-primary" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-content1 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex gap-x-3 items-center mb-4">
          <Logo className="w-24 h-24 mx-auto" />
          <h2 className="text-2xl font-bold text-primary">Cookie Consent</h2>
          </div>

          {!showPreferences ? (
            <>
            <div className="prose prose-strong:font-medium">
              <ReactMarkdown>
                {consentText}
              </ReactMarkdown>
              </div>

              <div className="flex flex-wrap gap-3 mt-6 w-full justify-between">
                <Button
                  onPress={() => setShowPreferences(true)}
                  className="px-4 py-2 border border-default-200 rounded-md text-default-600 hover:bg-default-200 transition"
                >
                  <IconSettings className="mr-2" />
                  Cookie Preferences
                </Button>
                <div className="flex gap-3">
                <Button
                  onPress={acceptAnalytics}
                  className="px-4 py-2 border border-default-200 rounded-md text-default-600 hover:bg-default-200 transition"
                >
                  <IconAdCircleOff className="mr-2 text-default-600" />
                  Reject Marketing
                </Button>
                <Button
                  onPress={acceptAll}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition"
                >
                  <IconCircleCheck className="mr-2" />
                  Accept All
                </Button>
                </div>
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
                <Button
                  onPress={() => setShowPreferences(false)}
                  className="px-4 py-2 border border-default-200 rounded-md text-default-600 hover:bg-default-200 transition"
                >
                  Back
                </Button>
                <Button
                  onPress={acceptAnalytics}
                  className="px-4 py-2 border border-default-200 rounded-md text-default-600 hover:bg-default-200 transition"
                >
                  No Marketing
                </Button>
                <Button
                  onPress={savePreferences}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition"
                >
                  Save Preferences
                </Button>
              </div>
            </>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
            <p>
              To learn more about how we use cookies, please see our{" "}
              <Link
                href="/cookies"
                className="text-blue-600 hover:underline"
              >
                Cookie Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;

const consentText = `
We use cookies **to anonymously analyse traffic and enhance your experience and features of this web application**.

We'd appreciate it if you allowed analytics and user-experience cookies by selecting **Reject Marketing**, even if you prefer not to accept all cookies.
              `;