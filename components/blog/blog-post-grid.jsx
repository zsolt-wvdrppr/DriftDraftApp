import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardBody, CardHeader, CardFooter, Chip } from "@heroui/react";
import { TbCalendar, TbUser, TbArrowRight, TbStarFilled } from "react-icons/tb";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import logger from "@/lib/logger";
import BlogSortButton from "@/components/blog/blog-sort-button";
import BlogPagination from "@/components/blog/blog-pagination";
import { useBlogPostSort } from "@/lib/hooks/blog/useBlogPostSort";
import { useBlogPagination } from "@/lib/hooks/blog/useBlogPagination";
import { slugify } from "@/lib/utils/utils";
import { formatDate } from "@/lib/utils/utils";
import { getExcerpt } from "@/lib/utils/utils";
import { Tooltip } from "react-tooltip";

/**
 * Animated Blog Post Card with Framer Motion
 */
const AnimatedBlogPostCard = ({ post, index }) => {
  const publishDate =
    post.publishDate ||
    post.publishSchedule?.scheduledDate ||
    post.publishSchedule?.scheduled_date;
  const excerpt = getExcerpt(post.excerpt);
  const isPinned = Boolean(post.pinned);

  return (
    <motion.div
      className="relative h-full select-none"
      whileHover={{
        y: -1,
        scale: 1.01,
        transition: { duration: 0.2 },
      }}
    >
      <Card
        className="flex flex-col items-stretch justify-stretch hover:shadow-lg transition-all duration-300 group shadow-none border border-neutralGray/20 dark:border-slate-700"
        classNames={{
          base: "h-full",
        }}
      >
        {isPinned && (
          <div className="absolute top-3 right-3 z-20 h-full">
            <Chip
              size="sm"
              variant="solid"
              className="text-xs font-medium bg-highlightYellow text-white"
            >
              <TbStarFilled size={16} />
            </Chip>
          </div>
        )}

        <CardHeader className="p-0">
          {post.featuredImage?.src && (
            <motion.div
              className="relative h-48 w-full overflow-hidden rounded-t-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={post.featuredImage.src}
                alt={post.featuredImage.alt || post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index < 3}
                className="object-cover"
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                initial={{ opacity: 0.5 }}
                whileHover={{ opacity: 0.3 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          )}
        </CardHeader>

        <CardBody className="px-4 pb-0 pt-4 flex flex-col h-full overflow-visible">
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.categories.slice(0, 2).map((category, catIndex) => (
                <div key={catIndex}>
                  <Chip
                    size="sm"
                    variant="flat"
                    color="primary"
                    className="text-xs"
                  >
                    {category.type}
                  </Chip>
                </div>
              ))}
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold text-neutralDark dark:text-neutralGray mb-3 line-clamp-2 group-hover:text-primary dark:group-hover:text-accent transition-colors">
            <Link href={`/blog/${slugify(post.title, post.id)}`}>
              {post.title}
            </Link>
          </h3>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-neutralDark dark:text-neutralLight text-sm leading-relaxed mb-4 flex-grow hidden md:block">
              {excerpt}
            </p>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 h-12 pt-3 sm:pt-2">
              {post.tags.slice(0, 2).map((tag, tagIndex) => (
                <div key={tagIndex}>
                  <Chip
                    size="sm"
                    variant="bordered"
                    className="text-xs opacity-70"
                  >
                    {"#" + tag.type.toUpperCase()}
                  </Chip>
                </div>
              ))}
              {post.tags.length > 2 && (
                <div>
                  <Chip
                    size="sm"
                    variant="bordered"
                    className="text-xs opacity-50 cursor-help"
                    data-tooltip-id={`tags-tooltip-${post.id}`}
                    data-tooltip-html={post.tags
                      .slice(2)
                      .map((tag) => `#${tag.type.toUpperCase()}`)
                      .join("<br />")}
                  >
                    +{post.tags.length - 2}
                  </Chip>
                  <Tooltip
                    id={`tags-tooltip-${post.id}`}
                    place="top"
                    className="!bg-neutralDark !text-white !text-xs !py-1 !px-2 !rounded-md !opacity-90"
                    style={{ zIndex: 9999 }}
                  />
                </div>
              )}
            </div>
          )}
        </CardBody>

        <CardFooter className="min-h-16 flex flex-col justify-between items-stretch mt-3">
          <div className="flex items-center justify-between pt-4 border-t border-neutralGray/20 dark:border-slate-700">
            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-slate-400">
              {publishDate && (
                <div className="flex items-center gap-1">
                  <TbCalendar size={14} />
                  <time>{formatDate(publishDate)}</time>
                </div>
              )}
            </div>

            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href={`/blog/${slugify(post.title, post.id)}`}
                className="flex items-center gap-1 text-primary dark:text-accent hover:gap-2 transition-all duration-200 text-sm font-medium"
              >
                Read more
                <TbArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

/**
 * Animated List View Component
 */
const AnimatedBlogPostList = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="max-w-md mx-auto">
          <motion.div
            className="w-24 h-24 mx-auto mb-4 bg-neutralGray/20 dark:bg-slate-700 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <TbUser
              size={32}
              className="text-neutralGray dark:text-slate-400"
            />
          </motion.div>
          <h3 className="text-xl font-semibold text-neutralDark dark:text-neutral mb-2">
            No posts found
          </h3>
          <p className="text-neutralGray dark:text-slate-400">
            Try adjusting your filters or search terms to find what you're
            looking for.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence mode="popLayout">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{
              duration: 0.4,
              delay: index * 0.1,
              type: "spring",
              stiffness: 100,
            }}
            className="bg-white dark:bg-neutralDark rounded-lg border border-neutralGray/20 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
            whileHover={{ shadow: "0 10px 25px rgba(0,0,0,0.1)" }}
          >
            <div className="md:flex">
              {/* Image */}
              {post.featuredImage?.src && (
                <div className="md:w-1/3">
                  <motion.div
                    className="relative h-48 md:h-full overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={post.featuredImage.src}
                      alt={post.featuredImage.alt || post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index < 3}
                      className="object-cover"
                    />
                  </motion.div>
                </div>
              )}

              {/* Content */}
              <div className="p-6 md:w-2/3 flex flex-col justify-between">
                <div>
                  {post.categories?.slice(0, 2).map((category, catIndex) => (
                    <Chip
                      size="sm"
                      variant="flat"
                      color="primary"
                      className="cursor-pointer"
                    >
                      {category.type}
                    </Chip>
                  ))}

                  <h3 className="text-xl font-bold text-neutralDark dark:text-neutral mb-2">
                    <Link
                      href={`/blog/${slugify(post.title, post.id)}`}
                      className="hover:text-primary dark:hover:text-accent transition-colors hover:no-underline"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-neutralGray dark:text-slate-400 mb-4">
                    {getExcerpt(post.content, 200)}
                  </p>
                </div>

                <motion.div
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  <div className="text-sm text-neutralGray dark:text-slate-400">
                    {formatDate(
                      post.publishSchedule?.scheduledDate ||
                        post.publishSchedule?.scheduled_date ||
                        post.publishDate
                    )}
                  </div>
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link
                      href={`/blog/${slugify(post.title, post.id)}`}
                      className="flex items-center gap-1 text-primary dark:text-accent hover:gap-2 transition-all duration-200 text-sm font-medium"
                    >
                      Read more <TbArrowRight size={14} />
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const CARD_HEIGHT = 534; // Approximate card height in pixels
const GAP_SIZE = 24; // Gap between cards (gap-6 = 24px)
const CARDS_PER_ROW = { sm: 1, md: 2, xl: 3 }; // Responsive breakpoints

