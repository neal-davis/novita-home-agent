"use client";

import { useState, useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLabel,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type StandardPaginationProps = {
  className?: string;
  total: number;
  pageSize?: number;
  defaultCurrent: number;
  onChange: (page: number) => void;
  align?: "start" | "center" | "end";
  customButtonStyle?: boolean;
};

const StandardPagination = ({
  className,
  total,
  pageSize = 10,
  defaultCurrent,
  onChange,
  align = "end",
  customButtonStyle = false,
}: StandardPaginationProps) => {
  const [currentPage, setCurrentPage] = useState(defaultCurrent);

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onChange(page);
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1);
        pages.push(2);
        pages.push(3);
        pages.push(4);
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("ellipsis");
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1);
        pages.push("ellipsis");
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <Pagination className={`${className || "mt-4"} justify-${align}`}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            size="sl"
            className={
              customButtonStyle
                ? "h-8 text-[#000] !font-medium"
                : "h-8 text-[var(--dark-1)]"
            }
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) handlePageChange(currentPage - 1);
            }}
          />
        </PaginationItem>

        {pageNumbers.map((pageNum, index) => (
          <PaginationItem className="w-8 h-8" key={index}>
            {pageNum === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLabel
                isActive={pageNum === currentPage}
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(pageNum as number);
                }}
              >
                {pageNum}
              </PaginationLabel>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            size="sl"
            className={
              customButtonStyle
                ? "h-8 text-[#000]  !font-medium"
                : "h-8 text-[var(--dark-1)]"
            }
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) handlePageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
StandardPagination.displayName = "StandardPagination";

export default StandardPagination;
