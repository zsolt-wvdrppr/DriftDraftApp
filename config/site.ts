// config/site.ts (updated)
export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "DriftDraft.App - Strategic Website Planner with AI Guidance",
  description:
    "Plan your website strategically with DriftDraft.App's AI-guided questionnaire. Get user flow recommendations, development requirements, and strategic insights. Free for businesses, premium plans for agencies.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
    {
      label: "Blog",
      href: "/blog",
    },
    {
      label: "Docs",
      href: "/docs",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  links: {
    github: "#",
    twitter: "#",
    docs: "#",
    discord: "#",
    contact: "https://wavedropper.com/contact",
    activities: "/activities",
  },
  // Add new SEO fields
  seo: {
    keywords: [
      "website planning",
      "strategic website design",
      "website requirements gathering",
      "user flow planning",
      "website strategy tool",
      "AI website planner",
      "business website planning",
      "agency website tool",
      "web development planning",
      "website project management",
    ],
    ogImage: "/images/og-driftdraft.jpg",
    twitterImage: "/images/twitter-driftdraft.jpg",
    canonical: process.env.NEXT_PUBLIC_SITE_URL || "https://driftdraft.app",
  },
};