// Helper to calculate expected grid height
const calculateGridHeight = (postCount, screenSize = "xl") => {
  const cardsPerRow = CARDS_PER_ROW[screenSize];
  const rows = Math.ceil(postCount / cardsPerRow);
  return rows * CARD_HEIGHT + (rows - 1) * GAP_SIZE;
};

/**
 * Main Animated Blog Post Grid Component
 */
export default function AnimatedBlogPostGrid({
  posts = [],
  layout = "grid",
  className = "",
  pageSize = 9,
  showPagination = true,
  paginationProps = {},
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [canShowNewCards, setCanShowNewCards] = useState(true);
  const [gridHeight, setGridHeight] = useState("auto");
  const { sortedPosts, sortOrder, toggleSort } = useBlogPostSort(posts);
  const paginationData = useBlogPagination(sortedPosts, pageSize, true);
  const { currentPosts, isPaginationNeeded, currentPage } = paginationData;

  // Handle page transitions
  // Enhanced page transition handling
  useEffect(() => {
    if (currentPage || sortedPosts.length) {
      setIsTransitioning(true);
      setCanShowNewCards(false);

      // Calculate and set grid height before transition
      const expectedHeight = calculateGridHeight(currentPosts.length);
      setGridHeight(expectedHeight);

      // Sequential timing: exit → pause → enter
      const exitTimer = setTimeout(() => {
        setCanShowNewCards(true);
      }, 300); // After cards exit (0.3s)

      const completeTimer = setTimeout(() => {
        setIsTransitioning(false);
        setGridHeight("auto"); // Reset to auto after transition
      }, 700); // After cards enter (0.3s exit + 0.1s pause + 0.3s enter)

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [currentPage, sortedPosts.length]);

  // Debug logging
  logger.debug("🔍 AnimatedBlogPostGrid received posts:", posts.length);
  logger.debug(
    "🔍 AnimatedBlogPostGrid current page posts:",
    currentPosts.length
  );

  if (!sortedPosts || sortedPosts.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-md mx-auto">
          <motion.div
            className="w-24 h-24 mx-auto mb-4 bg-neutralGray/20 dark:bg-slate-700 rounded-full flex items-center justify-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          >
            <TbUser
              size={32}
              className="text-neutralGray dark:text-slate-400"
            />
          </motion.div>
          <motion.h3
            className="text-xl font-semibold text-neutralDark dark:text-neutral mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            No posts found
          </motion.h3>
          <motion.p
            className="text-neutralGray dark:text-slate-400"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Try adjusting your filters or search terms to find what you're
            looking for.
          </motion.p>
        </div>
      </motion.div>
    );
  }

  if (layout === "list") {
    return (
      <motion.div
        className={`space-y-6 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <AnimatedBlogPostList posts={currentPosts} />

        {showPagination && isPaginationNeeded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <BlogPagination
              paginationData={paginationData}
              {...paginationProps}
            />
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Grid layout with Framer Motion
  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <LayoutGroup>
        {/* Sort button */}
        <div >
          <BlogSortButton
            className="rounded-xl absolute top-[-129px] h-[53.4px] -right-4 sm:-right-8 md:top-[-115px] md:-right-9 lg:-right-11 lg:top-[-114px] xl:top-[-85px] xl:-right-16"
            sortOrder={sortOrder}
            onToggleSort={toggleSort}
            variant="bordered"
            size="lg"
          />
        </div>
        {/* Grid container */}
        <motion.div
          className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
          layout
          style={{
            minHeight: isTransitioning ? gridHeight : "auto",
            transition: "min-height 0.3s ease-in-out",
          }}
        >
          <AnimatePresence
            mode="wait"
            onExitComplete={() => {
              // Ensure cards can enter after exit completes
              setTimeout(() => setCanShowNewCards(true), 100);
            }}
          >
            {canShowNewCards &&
              currentPosts.map((post, index) => (
                <motion.div
                  key={`${post.id}-${currentPage}`}
                  layout
                  layoutId={`card-${post.id}`} // Add layoutId for smoother transitions
                  initial={{ opacity: 0, y: 60, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }} // Faster, less dramatic exit
                  transition={{
                    duration: 0.4,
                    delay: canShowNewCards ? index * 0.05 : 0, // Reduced stagger delay
                    type: "spring",
                    stiffness: 120,
                    damping: 15,
                  }}
                  whileHover={{
                    y: -2,
                    scale: 1.01,
                    transition: { duration: 0.2 },
                  }}
                >
                  <AnimatedBlogPostCard post={post} index={index} />
                </motion.div>
              ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {/* Pagination */}
      {showPagination && isPaginationNeeded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: isTransitioning ? 0.7 : 1,
            y: 0,
          }}
          transition={{
            delay: isTransitioning ? 0 : 0.5, // Delay until after cards settle
            duration: 0.3,
          }}
          layout
        >
          <BlogPagination
            paginationData={paginationData}
            {...paginationProps}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
