import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaginationItemProps = {
  type?: "page" | "previous" | "next" | "ellipsis";
  page?: number;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

export function PaginationItem({
  type = "page",
  page,
  selected,
  disabled,
  onClick,
  className,
}: PaginationItemProps) {
  if (type === "ellipsis") {
    return (
      <span className="mx-1 inline-flex h-8 min-w-8 items-center justify-center text-sm text-[var(--dark-3)]">
        ...
      </span>
    );
  }

  const Icon =
    type === "previous" ? ChevronLeft : type === "next" ? ChevronRight : null;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={selected ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "mx-1 inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-[4px] border border-transparent bg-transparent px-2 text-sm leading-none text-[var(--dark-1)] hover:border-[var(--gray-1)] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50",
        Icon &&
          "px-2 text-[#A6A6A6] hover:border-transparent hover:bg-transparent hover:text-[var(--dark-2)]",
        selected &&
          "border-[var(--dark-1)] bg-white hover:border-[var(--dark-1)]",
        className,
      )}
    >
      {Icon ? (
        <Icon className="h-4 w-4" />
      ) : (
        <span className="leading-none">{page}</span>
      )}
    </button>
  );
}

function getPaginationItems(count: number, page: number) {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);

  const items: Array<number | "ellipsis-start" | "ellipsis-end"> = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(count - 1, page + 1);

  if (start > 2) items.push("ellipsis-start");
  for (let item = start; item <= end; item += 1) items.push(item);
  if (end < count - 1) items.push("ellipsis-end");
  items.push(count);
  return items;
}

export function MyPagination({
  count = 1,
  page = 1,
  onChange,
  className,
  style,
  ...props
}: any) {
  const totalPages = Math.max(1, Number(count) || 1);
  const currentPage = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const items = getPaginationItems(totalPages, currentPage);

  return (
    <div
      className={cn("inline-block align-middle", className)}
      style={style}
      {...props}
    >
      <div className="inline-flex shrink-0 flex-nowrap items-center whitespace-nowrap">
        <PaginationItem
          type="previous"
          disabled={currentPage <= 1}
          onClick={(event) => onChange?.(event, currentPage - 1)}
        />
        {items.map((item) =>
          typeof item === "number" ? (
            <PaginationItem
              key={item}
              page={item}
              selected={item === currentPage}
              onClick={(event) => onChange?.(event, item)}
            />
          ) : (
            <PaginationItem key={item} type="ellipsis" />
          ),
        )}
        <PaginationItem
          type="next"
          disabled={currentPage >= totalPages}
          onClick={(event) => onChange?.(event, currentPage + 1)}
        />
      </div>
    </div>
  );
}

export function MyTablePagination({
  rowsPerPage = 10,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50, 100],
  labelRowsPerPage = "Rows per page",
  className,
  style,
  ...props
}: any) {
  return (
    <div
      className={cn("inline-block align-middle text-[var(--black)]", className)}
      style={style}
      {...props}
    >
      <div className="inline-flex h-8 shrink-0 flex-nowrap items-center gap-3 whitespace-nowrap text-sm">
        <span className="whitespace-nowrap font-medium">
          {labelRowsPerPage}
        </span>
        <Select
          value={String(rowsPerPage)}
          onValueChange={(value) =>
            onRowsPerPageChange?.({ target: { value } })
          }
        >
          <SelectTrigger className="h-8 w-[72px] shrink-0 border-0 bg-transparent py-0 pl-3 pr-6 text-sm text-[var(--black)] shadow-none hover:border-transparent focus:border-transparent focus:ring-0 focus:ring-offset-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {rowsPerPageOptions.map((option: number) => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export const MyTopTablePagination = MyTablePagination;
