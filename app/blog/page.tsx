"use client";

import BlogPostGrid from "@/components/blog/blog-post-grid";
import { blogPosts } from "@/content/blog-posts";
import BlogLayoutWithSidebar from "@/components/blog/blog-layout-with-sidebar";

// Main Blog Component
const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary dark:text-neutral mb-4">
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

        {/* BlogLayoutWithSidebar with proper typing */}
        <BlogLayoutWithSidebar
          posts={blogPosts}
          showMobileToggle={true}
          sidebarPosition="left"
        >
          <BlogPostGrid />
        </BlogLayoutWithSidebar>

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

export default BlogPage;
