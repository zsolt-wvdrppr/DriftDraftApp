import React from "react";
import Link from "next/link";
import Image from "next/image";

import { blogPosts } from "@/content/blog-posts";

// Helper function to extract excerpt from markdown content
const getExcerpt = (content: string, maxLength: number = 160): string => {
  // Remove markdown formatting and get plain text
  const plainText = content
    .replace(/#{1,6}\s+/g, "") // Remove headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.*?)\*/g, "$1") // Remove italic
    .replace(/`(.*?)`/g, "$1") // Remove inline code
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links, keep text
    .replace(/\n/g, " ") // Replace newlines with spaces
    .trim();

  if (plainText.length <= maxLength) return plainText;

  const truncated = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  return lastSpaceIndex > 0 ?
      truncated.substring(0, lastSpaceIndex) + "..."
    : truncated + "...";
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// BlogCard Component
const BlogCard: React.FC<{ post: any }> = ({ post }) => {
  const excerpt = getExcerpt(post.content);
  const publishDate =
    post.publishSchedule?.scheduledDate || post.publishSchedule?.scheduled_date;

  return (
    <article className="group bg-white dark:bg-neutralDark rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Featured Image */}
      {post.featuredImage?.src && (
        <div className="relative h-48 overflow-hidden">
          <Image
            fill
            alt={post.featuredImage.alt || post.title}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            src={post.featuredImage.src}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Date */}
        {publishDate && (
          <time className="text-sm text-secondary dark:text-accent font-medium">
            {formatDate(publishDate)}
          </time>
        )}

        {/* Title */}
        <h2 className="text-xl font-bold text-neutralDark dark:text-neutral mt-2 mb-3 group-hover:text-primary dark:group-hover:text-accent transition-colors duration-200">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="text-neutralGray dark:text-slate-300 leading-relaxed mb-4">
          {excerpt}
        </p>

        {/* Read More Link */}
        <Link
          className="inline-flex items-center text-primary dark:text-accent font-semibold hover:text-secondary dark:hover:text-accentMint transition-colors duration-200"
          href={`/blog/${post.id}`}
        >
          Read more
          <svg
            className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 5l7 7-7 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </Link>
      </div>
    </article>
  );
};

// Main Blog Component
const Blog: React.FC = () => {
  // Filter published posts only
  const publishedPosts = blogPosts.filter((post) => {
    const publishDate =
      post.publishDate ||
      post.publishSchedule?.scheduledDate ||
      post.publishSchedule?.scheduled_date ||
      "";

    if (!publishDate) return true; // Show posts without schedule

    return new Date(publishDate) <= new Date(); // Show only past dates
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral via-neutralCream/30 to-neutral dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-neutralDark dark:text-neutral mb-4">
            Our Blog
          </h1>
          <p className="text-lg text-neutralGray dark:text-slate-300 max-w-2xl mx-auto">
            Insights, tips, and updates from the world of strategic web
            development and design
          </p>

          {/* Decorative line */}
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full" />
          </div>
        </header>

        {/* Blog Posts Grid */}
        {publishedPosts.length > 0 ?
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        : <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-neutralCream dark:bg-slate-700 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-neutralGray dark:text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-neutralDark dark:text-neutral mb-2">
              No posts available
            </h3>
            <p className="text-neutralGray dark:text-slate-300">
              Check back soon for new content!
            </p>
          </div>
        }

        {/* Newsletter CTA */}
        <section className="mt-20 bg-gradient-to-r from-primary via-secondary to-secondaryTeal rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Get the latest insights on web development, design trends, and
            strategic planning delivered to your inbox.
          </p>
          <button className="bg-white text-primary hover:bg-neutralCream font-semibold px-8 py-3 rounded-full transition-colors duration-200">
            Subscribe to Newsletter
          </button>
        </section>
      </div>
    </div>
  );
};

export default Blog;
