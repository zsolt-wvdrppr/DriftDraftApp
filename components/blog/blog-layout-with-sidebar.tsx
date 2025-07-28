"use client";

import React, { useState, ReactElement } from "react";
import { Button } from "@heroui/react";
import { TbFilter, TbX } from "react-icons/tb";

import logger from "@/lib/logger";

import BlogFilters from "./blog-filter";

// Type definitions
interface Post {
  id: string | number;
  title: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string | Date;
  author?: {
    name: string;
    avatar?: string;
  };
  featured?: boolean;
  [key: string]: any; // Allow additional properties
}

interface BlogLayoutWithSidebarProps {
  posts?: any[]; // You can make this more specific with your BlogPost type
  children: React.ReactNode;
  sidebarPosition?: 'left' | 'right'; // Add this prop
  showMobileToggle?: boolean;
  className?: string;
}

interface FilteredResultsHandler {
  (filtered: Post[]): void;
}

interface ChildWithPosts extends ReactElement {
  props: {
    posts?: Post[];
    [key: string]: any;
  };
}

interface UseBlogSidebarReturn {
  filteredPosts: Post[];
  FilterDrawer: () => ReactElement;
  FilterToggle: () => ReactElement;
  isFilterOpen: boolean;
  setIsFilterOpen: () => void;
}

/**
 * BlogLayoutWithSidebar - Simplified layout using drawer approach everywhere
 */
