import { useState, useMemo } from "react";

/**
 * Custom hook for sorting blog posts by publish date with pinned posts priority
 * @param {Array} posts - Array of blog posts
 * @returns {Object} - { sortedPosts, sortOrder, setSortOrder, toggleSort }
 */
export const useBlogPostSort = (posts = []) => {
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

  // Helper function to get publish date or fallback to today
  const getPublishDate = (post) => {
    const publishDate =
      post.publishDate ||
      post.publishSchedule?.scheduledDate ||
      post.publishSchedule?.scheduled_date;

    // If no date found, use today's date
    return publishDate ? new Date(publishDate) : new Date();
  };

  // Memoized sorted posts to prevent unnecessary re-calculations
  const sortedPosts = useMemo(() => {
    if (!posts || posts.length === 0) return [];

    return [...posts].sort((a, b) => {
      const dateA = getPublishDate(a);
      const dateB = getPublishDate(b);
      const isPinnedA = Boolean(a.pinned);
      const isPinnedB = Boolean(b.pinned);

      // First priority: Pinned posts come first
      if (isPinnedA && !isPinnedB) return -1;
      if (!isPinnedA && isPinnedB) return 1;

      // Second priority: Within same pinned status, sort by date
      if (sortOrder === "desc") {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });
  }, [posts, sortOrder]);

  // Function to toggle between ascending and descending
  const toggleSort = () => {
    setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  return {
    sortedPosts,
    sortOrder,
    setSortOrder,
    toggleSort,
  };
};
