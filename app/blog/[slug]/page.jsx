import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { blogPosts } from '@/content/blog-posts';

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Generate static params for all blog posts
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.id,
  }));
}

// Generate metadata for each blog post
export async function generateMetadata({ params }) {
  const post = blogPosts.find((post) => post.id === params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160).replace(/#{1,6}\s+/g, '').replace(/\*\*(.*?)\*\*/g, '$1'),
  };
}

// Blog post page component
export default function BlogPost({ params }) {
  const post = blogPosts.find((post) => post.id === params.slug);

  if (!post) {
    notFound();
  }

  const publishDate = post.publishSchedule?.scheduledDate || post.publishSchedule?.scheduled_date;

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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
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
          {publishDate && (
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
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
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
        <section className="mt-16 pt-8 border-t border-neutralGray/20 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            {/* Share Buttons */}
            <div className="flex items-center gap-4">
              <span className="text-neutralDark dark:text-neutral font-medium">Share:</span>
              <div className="flex gap-3">
                <button className="p-2 bg-primary hover:bg-secondary text-white rounded-full transition-colors duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button className="p-2 bg-primary hover:bg-secondary text-white rounded-full transition-colors duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Back to Blog */}
            <Link 
              href="/blog"
              className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-full transition-colors duration-200 font-medium"
            >
              More Articles
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}