export default function BlogLayoutWithSidebar({
  posts = [],
  children,
  showMobileToggle = true,
  className = "",
}: BlogLayoutWithSidebarProps): ReactElement {
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [activeFilterCount, setActiveFilterCount] = useState<number>(0);

  // Filter handler
  const handleFilteredResults: FilteredResultsHandler = (filtered: Post[]) => {
    logger.debug("🔥 handleFilteredResults called with:", filtered.length);
    setFilteredPosts(filtered);

    // Simple filter detection
    const hasActiveFilters: boolean = filtered.length !== posts.length;

    setActiveFilterCount(hasActiveFilters ? 1 : 0);
  };

  // Clone children and pass filtered posts
  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      logger.debug(
        "🚀 RENDER: Current filteredPosts state:",
        filteredPosts.length
      );

      return React.cloneElement(child as ChildWithPosts, { posts: filteredPosts });
    }

    return child;
  });

  return (
    <div className={` ${className}`}>
      {/* Floating Filter Button - All screen sizes */}
      {showMobileToggle && (
        <div className="fixed bottom-6 right-6 z-40">
          <div className="relative">
            <Button
              isIconOnly
              aria-label="Open filter drawer"
              className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              color="primary"
              size="lg"
              onPress={() => setIsFilterOpen(true)}
            >
              <TbFilter size={24} />
            </Button>

            {/* Active filters count badge */}
            {activeFilterCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[22px] h-6 flex items-center justify-center px-1.5 shadow-lg ring-2 ring-white dark:ring-neutralDark animate-pulse">
                {activeFilterCount}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Filter Button - All screen sizes */}
        {showMobileToggle && (
          <div className="mb-6 mr-28 sm:mr-40">
            <Button
              aria-label="Toggle filters"
              className="w-full"
              startContent={<TbFilter size={18} />}
              variant="bordered"
              onPress={() => setIsFilterOpen(true)}
            >
              {activeFilterCount > 0 ?
                `Filters (${activeFilterCount})`
              : "Show Filters"}
            </Button>
          </div>
        )}

        {/* Main Content */}
        <main>{childrenWithProps}</main>
      </div>

      {/* Custom Drawer with persistent BlogFilters */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isFilterOpen ?
            "opacity-100 visible"
          : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {/* Responsive backdrop */}
        <div
          aria-label="Close filter drawer"
          className={`absolute inset-0 transition-opacity duration-300 ${
            typeof window !== "undefined" && window.innerWidth >= 1024 ?
              "bg-transparent"
            : "bg-black/50 backdrop-blur-sm"
          } ${isFilterOpen ? "opacity-100" : "opacity-0"}`}
          role="button"
          tabIndex={0}
          onClick={() => setIsFilterOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsFilterOpen(false);
            }
          }}
        />

        {/* Drawer */}
        <div
          className={`absolute inset-y-0 left-0 w-80 max-w-[90vw] lg:w-96 bg-white dark:bg-neutralDark shadow-2xl transform transition-transform duration-300 ease-out ${
            isFilterOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutralGray/20 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-neutralDark dark:text-neutral">
                Filter Posts
              </h2>
              <Button
                isIconOnly
                aria-label="Close filter drawer"
                className="hover:bg-neutralGray/10 dark:hover:bg-slate-700/50"
                size="sm"
                variant="light"
                onPress={() => setIsFilterOpen(false)}
              >
                <TbX size={20} />
              </Button>
            </div>

            {/* Filter Content - Always rendered to maintain state */}
            <div className="flex-1 overflow-y-auto p-4">
              <BlogFilters
                className="border-0 shadow-none bg-transparent"
                collapsible={false}
                compact={true}
                layout="vertical"
                posts={posts}
                showResultsCount={true}
                onFilteredResults={handleFilteredResults}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Simplified hook version
 */
export function useBlogSidebar(posts: Post[]): UseBlogSidebarReturn {
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [activeFilterCount, setActiveFilterCount] = useState<number>(0);

  const handleFilteredResults: FilteredResultsHandler = (filtered: Post[]) => {
    setFilteredPosts(filtered);
    const hasActiveFilters: boolean = filtered.length !== posts.length;

    setActiveFilterCount(hasActiveFilters ? 1 : 0);
  };

  const FilterDrawer = (): ReactElement => (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isFilterOpen ?
          "opacity-100 visible"
        : "opacity-0 invisible pointer-events-none"
      }`}
    >
      <div
        aria-label="Close filter drawer"
        className={`absolute inset-0 transition-opacity duration-300 ${
          typeof window !== "undefined" && window.innerWidth < 1024 ?
            "bg-black/50 backdrop-blur-sm"
          : "bg-transparent"
        } ${isFilterOpen ? "opacity-100" : "opacity-0"}`}
        role="button"
        tabIndex={0}
        onClick={() => setIsFilterOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsFilterOpen(false);
          }
        }}
      />
      
      <div
        className={`absolute inset-y-0 left-0 w-80 max-w-[90vw] lg:w-96 bg-white dark:bg-neutralDark shadow-2xl transform transition-transform duration-300 ease-out ${
          isFilterOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-neutralGray/20 dark:border-slate-700">
            <h2 className="text-lg font-semibold">Filter Posts</h2>
            <Button
              isIconOnly
              aria-label="Close filter drawer"
              size="sm"
              variant="light"
              onPress={() => setIsFilterOpen(false)}
            >
              <TbX size={20} />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <BlogFilters
              key="persistent-hook-filter" // Static key to maintain state
              className="border-0 shadow-none bg-transparent"
              collapsible={false}
              compact={true}
              layout="vertical"
              posts={posts}
              showResultsCount={true}
              onFilteredResults={handleFilteredResults}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const FilterToggle = (): ReactElement => (
    <>
      {/* Top button */}
      <div className="mb-6">
        <Button
          aria-label="Toggle filters"
          className="w-full"
          startContent={<TbFilter size={18} />}
          variant="bordered"
          onPress={() => setIsFilterOpen(true)}
        >
          {activeFilterCount > 0 ?
            `Filters (${activeFilterCount})`
          : "Show Filters"}
        </Button>
      </div>

      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          <Button
            isIconOnly
            aria-label="Open filter drawer"
            className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            color="primary"
            size="lg"
            onPress={() => setIsFilterOpen(true)}
          >
            <TbFilter size={24} />
          </Button>

          {activeFilterCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full min-w-[22px] h-6 flex items-center justify-center px-1.5 shadow-lg ring-2 ring-white dark:ring-neutralDark animate-pulse">
              {activeFilterCount}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return {
    filteredPosts,
    FilterDrawer,
    FilterToggle,
    isFilterOpen,
    setIsFilterOpen: () => setIsFilterOpen(true),
  };
}