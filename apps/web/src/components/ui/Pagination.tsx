import React from "react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  /** Current active page (1-indexed). */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Callback fired when a page is selected. */
  onPageChange: (page: number) => void;
}

/**
 * Page navigation component with prev/next buttons and numbered pages.
 */
export const Pagination = React.memo(function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }

    return pages;
  };

  const buttonBase =
    "size-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150";

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={clsx(
          buttonBase,
          "text-text-secondary hover:text-text-primary hover:bg-overlay/5",
          "disabled:opacity-30 disabled:pointer-events-none",
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </button>

      {getPageNumbers().map((page, idx) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${idx}`}
            className="size-9 flex items-center justify-center text-text-muted text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={clsx(
              buttonBase,
              page === currentPage
                ? "bg-primary text-text-inverse"
                : "text-text-secondary hover:text-text-primary hover:bg-overlay/5",
            )}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={clsx(
          buttonBase,
          "text-text-secondary hover:text-text-primary hover:bg-overlay/5",
          "disabled:opacity-30 disabled:pointer-events-none",
        )}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
});
