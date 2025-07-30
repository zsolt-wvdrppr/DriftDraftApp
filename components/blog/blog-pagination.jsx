import React from "react";
import { Button, Select, SelectItem, Chip } from "@heroui/react";
import {
  TbChevronLeft,
  TbChevronRight,
  TbChevronsLeft,
  TbChevronsRight,
} from "react-icons/tb";

/**
 * Pagination component for blog posts
 * @param {Object} paginationData - Data from useBlogPagination hook
 * @param {string} variant - Button variant (default: 'bordered')
 * @param {string} size - Button size (default: 'sm')
 * @param {string} className - Additional CSS classes
 * @param {boolean} showPageSize - Show page size selector (default: true)
 * @param {boolean} showInfo - Show pagination info text (default: true)
 * @param {boolean} showFirstLast - Show first/last page buttons (default: true)
 * @param {number} maxVisiblePages - Max page numbers to show (default: 5)
 * @param {Array} pageSizeOptions - Available page size options
 */
export default function BlogPagination({
  paginationData,
  variant = "bordered",
  size = "sm",
  className = "",
  showPageSize = true,
  showInfo = true,
  showFirstLast = true,
  maxVisiblePages = 5,
  pageSizeOptions = [6, 9, 12, 18, 24],
}) {
  const {
    currentPage,
    pageSize,
    totalPages,
    totalPosts,
    isPaginationNeeded,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    getPageNumbers,
    getPaginationInfo,
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage,
  } = paginationData;

  // Don't render if pagination isn't needed
  if (!isPaginationNeeded) {
    return showInfo ? (
      <div className={`text-center py-4 ${className}`}>
        <p className="text-sm text-neutralGray dark:text-slate-400">
          {getPaginationInfo()}
        </p>
      </div>
    ) : null;
  }

  const pageNumbers = getPageNumbers(maxVisiblePages);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Pagination Info */}
      {showInfo && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-neutralGray dark:text-slate-400">
          <span>{getPaginationInfo()}</span>
          
          {/* Page Size Selector */}
          {showPageSize && (
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap">Posts per page:</span>
              <Select
                aria-label="Select posts per page"
                selectedKeys={[pageSize.toString()]}
                onSelectionChange={(keys) => {
                  const newSize = parseInt(Array.from(keys)[0]);
                  if (newSize && newSize !== pageSize) {
                    changePageSize(newSize);
                  }
                }}
                className="w-20"
                size="sm"
                variant="bordered"
              >
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option.toString()} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          {showFirstLast && (
            <Button
              isIconOnly
              variant={variant}
              size={size}
              onPress={goToFirstPage}
              isDisabled={isFirstPage}
              aria-label="Go to first page"
              className="text-neutralGray dark:text-slate-400"
            >
              <TbChevronsLeft size={16} />
            </Button>
          )}

          {/* Previous Page */}
          <Button
            isIconOnly
            variant={variant}
            size={size}
            onPress={goToPreviousPage}
            isDisabled={!hasPreviousPage}
            aria-label="Go to previous page"
            className="text-neutralGray dark:text-slate-400"
          >
            <TbChevronLeft size={16} />
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 mx-2">
            {pageNumbers.map((pageNum) => {
              const isCurrentPage = pageNum === currentPage;
              return (
                <Button
                  key={pageNum}
                  variant={isCurrentPage ? "solid" : variant}
                  color={isCurrentPage ? "primary" : "default"}
                  size={size}
                  onPress={() => goToPage(pageNum)}
                  className={`min-w-[2.5rem] ${
                    isCurrentPage 
                      ? "text-white" 
                      : "text-neutralGray dark:text-slate-400"
                  }`}
                  aria-label={`Go to page ${pageNum}`}
                  aria-current={isCurrentPage ? "page" : undefined}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          {/* Next Page */}
          <Button
            isIconOnly
            variant={variant}
            size={size}
            onPress={goToNextPage}
            isDisabled={!hasNextPage}
            aria-label="Go to next page"
            className="text-neutralGray dark:text-slate-400"
          >
            <TbChevronRight size={16} />
          </Button>

          {/* Last Page */}
          {showFirstLast && (
            <Button
              isIconOnly
              variant={variant}
              size={size}
              onPress={goToLastPage}
              isDisabled={isLastPage}
              aria-label="Go to last page"
              className="text-neutralGray dark:text-slate-400"
            >
              <TbChevronsRight size={16} />
            </Button>
          )}
        </div>

        {/* Current Page Indicator (Mobile) */}
        <div className="sm:hidden">
          <Chip variant="flat" color="primary" size="sm">
            Page {currentPage} of {totalPages}
          </Chip>
        </div>
      </div>
    </div>
  );
}