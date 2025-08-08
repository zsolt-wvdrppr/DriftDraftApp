"use client";

import Link from "next/link";

import BlogPostGrid from "@/components/blog/blog-post-grid";
import { blogPostsMeta } from "@/content/blog-posts"; // ✅ Changed: Use metadata
import BlogLayoutWithSidebar from "@/components/blog/blog-layout-with-sidebar";

const BlogPage: React.FC = () => {
  // ✅ NEW: Filter visible posts
  const visiblePosts = blogPostsMeta.filter((post) => post.show !== false);

  return (
    <div className="min-h-screen dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-primary dark:text-neutral mb-4">
            Our Blog
          </h1>
          <p className="text-lg text-zinc-600 dark:text-slate-300 max-w-2xl mx-auto">
            Insights, tips, and updates from the world of strategic web
            development and design
          </p>
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full" />
          </div>
        </header>

        <BlogLayoutWithSidebar
          posts={visiblePosts} // ✅ Changed: Pass filtered posts
          showMobileToggle={true}
          sidebarPosition="left"
        >
          <BlogPostGrid />
        </BlogLayoutWithSidebar>
        <section className="mt-20 bg-gradient-to-r from-primary via-secondary to-secondaryTeal rounded-3xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Follow Our Journey
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Get real-time updates on web development insights, design trends,
            and strategic planning tips. Join our growing community on X.
          </p>
          <Link
            className="inline-flex items-center gap-2 bg-white text-primary hover:bg-neutralCream font-semibold px-8 py-3 rounded-full transition-colors duration-200"
            href="https://x.com/DriftDraftApp"
            rel="noopener noreferrer"
            target="_blank"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Follow on X
          </Link>
        </section>
      </div>
    </div>
  );
};

export default BlogPage;
