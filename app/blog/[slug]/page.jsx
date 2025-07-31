import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { blogPosts } from "@/content/blog-posts";
import ShareSection from "@/components/blog/share-section";
import { slugify } from "@/lib/utils/utils";
import { formatDate } from "@/lib/utils/utils";

// Generate static params for all blog posts
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: slugify(post.title, post.id), // ✅ Use slugified version
  }));
}

// Generate metadata for each blog post
export async function generateMetadata({ params }) {
  const _params = await params;

  const post = blogPosts.find(
    (post) => slugify(post.title, post.id) === _params.slug
  );

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const description = post.content
    .substring(0, 160)
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1");

  return {
    title: post.title,
    description: description,
    openGraph: {
      title: post.title,
      description: description,
      ...(post.featuredImage?.src && {
        images: [
          {
            url: post.featuredImage.src,
            alt: post.featuredImage.alt || post.title,
          },
        ],
      }),
    },
  };
}

// Blog post page component
export default async function BlogPost({ params }) {
  const _params = await params;

  const post = blogPosts.find(
    (post) => slugify(post.title, post.id) === _params.slug
  );

  if (!post) {
    notFound();
  }

  const publishDate =
    post.publishDate ||
    post.publishSchedule?.scheduledDate ||
    post.publishSchedule?.scheduled_date;

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back to Blog Link */}
        <Link
          href="/blog"
          className="inline-flex items-center text-primary dark:text-accent hover:text-secondary dark:hover:text-accentMint transition-colors duration-200 mb-8"
        >
          <svg
            className="mr-2 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Blog
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          {/* Featured Image */}
          {post.featuredImage?.src && (
            <div className="relative h-64 md:h-96 mb-8 rounded-2xl overflow-hidden">
              <Image
                src={post.featuredImage.src}
                alt={post.featuredImage.alt || post.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}

          {/* Meta Info */}
          {true && (
            <time className="text-sm text-secondary dark:text-accent font-medium">
              {formatDate(publishDate)}
            </time>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutralDark dark:text-neutral mt-4 leading-tight">
            {post.title}
          </h1>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg prose-slate dark:prose-invert max-w-none">
          <div className="markdown-content">
            <ReactMarkdown
              components={{
                // Custom heading styles
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-neutralDark dark:text-neutral mt-8 mb-4 first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-bold text-neutralDark dark:text-neutral mt-8 mb-4">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-bold text-neutralDark dark:text-neutral mt-6 mb-3">
                    {children}
                  </h3>
                ),
                // Custom paragraph styles
                p: ({ children }) => (
                  <p className="text-neutralDark dark:text-slate-300 leading-relaxed mb-4">
                    {children}
                  </p>
                ),
                // Custom list styles
                ul: ({ children }) => (
                  <ul className="list-disc list-inside text-neutralDark dark:text-slate-300 mb-4 space-y-2">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside text-neutralDark dark:text-slate-300 mb-4 space-y-2">
                    {children}
                  </ol>
                ),
                // Custom code styles
                code: ({ children, className }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-neutralCream dark:bg-slate-700 text-primary dark:text-accent px-2 py-1 rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code className="block bg-neutralDark dark:bg-slate-800 text-neutral p-4 rounded-lg overflow-x-auto font-mono text-sm">
                      {children}
                    </code>
                  );
                },
                // Custom blockquote styles
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-primary dark:border-accent pl-6 py-2 bg-neutralCream/50 dark:bg-slate-800/50 rounded-r-lg mb-4 italic">
                    {children}
                  </blockquote>
                ),
                // Custom link styles
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-primary dark:text-accent hover:text-secondary dark:hover:text-accentMint underline transition-colors duration-200"
                    target={href?.startsWith("http") ? "_blank" : undefined}
                    rel={
                      href?.startsWith("http") ?
                        "noopener noreferrer"
                      : undefined
                    }
                  >
                    {children}
                  </a>
                ),
                // Custom strong/bold styles
                strong: ({ children }) => (
                  <strong className="font-bold text-neutralDark dark:text-neutral">
                    {children}
                  </strong>
                ),
                // Custom emphasis/italic styles
                em: ({ children }) => (
                  <em className="italic text-neutralDark dark:text-slate-300">
                    {children}
                  </em>
                ),
                pre: ({ children }) => (
                  <pre className="bg-neutralDark dark:bg-slate-800 text-neutral p-4 rounded-lg overflow-x-auto font-mono text-sm">
                    {children}
                  </pre>
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Share Section */}
        <ShareSection />
      </div>
    </div>
  );
}
