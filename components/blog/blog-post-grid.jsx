import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardBody, CardHeader, CardFooter, Chip } from "@heroui/react";
import { TbCalendar, TbUser, TbArrowRight } from "react-icons/tb";
import logger from "@/lib/logger";
import BlogSortButton from "@/components/blog/blog-sort-button";
import { useBlogPostSort } from "@/lib/hooks/blog/useBlogPostSort";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Helper to extract excerpt from content
const getExcerpt = (content, maxLength = 150) => {
  if (!content) return "";
  // Remove markdown formatting and get plain text
  const plainText = content
    .replace(/#{1,6}\s+/g, "") // Remove headers
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold
    .replace(/\*(.*?)\*/g, "$1") // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links
    .replace(/`(.*?)`/g, "$1") // Remove inline code
    .trim();

  return plainText.length > maxLength ?
      plainText.substring(0, maxLength) + "..."
    : plainText;
};

/**
 * Individual Blog Post Card Component
 */
function BlogPostCard({ post, index }) {
  // Check multiple possible date fields to match original implementation
  const publishDate =
    post.publishDate ||
    post.publishSchedule?.scheduledDate ||
    post.publishSchedule?.scheduled_date;
  const excerpt = getExcerpt(post.content);

  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 group border border-neutralGray/20 dark:border-slate-700">
      <CardHeader className="p-0">
        {/* Featured Image */}
        {post.featuredImage?.src && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
            <Image
              src={post.featuredImage.src}
              alt={post.featuredImage.alt || post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index < 3} // Load first 3 images eagerly
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        )}
      </CardHeader>

      <CardBody className="p-6 flex flex-col h-full">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.categories.slice(0, 2).map((category, index) => (
              <Chip
                key={index}
                size="sm"
                variant="flat"
                color="primary"
                className="text-xs"
              >
                {category.type}
              </Chip>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold text-neutralDark dark:text-neutral mb-3 line-clamp-2 group-hover:text-primary dark:group-hover:text-accent transition-colors">
          <Link href={`/blog/${post.id}`}>{post.title}</Link>
        </h3>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-neutralGray dark:text-slate-400 text-sm leading-relaxed mb-4 flex-grow hidden md:block">
            {excerpt}
          </p>
        )}
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 h-12">
            {post.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                size="sm"
                variant="bordered"
                className="text-xs opacity-70"
              >
                {"#" + tag.type.toUpperCase()}
              </Chip>
            ))}
            {post.tags.length > 3 && (
              <Chip size="sm" variant="bordered" className="text-xs opacity-50">
                +{post.tags.length - 3}
              </Chip>
            )}
          </div>
        )}
      </CardBody>
      <CardFooter className="min-h-16 flex flex-col justify-between items-stretch">
        {/* Meta Info */}
        <div className="flex items-center justify-between pt-4 border-t border-neutralGray/20 dark:border-slate-700">
          <div className="flex items-center gap-4 text-xs text-neutralGray dark:text-slate-400">
            {publishDate && (
              <div className="flex items-center gap-1">
                <TbCalendar size={14} />
                <time>{formatDate(publishDate)}</time>
              </div>
            )}
          </div>

          <Link
            href={`/blog/${post.id}`}
            className="flex items-center gap-1 text-primary dark:text-accent hover:gap-2 transition-all duration-200 text-sm font-medium"
          >
            Read more
            <TbArrowRight size={14} />
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

/**
 * Main Blog Post Grid Component with built-in sorting
 */
export default function BlogPostGrid({
  posts = [],
  layout = "grid", // "grid" or "list"
  className = "",
}) {
  // Use the sorting hook - posts are now automatically sorted
  const { sortedPosts, sortOrder, toggleSort } = useBlogPostSort(posts);

  // Debug: Log when posts prop changes
  logger.debug("🔍 BlogPostGrid received posts:", posts.length);
  logger.debug("🔍 BlogPostGrid sorted posts:", sortedPosts.length);

  sortedPosts.forEach((post, index) => {
    const publishDate =
      post.publishDate ||
      post.publishSchedule?.scheduledDate ||
      post.publishSchedule?.scheduled_date ||
      "today";
    logger.debug(`  ${index + 1}. ${post.title} (${publishDate})`);
  });

  if (!sortedPosts || sortedPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-4 bg-neutralGray/20 dark:bg-slate-700 rounded-full flex items-center justify-center">
            <TbUser
              size={32}
              className="text-neutralGray dark:text-slate-400"
            />
          </div>
          <h3 className="text-xl font-semibold text-neutralDark dark:text-neutral mb-2">
            No posts found
          </h3>
          <p className="text-neutralGray dark:text-slate-400">
            Try adjusting your filters or search terms to find what you're
            looking for.
          </p>
        </div>
      </div>
    );
  }

  if (layout === "list") {
    return (
      <div className={`space-y-6 ${className}`}>
        {sortedPosts.map((post, index) => (
          <div
            key={post.id}
            className="bg-white dark:bg-neutralDark rounded-lg border border-neutralGray/20 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="md:flex">
              {/* Image */}
              {post.featuredImage?.src && (
                <div className="md:w-1/3">
                  <div className="relative h-48 md:h-full">
                    <Image
                      src={post.featuredImage.src}
                      alt={post.featuredImage.alt || post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 3} // Load first 3 images eagerly
                      className="object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6 md:w-2/3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {post.categories?.slice(0, 2).map((category, index) => (
                      <Chip
                        key={index}
                        size="sm"
                        variant="flat"
                        color="primary"
                      >
                        {category.type}
                      </Chip>
                    ))}
                  </div>

                  <h3 className="text-xl font-bold text-neutralDark dark:text-neutral mb-2">
                    <Link
                      href={`/blog/${post.id}`}
                      className="hover:text-primary dark:hover:text-accent transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-neutralGray dark:text-slate-400 mb-4">
                    {getExcerpt(post.content, 200)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-neutralGray dark:text-slate-400">
                    {formatDate(
                      post.publishSchedule?.scheduledDate ||
                        post.publishSchedule?.scheduled_date ||
                        post.publishDate
                    )}
                  </div>
                  <Link
                    href={`/blog/${post.id}`}
                    className="flex items-center gap-1 text-primary dark:text-accent hover:gap-2 transition-all duration-200 text-sm font-medium"
                  >
                    Read more <TbArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div
      className={`relative grid gap-6 md:gap-8 ${
        sortedPosts.length === 1 ? "grid-cols-1 max-w-2xl mx-auto"
        : sortedPosts.length === 2 ?
          "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
        : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
      } ${className}`}
    >
          {/* Sort button */}
        <BlogSortButton
          className="absolute -top-6 h-10 right-0 transform -translate-y-full rounded-xl"
          sortOrder={sortOrder}
          onToggleSort={toggleSort}
          variant="bordered"
          size="sm"
        />
      {sortedPosts.map((post, index) => (
        <BlogPostCard key={post.id} post={post} index={index} />
      ))}
    </div>
  );
}
