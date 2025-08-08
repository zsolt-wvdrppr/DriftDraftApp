import React from "react";
import { Button } from "@heroui/react";
import { TbSortAscending, TbSortDescending, TbCalendar } from "react-icons/tb";

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
  size = "sm",
  className = "",
  showText = true,
}) {
  const isDescending = sortOrder === "desc";

  const SortIcon = isDescending ? TbSortDescending : TbSortAscending;
  const sortText = isDescending ? "Newest first" : "Oldest first";
  const ariaLabel = `Sort by date: ${sortText}`;

  return (
    <Button
      variant={variant}
      size={size}
      startContent={<TbCalendar size={20} />}
      endContent={<SortIcon size={20} />}
      onPress={onToggleSort}
      className={`text-neutralGray dark:text-slate-400 hover:text-neutralDark dark:hover:text-neutral transition-colors h-11 ${className}`}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {showText && <span className="hidden sm:inline">{sortText}</span>}
      <span className="sm:hidden">Sort</span>
    </Button>
  );
}
