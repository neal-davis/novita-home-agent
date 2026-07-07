import { render, screen } from "@testing-library/react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationLabel,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

describe("Pagination", () => {
  it("renders a navigation landmark", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    expect(
      screen.getByRole("navigation", { name: "pagination" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("marks an active link with aria-current", () => {
    render(
      <PaginationLink href="#" isActive>
        2
      </PaginationLink>,
    );
    expect(screen.getByText("2")).toHaveAttribute("aria-current", "page");
  });

  it("does not set aria-current when inactive", () => {
    render(<PaginationLink href="#">3</PaginationLink>);
    expect(screen.getByText("3")).not.toHaveAttribute("aria-current");
  });

  it("PaginationLabel reflects active state", () => {
    render(<PaginationLabel isActive>5</PaginationLabel>);
    expect(screen.getByText("5")).toHaveAttribute("aria-current", "page");
  });

  it("renders previous and next controls with labels", () => {
    render(
      <>
        <PaginationPrevious href="#" />
        <PaginationNext href="#" />
      </>,
    );
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByLabelText("Go to previous page")).toBeInTheDocument();
  });

  it("renders the ellipsis with screen-reader text", () => {
    render(<PaginationEllipsis />);
    expect(screen.getByText("More pages")).toBeInTheDocument();
  });
});
