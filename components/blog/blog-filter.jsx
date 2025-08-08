"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Input,
  Select,
  SelectItem,
  Chip,
  Button,
  Switch,
  Card,
  CardBody,
  Divider,
} from "@heroui/react";
import {
  TbSearch,
  TbX,
  TbChartFunnel,
  TbChevronDown,
  TbChevronUp,
} from "react-icons/tb";

/**
 * BlogFilters Component - Encapsulated filtering and search for blog posts
 *
 * @param {Object} props
 * @param {Array} props.posts - Array of blog posts to filter
 * @param {Function} props.onFilteredResults - Callback with filtered results
 * @param {string} props.layout - "horizontal" or "vertical" layout
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showResultsCount - Show filtered results count
 * @param {boolean} props.collapsible - Whether filters can be collapsed
 * @param {boolean} props.compact - Use compact vertical layout
 */
export default function BlogFilters({
  posts = [],
  onFilteredResults,
  layout = "horizontal",
  className = "",
  showResultsCount = true,
  collapsible = false,
  compact = false,
}) {
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagLogic, setTagLogic] = useState("or"); // "or" or "and"
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set());

  // Extract unique categories and tags from posts
  const { categories, tags } = useMemo(() => {
    const categorySet = new Set();
    const tagSet = new Set();

    posts
      .filter((post) => post.show !== false)
      .forEach((post) => {
        // Handle categories
        if (post.categories && Array.isArray(post.categories)) {
          post.categories.forEach((cat) => {
            if (cat.type) categorySet.add(cat.type);
          });
        }

        // Handle tags
        if (post.tags && Array.isArray(post.tags)) {
          post.tags.forEach((tag) => {
            if (tag.type) tagSet.add(tag.type);
          });
        }
      });

    return {
      categories: Array.from(categorySet).sort(),
      tags: Array.from(tagSet).sort(),
    };
  }, [posts]);

  // Filter posts based on current filter states
  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => post.show !== false)
      .filter((post) => {
        // Search filter (title and content)
        if (searchTerm.trim()) {
          const searchLower = searchTerm.toLowerCase();
          const titleMatch = post.title?.toLowerCase().includes(searchLower);
          const contentMatch = post.content
            ?.toLowerCase()
            .includes(searchLower);

          if (!titleMatch && !contentMatch) {
            return false;
          }
        }

        // Category filter
        if (selectedCategories.size > 0) {
          const postCategories =
            post.categories?.map((cat) => cat.type.toLowerCase()) || [];
          const hasMatchingCategory = Array.from(selectedCategories).some(
            (selectedCat) => postCategories.includes(selectedCat)
          );
          if (!hasMatchingCategory) {
            return false;
          }
        }

        // Tag filter
        if (selectedTags.length > 0) {
          const postTags = post.tags?.map((tag) => tag.type) || [];

          if (tagLogic === "and") {
            // All selected tags must be present
            if (!selectedTags.every((tag) => postTags.includes(tag))) {
              return false;
            }
          } else {
            // At least one selected tag must be present
            if (!selectedTags.some((tag) => postTags.includes(tag))) {
              return false;
            }
          }
        }

        return true;
      });
  }, [posts, searchTerm, selectedCategories, selectedTags, tagLogic]);

  // Notify parent of filtered results
  useEffect(() => {
    if (onFilteredResults) {
      onFilteredResults(filteredPosts);
    }
  }, [filteredPosts, onFilteredResults]);

  // Handle tag selection
  const handleTagToggle = (tagType) => {
    setSelectedTags((prev) =>
      prev.includes(tagType) ?
        prev.filter((t) => t !== tagType)
      : [...prev, tagType]
    );
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategories(new Set());
    setSelectedTags([]);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchTerm.trim() || selectedCategories.size > 0 || selectedTags.length > 0;

  // Get layout classes
  const getLayoutClasses = () => {
    if (layout === "vertical") {
      return {
        container: "space-y-4",
        searchWrapper: "w-full",
        categoryWrapper: "w-full",
        clearWrapper: "w-full",
        mainFilters: "space-y-4",
      };
    }
    return {
      container: "space-y-4",
      searchWrapper: "lg:flex-1",
      categoryWrapper: "lg:w-48",
      clearWrapper: "lg:w-32", // Fixed width to prevent layout shift
      mainFilters: "space-y-4 lg:space-y-0 lg:space-x-4 lg:flex lg:items-start",
    };
  };

  const layoutClasses = getLayoutClasses();

  // Render filter content
  const renderFilterContent = () => (
    <div className={layoutClasses.container}>
      {/* Main filters row/column */}
      <div className={layoutClasses.mainFilters}>
        {/* Search Input */}
        <div className={layoutClasses.searchWrapper}>
          <Input
            type="search"
            aria-label="Search posts"
            placeholder="Search posts..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            startContent={<TbSearch size={18} className="text-default-400" />}
            isClearable
            onClear={() => setSearchTerm("")}
            classNames={{
              base: "w-full",
              inputWrapper: "bg-white dark:bg-neutralDark",
              input: "text-[16px] focus-visible:outline-none",
            }}
          />
        </div>

        {/* Category Filter */}
        <div className={layoutClasses.categoryWrapper}>
          <Select
            aria-label="Select categories"
            className="w-full"
            placeholder="All categories"
            selectedKeys={selectedCategories}
            selectionMode="multiple"
            onSelectionChange={setSelectedCategories}
            placement="bottom-start"
            offset={8}
            classNames={{
              trigger: "bg-white dark:bg-neutralDark",
              popoverContent: "bg-zinc-200 dark:bg-neutralDark",
            }}
          >
            {categories.map((category) => (
              <SelectItem key={category.toLowerCase()}>{category}</SelectItem>
            ))}
          </Select>
        </div>

        {/* Clear Filters Button - Always reserve space */}
        <div className={layoutClasses.clearWrapper}>
          <Button
            aria-label="Clear filters"
            variant="flat"
            color="default"
            onPress={clearAllFilters}
            startContent={<TbX size={16} />}
            className={`w-full transition-opacity duration-200 ${
              hasActiveFilters ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            disabled={!hasActiveFilters}
          >
            Clear filters
          </Button>
        </div>
      </div>

      {/* Tags Section */}
      {tags.length > 0 && (
        <>
          {layout === "vertical" && <Divider className="my-4" />}
          <div className={layout === "vertical" ? "mt-4" : "mt-6 w-full"}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutralGray dark:text-slate-300">
                Filter by tags:
              </span>
              {selectedTags.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutralGray dark:text-slate-400">
                    Match:
                  </span>
                  <div className="flex items-center gap-1">
                    <Switch
                      aria-label="Toggle between matching all tags or any tag"
                      size="sm"
                      isSelected={tagLogic === "and"}
                      onValueChange={(checked) =>
                        setTagLogic(checked ? "and" : "or")
                      }
                    />
                    <span className="text-xs">
                      {tagLogic === "and" ? "All tags" : "Any tag"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Chip
                  aria-label={`Toggle ${tag} tag filter`}
                  key={tag}
                  variant={selectedTags.includes(tag) ? "solid" : "bordered"}
                  color={selectedTags.includes(tag) ? "primary" : "default"}
                  onClose={
                    selectedTags.includes(tag) ?
                      () => handleTagToggle(tag)
                    : undefined
                  }
                  onClick={() => handleTagToggle(tag)}
                  className="cursor-pointer hover:scale-105 transition-transform"
                >
                  {tag}
                </Chip>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Compact version for sidebar use
  if (compact && layout === "vertical") {
    return (
      <Card className={`w-full ${className}`}>
        <CardBody className="p-4">
          {/* Compact Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TbChartFunnel size={18} className="text-primary" />
              <h3 className="text-base font-semibold text-neutralDark dark:text-neutral">
                Filters
              </h3>
            </div>
            {showResultsCount && (
              <Chip size="sm" variant="flat" color="primary">
                {filteredPosts.length}
              </Chip>
            )}
          </div>

          {/* Compact Filter Content */}
          <div className="space-y-4 flex flex-col justify-end items-end h-full">
            {/* Search */}
            <Input
              aria-label="Search posts"
              type="search"
              size="sm"
              placeholder="Search..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              startContent={<TbSearch size={16} className="text-default-400" />}
              isClearable
              onClear={() => setSearchTerm("")}
              classNames={{
                inputWrapper: "bg-white dark:bg-neutralDark",
                input: "text-sm",
              }}
            />

            {/* Categories */}
            <Select
              aria-label="Select categories to filter"
              size="sm"
              placeholder="Categories"
              selectedKeys={selectedCategories}
              selectionMode="multiple"
              onSelectionChange={setSelectedCategories}
              classNames={{
                trigger: "bg-white dark:bg-neutralDark",
              }}
            >
              {categories.map((category) => (
                <SelectItem key={category.toLowerCase()}>{category}</SelectItem>
              ))}
            </Select>

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-neutralGray dark:text-slate-300">
                    Tags:
                  </span>
                  {selectedTags.length > 1 && (
                    <div className="flex items-center gap-1">
                      <Switch
                        aria-label="Toggle between matching all tags or any tag"
                        size="sm"
                        isSelected={tagLogic === "and"}
                        onValueChange={(checked) =>
                          setTagLogic(checked ? "and" : "or")
                        }
                      />
                      <span className="text-xs">
                        {tagLogic === "and" ? "All tags" : "Any tag"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Chip
                      aria-label={`Toggle ${tag} tag filter`}
                      key={tag}
                      size="sm"
                      variant={
                        selectedTags.includes(tag) ? "solid" : "bordered"
                      }
                      color={selectedTags.includes(tag) ? "primary" : "default"}
                      onClick={() => handleTagToggle(tag)}
                      className="cursor-pointer text-xs"
                    >
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>
            )}

            {/* Clear button */}
            {hasActiveFilters && (
              <Button
                aria-label="Clear all filters"
                size="sm"
                variant="flat"
                color="default"
                onPress={clearAllFilters}
                startContent={<TbX size={14} />}
                className="w-full"
              >
                Clear
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    );
  }

  // Standard layout
  return (
    <Card className={`w-full ${className}`}>
      <CardBody className={compact ? "p-4" : "p-6"}>
        {/* Header with toggle button if collapsible */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TbChartFunnel size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-neutralDark dark:text-neutral">
              Filter Posts
            </h3>
            {showResultsCount && (
              <Chip size="sm" variant="flat" color="primary">
                {filteredPosts.length}{" "}
                {filteredPosts.length === 1 ? "post" : "posts"}
              </Chip>
            )}
          </div>

          {collapsible && (
            <Button
              aria-label="Toggle filters visibility"
              isIconOnly
              variant="light"
              size="sm"
              onPress={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ?
                <TbChevronDown size={18} />
              : <TbChevronUp size={18} />}
            </Button>
          )}
        </div>

        {/* Filter Content */}
        {(!collapsible || !isCollapsed) && renderFilterContent()}
      </CardBody>
    </Card>
  );
}
