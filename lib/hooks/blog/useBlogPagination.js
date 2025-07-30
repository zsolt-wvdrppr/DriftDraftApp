"use client";

import { useState, useMemo, useCallback } from "react";

/**
 * Custom hook for blog pagination with filtering support
 * @param {Array} posts - All posts to paginate
 * @param {number} initialPageSize - Posts per page (default: 9)
 * @param {boolean} resetOnFilter - Whether to reset to page 1 when posts change (default: true)
 */
export function useBlogPagination(
  posts = [],
  initialPageSize = 9,
  resetOnFilter = true
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Calculate pagination values
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Get current page posts
  const currentPosts = useMemo(() => {
    return posts.slice(startIndex, endIndex);
  }, [posts, startIndex, endIndex]);

  // Reset to page 1 when posts change (after filtering)
  useMemo(() => {
    if (resetOnFilter && currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [posts.length, currentPage, totalPages, resetOnFilter]);

  // Navigation functions
  const goToPage = useCallback(
    (page) => {
      const validPage = Math.max(1, Math.min(page, totalPages));

      setCurrentPage(validPage);
    },
    [totalPages]
  );

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  // Page size management
  const changePageSize = useCallback(
    (newSize) => {
      const newPageSize = Math.max(1, newSize);

      setPageSize(newPageSize);

      // Adjust current page to keep roughly the same posts visible
      const currentFirstPost = (currentPage - 1) * pageSize + 1;
      const newPage = Math.ceil(currentFirstPost / newPageSize);

      setCurrentPage(Math.max(1, newPage));
    },
    [currentPage, pageSize]
  );

  // Get page numbers for pagination controls
  const getPageNumbers = useCallback(
    (maxVisible = 5) => {
      if (totalPages <= maxVisible) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, start + maxVisible - 1);

      // Adjust start if we're near the end
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    },
    [currentPage, totalPages]
  );

  // Check if pagination is needed
  const isPaginationNeeded = totalPosts > pageSize;

  // Get pagination info for display
  const getPaginationInfo = useCallback(() => {
    if (totalPosts === 0) {
      return "No posts found";
    }

    const start = startIndex + 1;
    const end = Math.min(endIndex, totalPosts);

    return `Showing ${start}-${end} of ${totalPosts} posts`;
  }, [startIndex, endIndex, totalPosts]);

  return {
    // Current state
    currentPage,
    pageSize,
    totalPages,
    totalPosts,
    currentPosts,
    isPaginationNeeded,

    // Navigation
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,

    // Utilities
    changePageSize,
    getPageNumbers,
    getPaginationInfo,

    // Computed values
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
  };
}
