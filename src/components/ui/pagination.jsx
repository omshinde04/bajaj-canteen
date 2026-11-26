import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

const PaginationLink = ({
  className,
  isActive,
  size = "icon",
  ...props
}) => (
  <button
    aria-current={isActive ? "page" : undefined}
    className={cn(
      buttonVariants({
        variant: isActive ? "default" : "outline",
        size,
      }),
      isActive
        ? "bg-indigo-600 text-white font-bold border-indigo-600 shadow-xs"
        : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200",
      "h-8 w-8 text-xs font-mono",
      className
    )}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}) => (
  <button
    aria-label="Go to previous page"
    className={cn(
      buttonVariants({
        variant: "outline",
        size: "sm",
      }),
      "gap-1 pl-2.5 h-8 text-xs border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer",
      className
    )}
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span className="hidden sm:inline">Prev</span>
  </button>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}) => (
  <button
    aria-label="Go to next page"
    className={cn(
      buttonVariants({
        variant: "outline",
        size: "sm",
      }),
      "gap-1 pr-2.5 h-8 text-xs border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none cursor-pointer",
      className
    )}
    {...props}
  >
    <span className="hidden sm:inline">Next</span>
    <ChevronRight className="h-4 w-4" />
  </button>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}) => (
  <span
    aria-hidden
    className={cn("flex h-8 w-8 items-center justify-center text-slate-400 font-mono text-xs", className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

/**
 * High-Level Smart Shadcn Pagination Bar
 * Fully interactive with item summary, page numbers, dynamic size selector
 */
export function ShadcnPaginationBar({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  compact = false,
  className = "",
}) {
  const safeCurrentPage = Math.max(1, Math.min(currentPage, Math.max(1, totalPages)));
  const safeTotalPages = Math.max(1, totalPages);

  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, safeCurrentPage * pageSize);

  const getPageNumbers = () => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }
    const pages = [];
    let start = Math.max(2, safeCurrentPage - 1);
    let end = Math.min(safeTotalPages - 1, safeCurrentPage + 1);

    if (safeCurrentPage <= 3) {
      start = 2;
      end = 4;
    } else if (safeCurrentPage >= safeTotalPages - 2) {
      start = safeTotalPages - 3;
      end = safeTotalPages - 1;
    }

    pages.push(1);
    if (start > 2) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < safeTotalPages - 1) pages.push("...");
    pages.push(safeTotalPages);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs",
        className
      )}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="text-slate-600">
          Showing{" "}
          <span className="font-mono font-bold text-slate-900">{startItem}</span> to{" "}
          <span className="font-mono font-bold text-slate-900">{endItem}</span> of{" "}
          <span className="font-mono font-bold text-indigo-600">{totalItems}</span> records
        </div>

        {onPageSizeChange && pageSizeOptions?.length > 0 && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200 text-slate-500">
            <span className="text-[11px] hidden md:inline">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-indigo-600 cursor-pointer shadow-xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / page
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Pagination className="w-auto mx-0">
        <PaginationContent>
          {!compact && (
            <PaginationItem>
              <button
                type="button"
                onClick={() => onPageChange && onPageChange(1)}
                disabled={safeCurrentPage === 1}
                title="First Page"
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs cursor-pointer h-8 w-8 flex items-center justify-center"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>
            </PaginationItem>
          )}

          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange && onPageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage === 1}
            />
          </PaginationItem>

          {!compact &&
            pages.map((p, idx) => {
              if (p === "...") {
                return (
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );
              }
              const isCurrent = p === safeCurrentPage;
              return (
                <PaginationItem key={`page-${p}`}>
                  <PaginationLink
                    isActive={isCurrent}
                    onClick={() => onPageChange && onPageChange(p)}
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

          {compact && (
            <div className="px-2 text-xs font-mono text-slate-600">
              <span className="text-slate-900 font-bold">{safeCurrentPage}</span> / {safeTotalPages}
            </div>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => onPageChange && onPageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage === safeTotalPages}
            />
          </PaginationItem>

          {!compact && (
            <PaginationItem>
              <button
                type="button"
                onClick={() => onPageChange && onPageChange(safeTotalPages)}
                disabled={safeCurrentPage === safeTotalPages}
                title="Last Page"
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs cursor-pointer h-8 w-8 flex items-center justify-center"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
