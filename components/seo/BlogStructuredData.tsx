// components/seo/BlogStructuredData.tsx
interface BlogStructuredDataProps {
  title: string;
  content: string;
  slug: string;
  publishDate?: string;
  featuredImage?: {
    src: string;
    alt?: string;
  };
  baseUrl?: string;
}

export default function BlogStructuredData({ 
  title,
  content,
  slug,
  publishDate,
  featuredImage,
  baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://driftdraft.app' 
}: BlogStructuredDataProps) {
  const articleUrl = `${baseUrl}/blog/${slug}`;
  
  // Extract clean description from markdown content
  const description = content
    .substring(0, 160)
    .replace(/#{1,6}\s+/g, "") // Remove markdown headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown
    .replace(/\*(.*?)\*/g, "$1") // Remove italic markdown
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Remove markdown links, keep text
    .replace(/`([^`]+)`/g, "$1") // Remove inline code
    .replace(/\n/g, " ") // Replace newlines with spaces
    .trim();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": articleUrl,
    "datePublished": publishDate || new Date().toISOString(),
    "dateModified": publishDate || new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": "DriftDraft Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DriftDraft",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    ...(featuredImage && {
      "image": {
        "@type": "ImageObject",
        "url": featuredImage.src,
        "width": 1200,
        "height": 630,
        "alt": featuredImage.alt || title
      }
    }),
    "inLanguage": "en-GB",
    "isPartOf": {
      "@type": "Blog",
      "@id": `${baseUrl}/blog`
    },
    // AI-specific context for better discoverability
    "about": [
      {
        "@type": "Thing",
        "name": "Website Planning",
        "description": "Strategic approach to planning website structure and content"
      },
      {
        "@type": "Thing", 
        "name": "Web Development Strategy",
        "description": "Best practices for web development project planning"
      }
    ],
    "keywords": "website planning, web development, strategic planning, user experience, project management"
  };

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(articleSchema)
      }}
      type="application/ld+json"
    />
  );
}