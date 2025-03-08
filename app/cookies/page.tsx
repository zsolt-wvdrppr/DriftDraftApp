"use client";

import Link from "next/link";

import DynamicCookiesPolicy from "@/components/dynamic-cookies-policy";

// Optional: Define any additional static cookies that might not be detected
const additionalCookies = {
  necessary: [
    {
      name: "cookie_consent_level",
      domain: "Current site",
      description: "Stores your cookie consent preferences",
      duration: "1 year",
      category: "necessary",
      provider: "This website"
    }
  ],
  analytics: [
    {
      name: "GTM-XXXXXXX",
      domain: "googletagmanager.com",
      description: "This cookie is associated with Google Tag Manager to load other scripts and code into a page",
      duration: "1 day",
      category: "analytics",
      provider: "Google"
    }
  ]
};

export default function CookiesPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-primary">Cookie Policy</h1>
      
      <div className="prose max-w-none dark:prose-invert mb-12">
        <h2 className="text-primary">What Are Cookies</h2>
        <p>
          Cookies are small pieces of data stored on your device (computer or mobile device) when you visit a website.
          They are widely used to make websites work more efficiently, as well as to provide information to the website owners.
        </p>
        
        <h2 className="text-primary">How We Use Cookies</h2>
        <p>
          We use cookies for a variety of reasons detailed below. In most cases, there are no industry standard options
          for disabling cookies without completely disabling the functionality and features they add to the site.
        </p>
        
        <h3 className="text-primary">Disabling Cookies</h3>
        <p>
          You can prevent the setting of cookies by adjusting the settings on your browser. Be aware that disabling
          cookies will affect the functionality of this and many other websites that you visit. Therefore, it is
          recommended that you do not disable cookies.
        </p>
        
        <h3 className="text-primary">The Cookies We Set</h3>
        <ul>
          <li>
            <strong>Site preferences cookies</strong>
            <p>
              To provide you with a great experience on this site, we provide the functionality to set your preferences
              for how this site runs when you use it. To remember your preferences, we need to set cookies so that this
              information can be called whenever you interact with a page.
            </p>
          </li>
          
          <li>
            <strong>Analytics cookies</strong>
            <p>
              We use analytics cookies to help us understand how you use the site and ways that we can improve your
              experience. These cookies may track things such as how long you spend on the site and the pages that you
              visit so we can continue to produce engaging content.
            </p>
          </li>
        </ul>
        
        <h3 className="text-primary">Third-Party Cookies</h3>
        <p>
          In some special cases, we also use cookies provided by trusted third parties. The following section details
          which third-party cookies you might encounter through this site.
        </p>
        <ul>
          <li>
            This site uses Google Analytics which is one of the most widespread and trusted analytics solutions on the
            web for helping us to understand how you use the site and ways that we can improve your experience. These
            cookies may track things such as how long you spend on the site and the pages that you visit so we can
            continue to produce engaging content.
          </li>
        </ul>
        
        <h3 className="text-primary">Cookie Consent</h3>
        <p>
          When you first visit our website, you will be shown a cookie consent banner that allows you to accept or
          decline non-essential cookies. You can change your preferences at any time by clicking the cookie settings
          button at the bottom left of the page.
        </p>
      </div>
      
      {/* List of cookies detected and used on the site */}
      <div className="mb-16">
        <DynamicCookiesPolicy staticCookies={additionalCookies} />
      </div>
      
      <div className="prose max-w-none dark:prose-invert">
        <h2 className="text-primary">More Information</h2>
        <p>
          If you are still looking for more information, you can contact us through one of our preferred contact methods:
        </p>
        <ul>
          <li>Email: support@wavedropper.com</li>
          <li>Our Privacy Policy: <Link href="https://wavedropper.com/privacy" target="_blank">Visit our Privacy Policy</Link></li>
        </ul>
      </div>
    </div>
  );
}