"use client";

import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { CANDIDATE_PAGE_SIZES } from "@/lib/candidate-pagination";
import { cn } from "@/lib/utils";

export default function CandidatePagination({
  page,
  pageCount,
  pageSize,
  total,
  start,
  end,
  onPageChange,
  onPageSizeChange,
  compact = false,
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  start: number;
  end: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  compact?: boolean;
}) {
  if (total === 0) return null;

  return (
    <nav
      aria-label="Candidate pagination"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        compact ? "px-3 py-2.5" : "border-t border-border px-4 py-3 sm:px-5",
      )}
    >
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="text-xs tabular-nums text-muted-foreground"
      >
        Showing {start + 1}–{end} of {total} applications
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {!compact && onPageSizeChange && (
          <label className="mr-1 flex items-center gap-2 text-xs text-muted-foreground">
            Per page
            <select
              aria-label="Candidates per page"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="h-11 sm:h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground"
            >
              {CANDIDATE_PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        )}
        <span className="min-w-16 text-center text-xs tabular-nums text-muted-foreground">
          <span className="sr-only">Page </span>
          {page}
          <span aria-hidden="true"> / </span>
          <span className="sr-only"> of </span>
          {pageCount}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11 sm:size-9 focus-visible:ring-foreground"
          aria-label="Previous candidate page"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <IconChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11 sm:size-9 focus-visible:ring-foreground"
          aria-label="Next candidate page"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          <IconChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
