"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

/**
 * Enterprise SaaS Pagination Component
 * 
 * @param {number} currentPage - Active page (1-based index)
 * @param {number} totalPages - Total calculated pages
 * @param {number} totalItems - Total count of records
 * @param {number} pageSize - Number of items displayed per page
 * @param {function} onPageChange - Callback when a new page is clicked (page: number) => void
 * @param {function} [onPageSizeChange] - Optional callback when page size changes (size: number) => void
 * @param {number[]} [pageSizeOptions] - Optional list of selectable page sizes, e.g. [10, 20, 50]
 * @param {boolean} [compact] - Reduced footprint mode for sidebars/modals
 * @param {string} [className] - Additional styling classes
 */
export default function Pagination({
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
  // Guard against invalid inputs
  const safeCurrentPage = Math.max(1, Math.min(currentPage, Math.max(1, totalPages)));
  const safeTotalPages = Math.max(1, totalPages);

  // Compute item range string: "Showing 1 to 10 of 142 records"
  const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, safeCurrentPage * pageSize);

  // Helper to generate numbered buttons with ellipses
  const getPageNumbers = () => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    const pages = [];
    const maxVisibleCenter = 3;
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

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < safeTotalPages - 1) pages.push("...");
    pages.push(safeTotalPages);

    return pages;
  };

  const pages = getPageNumbers();

  const handlePrev = () => {
    if (safeCurrentPage > 1 && onPageChange) {
      onPageChange(safeCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (safeCurrentPage < safeTotalPages && onPageChange) {
      onPageChange(safeCurrentPage + 1);
    }
  };

  const handleFirst = () => {
    if (safeCurrentPage > 1 && onPageChange) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (safeCurrentPage < safeTotalPages && onPageChange) {
      onPageChange(safeTotalPages);
    }
  };

  if (safeTotalPages <= 1 && totalItems <= pageSize && !onPageSizeChange) {
    // Single page with no page-size selector, render minimal info
    return (
      <div
        className={`flex items-center justify-between text-xs text-zinc-400 py-3 px-2 border-t border-white/5 ${className}`}
      >
        <span>
          Showing <strong className="text-white font-mono">{totalItems}</strong> record
          {totalItems === 1 ? "" : "s"}
        </span>
        <span className="text-[11px] text-zinc-500 font-mono">Page 1 of 1</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 bg-[#101014] border border-white/5 rounded-2xl text-xs ${className}`}
    >
      {/* Left: Records summary count and optional page-size picker */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        <div className="text-zinc-400">
          Showing{" "}
          <span className="font-mono font-bold text-white">{startItem}</span> to{" "}
          <span className="font-mono font-bold text-white">{endItem}</span> of{" "}
          <span className="font-mono font-bold text-[#CDFE02]">{totalItems}</span> records
        </div>

        {onPageSizeChange && pageSizeOptions?.length > 0 && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-white/10 text-zinc-400">
            <span className="text-[11px] hidden md:inline">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-[#141418] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#5733F0] cursor-pointer"
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

      {/* Right: Controls & Page Number Pills */}
      <div className="flex items-center gap-1.5">
        {/* First Page */}
        {!compact && (
          <button
            type="button"
            onClick={handleFirst}
            disabled={safeCurrentPage === 1}
            title="First Page"
            className="p-1.5 rounded-lg bg-[#141418] border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Previous Page */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={safeCurrentPage === 1}
          title="Previous Page"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141418] border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all font-medium text-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numbered Page Buttons */}
        {!compact && (
          <div className="flex items-center gap-1">
            {pages.map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-7 h-7 flex items-center justify-center text-zinc-500 font-mono text-xs select-none"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = p === safeCurrentPage;
              return (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange && onPageChange(p)}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                    isCurrent
                      ? "bg-[#5733F0] text-white shadow-md shadow-[#5733F0]/30 border border-[#5733F0]"
                      : "bg-[#141418] text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        )}

        {/* Compact Page Display */}
        {compact && (
          <div className="px-2 text-xs font-mono text-zinc-400">
            <span className="text-white font-bold">{safeCurrentPage}</span> / {safeTotalPages}
          </div>
        )}

        {/* Next Page */}
        <button
          type="button"
          onClick={handleNext}
          disabled={safeCurrentPage === safeTotalPages}
          title="Next Page"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#141418] border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all font-medium text-xs"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        {!compact && (
          <button
            type="button"
            onClick={handleLast}
            disabled={safeCurrentPage === safeTotalPages}
            title="Last Page"
            className="p-1.5 rounded-lg bg-[#141418] border border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
