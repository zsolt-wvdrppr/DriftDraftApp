"use client";

import { useState, useEffect } from "react";
import { IconRefresh } from "@tabler/icons-react";
import { Button } from "@heroui/react";

// Types for our cookies
interface Cookie {
  name: string;
  domain: string;
  description: string;
  duration: string;
  category: string;
  provider?: string;
}

interface CookiesListProps {
  // You can pass static cookies to supplement auto-detected ones
  staticCookies?: Record<string, Cookie[]>;
}

const DynamicCookiesPolicy: React.FC<CookiesListProps> = ({ staticCookies = {} }) => {
  const [cookiesByCategory, setCookiesByCategory] = useState<Record<string, Cookie[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("all");

  // Known cookie patterns to categorize cookies automatically
  const cookiePatterns: Record<string, Array<{ pattern: RegExp, name: string, description: string, duration: string }>> = {
    necessary: [
      { 
        pattern: /^cookieConsent$/i, 
        name: "Cookie Consent", 
        description: "Stores your cookie consent preferences", 
        duration: "1 year" 
      },
      { 
        pattern: /^JSESSIONID$/i, 
        name: "Session Cookie", 
        description: "Preserves user session state across page requests", 
        duration: "Session" 
      },
      { 
        pattern: /^PHPSESSID$/i, 
        name: "PHP Session", 
        description: "Preserves user session state for PHP applications", 
        duration: "Session" 
      },
      { 
        pattern: /^ASP\.NET_SessionId$/i, 
        name: "ASP.NET Session", 
        description: "Preserves user session state for ASP.NET applications", 
        duration: "Session" 
      },
      { 
        pattern: /^XSRF-TOKEN$|^csrftoken$/i, 
        name: "CSRF Protection", 
        description: "Helps protect against Cross-Site Request Forgery attacks", 
        duration: "Session" 
      },
    ],
    analytics: [
      { 
        pattern: /^_ga$|^_ga_/i, 
        name: "Google Analytics", 
        description: "Registers a unique ID used to generate statistical data on how you use the website", 
        duration: "2 years" 
      },
      { 
        pattern: /^_gid$/i, 
        name: "Google Analytics", 
        description: "Registers a unique ID used to generate statistical data on how you use the website", 
        duration: "24 hours" 
      },
      { 
        pattern: /^_gat$/i, 
        name: "Google Analytics", 
        description: "Used by Google Analytics to throttle request rate", 
        duration: "1 minute" 
      },
      { 
        pattern: /^__utma|^__utmb|^__utmc|^__utmt|^__utmz/i, 
        name: "Google Analytics (Legacy)", 
        description: "Collects data on the number of times a user has visited the website as well as dates for the first and most recent visit", 
        duration: "2 years" 
      },
      { 
        pattern: /^_hjid|^_hjFirstSeen/i, 
        name: "Hotjar", 
        description: "Sets a unique ID for the session to better understand user behavior", 
        duration: "1 year" 
      },
    ],
    marketing: [
      { 
        pattern: /^_fbp$/i, 
        name: "Facebook Pixel", 
        description: "Used by Facebook to deliver advertisements when users visit our website and/or interact with our content", 
        duration: "3 months" 
      },
      { 
        pattern: /^fr$/i, 
        name: "Facebook", 
        description: "Used by Facebook to deliver a series of advertisement products", 
        duration: "3 months" 
      },
      { 
        pattern: /^_gcl_/i, 
        name: "Google Ads", 
        description: "Stores information related to Google Ads campaigns", 
        duration: "3 months" 
      },
      { 
        pattern: /^IDE$/i, 
        name: "DoubleClick", 
        description: "Used by Google DoubleClick to register and report user actions after viewing or clicking ads", 
        duration: "1 year" 
      },
      { 
        pattern: /^MUID$/i, 
        name: "Microsoft Advertising", 
        description: "Used by Microsoft as a unique user identifier", 
        duration: "1 year" 
      },
      { 
        pattern: /^__gads|^__gac/i, 
        name: "Google Ad Services", 
        description: "Used by Google AdSense for experimenting with advertisement efficiency", 
        duration: "13 months" 
      },
    ],
    preferences: [
      { 
        pattern: /^theme_/i, 
        name: "Theme Preference", 
        description: "Stores your preferred theme (light/dark mode)", 
        duration: "1 year" 
      },
      { 
        pattern: /^lang_|^language_/i, 
        name: "Language Preference", 
        description: "Remembers your language preference", 
        duration: "1 year" 
      },
      { 
        pattern: /^display_/i, 
        name: "Display Preference", 
        description: "Stores your display preferences", 
        duration: "1 year" 
      },
      { 
        pattern: /^user_settings/i, 
        name: "User Settings", 
        description: "Stores your custom settings", 
        duration: "1 year" 
      },
      { 
        pattern: /^ui_/i, 
        name: "UI Preference", 
        description: "Remembers your UI preferences", 
        duration: "1 year" 
      },
    ],
  };

  // Add GTM related cookies pattern
  cookiePatterns.analytics.push({ 
    pattern: /^_gat_gtag_/i, 
    name: "Google Tag Manager", 
    description: "Used to throttle request rate for Google Tag Manager", 
    duration: "1 minute" 
  });

  // Add common third-party cookies
  cookiePatterns.analytics.push({ 
    pattern: /^_pk_|^pk_/i, 
    name: "Matomo Analytics", 
    description: "Used by Matomo to track page views and user behavior", 
    duration: "13 months" 
  });

  // Function to detect and categorize cookies
  const detectCookies = () => {
    setLoading(true);

    // Combine detected cookies with static cookies
    const combineCookies = (detectedCookies: Record<string, Cookie[]>) => {
      const combined: Record<string, Cookie[]> = { ...detectedCookies };

      // Add static cookies
      Object.entries(staticCookies).forEach(([category, cookies]) => {
        if (!combined[category]) {
          combined[category] = [];
        }
        
        // Add static cookies that don't already exist (by name)
        cookies.forEach(staticCookie => {
          if (!combined[category].some(cookie => cookie.name === staticCookie.name)) {
            combined[category].push(staticCookie);
          }
        });
      });

      return combined;
    };

    // Get all cookies from document.cookie
    let detectedCookiesByCategory: Record<string, Cookie[]> = {
      necessary: [],
      analytics: [],
      marketing: [],
      preferences: [],
      unknown: [],
    };

    if (typeof document !== 'undefined') {
      const allCookies = document.cookie.split(';').map(cookie => {
        const parts = cookie.trim().split('=');

        return {
          name: parts[0],
          value: parts.slice(1).join('='),
        };
      });

      // Categorize cookies
      allCookies.forEach(({ name }) => {
        if (!name) return;
        
        let cookieInfo: Cookie | null = null;
        let category = 'unknown';

        // Try to match cookie name against known patterns
        Object.entries(cookiePatterns).some(([cat, patterns]) => {
          return patterns.some(pattern => {
            if (pattern.pattern.test(name)) {
              category = cat;
              cookieInfo = {
                name,
                domain: 'Current site',
                description: pattern.description,
                duration: pattern.duration,
                category: cat,
                provider: pattern.name.split(' ')[0],
              };

              return true;
            }

            return false;
          });
        });

        // Add cookie to appropriate category
        if (cookieInfo) {
          detectedCookiesByCategory[category].push(cookieInfo);
        } else {
          detectedCookiesByCategory.unknown.push({
            name,
            domain: 'Current site',
            description: 'Unknown purpose',
            duration: 'Unknown',
            category: 'unknown',
          });
        }
      });
    }

    // Combine with static cookies if provided
    const combinedCookies = combineCookies(detectedCookiesByCategory);
    
    // Sort cookies by name within each category
    Object.keys(combinedCookies).forEach(category => {
      combinedCookies[category].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    setCookiesByCategory(combinedCookies);
    setLoading(false);
  };

  // Run detection when component mounts
  useEffect(() => {
    detectCookies();
  }, []);

  // Get all categories including "all"
  const allCategories = ['all', ...Object.keys(cookiesByCategory).filter(cat => 
    cookiesByCategory[cat] && cookiesByCategory[cat].length > 0
  )];

  // Filter cookies based on active category
  const getDisplayedCookies = () => {
    if (activeCategoryTab === 'all') {
      return Object.values(cookiesByCategory).flat();
    }

    return cookiesByCategory[activeCategoryTab] || [];
  };

  // Count total cookies
  const totalCookiesCount = Object.values(cookiesByCategory).flat().length;
  const displayedCookies = getDisplayedCookies();

  return (
    <div className="cookies-policy">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">Cookies Used on This Site</h2>
        <Button 
          className="flex items-center gap-2 px-3 py-1 bg-default-100 text-default-800 rounded-md text-sm"
          disabled={loading}
          // @ts-ignore
          onPress={detectCookies}
        >
          <IconRefresh className="w-4 h-4" />
          Refresh
        </Button>
      </div>
      
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-2">Scanning for cookies...</p>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Category tabs */}
            <div className="flex overflow-x-auto bg-default-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              {allCategories.map(category => (
                <button
                  key={category}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeCategoryTab === category 
                      ? 'text-primary border-b-2 border-primary bg-white dark:bg-gray-800'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  onClick={() => setActiveCategoryTab(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  {category === 'all' ? ` (${totalCookiesCount})` : 
                    cookiesByCategory[category] ? ` (${cookiesByCategory[category].length})` : ''}
                </button>
              ))}
            </div>

            {/* Cookies table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">Provider</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">Purpose</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">Expiry</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" scope="col">Type</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {displayedCookies.length > 0 ? (
                    displayedCookies.map((cookie, index) => (
                      <tr key={`${cookie.name}-${index}`} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}>
                        <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-gray-100">{cookie.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{cookie.provider || cookie.domain}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{cookie.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{cookie.duration}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 capitalize">{cookie.category}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={5}>
                        No cookies found in this category
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>
              <strong>Note:</strong> This list includes both cookies currently set in your browser and potentially used cookies.
              The actual cookies used may vary based on your interactions with the site. We provide this information to maintain transparency
              about our data collection practices.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default DynamicCookiesPolicy;