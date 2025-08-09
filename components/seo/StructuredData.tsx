// components/seo/StructuredData.tsx

interface StructuredDataProps {
  page?: "home" | "planner" | "pricing" | "about";
  title?: string;
  description?: string;
}

export default function StructuredData({
  page = "home",
  title,
  description,
}: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://driftdraft.com";

  // Use dynamic title or fallback to default
  const pageTitle = title || "DriftDraft - Strategic Website Planning Tool";

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: title || "DriftDraft",
    alternateName: "DriftDraft Strategic Website Planner",
    description:
      description ||
      "AI-powered strategic website planning tool that guides businesses through expert questionnaires to create comprehensive website strategies, user flows, and development requirements.",
    url: baseUrl,
    applicationCategory: "WebDevelopmentTool",
    operatingSystem: "Web Browser",
    offers: [
      {
        "@type": "Offer",
        name: "Free Plan",
        description:
          "Basic website planning with user flow recommendations and development overview",
        price: "0",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Premium Plan",
        description:
          "Detailed development plans, technology recommendations, and unlimited AI assistance",
        price: "29",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        name: "Agency Plan",
        description:
          "Client dashboard, project management, and team collaboration features",
        price: "99",
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
      },
    ],
    featureList: [
      "Strategic website questionnaire",
      "AI-powered guidance and hints",
      "User flow and journey recommendations",
      "Development requirements generation",
      "Technology stack suggestions",
      "Client dashboard for agencies",
      "Project requirement tracking",
      "Website strategy education",
    ],
    screenshot: `${baseUrl}/images/driftdraft-screenshot.jpg`,
    softwareVersion: "1.0",
    creator: {
      "@type": "Organization",
      name: "DriftDraft",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DriftDraft",
    url: baseUrl,
    description:
      description ||
      "Strategic website planning platform that educates businesses and agencies while gathering comprehensive project requirements through AI-guided questionnaires.",
    foundingDate: "2024",
    industry: "Web Development Tools",
    knowsAbout: [
      "Website Strategy",
      "User Experience Planning",
      "Web Development Requirements",
      "Business Website Planning",
      "Agency Project Management",
      "Strategic Web Design",
    ],
  };

  // Add WebPage schema for non-home pages
  const webPageSchema =
    page !== "home" ?
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: pageTitle,
        description:
          description || "Strategic website planning with AI-powered guidance",
        url: `${baseUrl}/${page}`,
        isPartOf: {
          "@type": "WebSite",
          name: "DriftDraft",
          url: baseUrl,
        },
        about: {
          "@type": "Thing",
          name: "Website Planning",
          description: "Strategic website planning and development guidance",
        },
      }
    : null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is DriftDraft and who should use it?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "DriftDraft is a strategic website planning tool designed for businesses planning a new website and agencies managing client projects. It guides users through expert questionnaires to create comprehensive website strategies, user flows, and development requirements using AI assistance.",
        },
      },
      {
        "@type": "Question",
        name: "How does DriftDraft help with website planning?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "DriftDraft asks strategic questions that educate users about best practices while gathering requirements. It provides AI-powered hints and suggestions, generates user flow recommendations, creates development plans, and helps avoid common website pitfalls like dead ends and poor user experience.",
        },
      },
      {
        "@type": "Question",
        name: "What makes DriftDraft different from other website planning tools?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "DriftDraft combines education with requirements gathering. It doesn't just collect information - it teaches users about strategic design principles, provides AI-powered guidance throughout the process, and generates actionable development plans tailored to specific business needs.",
        },
      },
      {
        "@type": "Question",
        name: "Can agencies use DriftDraft for client projects?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, DriftDraft offers an Agency Plan with a client dashboard for tracking multiple projects, managing client responses, and streamlining the project onboarding process. It helps agencies gather comprehensive requirements while demonstrating their expertise to clients.",
        },
      },
    ],
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Plan a Strategic Website with DriftDraft",
    description:
      "Step-by-step guide to creating a comprehensive website strategy using DriftDraft's AI-guided questionnaire",
    step: [
      {
        "@type": "HowToStep",
        name: "Define Your Business Goals",
        text: "Answer strategic questions about your business objectives, target audience, and success metrics. Use AI hints to refine your answers.",
      },
      {
        "@type": "HowToStep",
        name: "Plan User Experience",
        text: "Define user journeys, identify key pages, and plan content flow. Get recommendations for avoiding dead ends and improving user experience.",
      },
      {
        "@type": "HowToStep",
        name: "Generate Development Plan",
        text: "Receive technology recommendations, component suggestions, and detailed development requirements based on your specific needs.",
      },
      {
        "@type": "HowToStep",
        name: "Review and Implement",
        text: "Use the generated strategy document and development plan to brief developers or start building your website.",
      },
    ],
  };

  // Build schemas array based on page type
  const schemas = [];

  // Always include these
  schemas.push(softwareApplicationSchema, organizationSchema);

  // Add WebPage schema for non-home pages
  if (webPageSchema) {
    schemas.push(webPageSchema);
  }

  // Only show FAQ and HowTo on home page
  if (page === "home") {
    schemas.push(faqSchema, howToSchema);
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
          key={index}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
