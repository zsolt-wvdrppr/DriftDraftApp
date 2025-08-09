import React from "react";
import { Button } from "@heroui/react";
import { TbSortAscending, TbSortDescending, TbCalendar } from "react-icons/tb";
import clsx from "clsx";

/**
 * Reusable sort button component for blog posts
 * @param {string} sortOrder - Current sort order ('asc' or 'desc')
 * @param {function} onToggleSort - Function to toggle sort order
 * @param {string} variant - Button variant (default: 'bordered')
 * @param {string} size - Button size (default: 'sm')
 * @param {string} className - Additional CSS classes
 * @param {boolean} showText - Whether to show text label (default: true)
 */
export default function BlogSortButton({
  sortOrder = "desc",
  onToggleSort,
  variant = "bordered",
  className = "",
  showText = true,
  size = "sm",
}) {
  const isDescending = sortOrder === "desc";

  const SortIcon = isDescending ? TbSortDescending : TbSortAscending;
  const sortText = isDescending ? "Newest first" : "Oldest first";
  const ariaLabel = `Sort by date: ${sortText}`;

  return (

    <Button
      variant={variant}
      startContent={<TbCalendar size={size === "sm" ? 16 : 20} />}
      endContent={<SortIcon size={size === "sm" ? 16 : 20} />}
      onPress={onToggleSort}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={className}
      size={size}
    >
      {showText && <span className="hidden sm:inline w-28 text-lg">{sortText}</span>}
      <span className="sm:hidden text-lg">Sort</span>
    </Button>

  );
}
