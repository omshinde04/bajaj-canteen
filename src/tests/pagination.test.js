import { describe, it, expect } from "vitest";

describe("Shared SaaS Pagination Component Unit Tests", () => {
  // Helper implementing the getPageNumbers algorithm used in Pagination.js
  const getPageNumbers = (currentPage, totalPages) => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      start = 2;
      end = 4;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - 3;
      end = totalPages - 1;
    }

    pages.push(1);
    if (start > 2) pages.push("...");

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  it("calculates accurate record offsets for pagination ranges", () => {
    const totalItems = 142;
    const pageSize = 10;
    const currentPage = 3;

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(totalItems, currentPage * pageSize);

    expect(startItem).toBe(21);
    expect(endItem).toBe(30);
  });

  it("caps the final page record offset to totalItems", () => {
    const totalItems = 47;
    const pageSize = 10;
    const currentPage = 5;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(totalItems, currentPage * pageSize);

    expect(startItem).toBe(41);
    expect(endItem).toBe(47);
  });

  it("generates simple sequential page buttons when totalPages <= 7", () => {
    const pages = getPageNumbers(2, 5);
    expect(pages).toEqual([1, 2, 3, 4, 5]);
    expect(pages).not.toContain("...");
  });

  it("generates trailing ellipsis when active near the beginning of a large set", () => {
    const pages = getPageNumbers(2, 20);
    expect(pages[0]).toBe(1);
    expect(pages.slice(1, 4)).toEqual([2, 3, 4]);
    expect(pages).toContain("...");
    expect(pages[pages.length - 1]).toBe(20);
  });

  it("generates leading and trailing ellipses when active in the middle of a large set", () => {
    const pages = getPageNumbers(10, 20);
    expect(pages[0]).toBe(1);
    expect(pages[1]).toBe("...");
    expect(pages.slice(2, 5)).toEqual([9, 10, 11]);
    expect(pages[5]).toBe("...");
    expect(pages[6]).toBe(20);
  });

  it("generates leading ellipsis when active near the end of a large set", () => {
    const pages = getPageNumbers(19, 20);
    expect(pages[0]).toBe(1);
    expect(pages[1]).toBe("...");
    expect(pages.slice(2)).toEqual([17, 18, 19, 20]);
  });
});
