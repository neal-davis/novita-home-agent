import { fireEvent, render, screen } from "@testing-library/react";
import StandardPagination from "@/components/ui/standard/pagination-control";

describe("StandardPagination (pagination-control)", () => {
  it("renders one label per page when total pages <= 5", () => {
    render(
      <StandardPagination
        total={30}
        pageSize={10}
        defaultCurrent={1}
        onChange={jest.fn()}
      />,
    );
    // 3 pages
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.queryByText("4")).not.toBeInTheDocument();
  });

  it("marks the current page active", () => {
    render(
      <StandardPagination
        total={30}
        pageSize={10}
        defaultCurrent={2}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText("2")).toHaveAttribute("aria-current", "page");
  });

  it("calls onChange with the clicked page", () => {
    const onChange = jest.fn();
    render(
      <StandardPagination
        total={30}
        pageSize={10}
        defaultCurrent={1}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText("3"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("advances via the Next control", () => {
    const onChange = jest.fn();
    render(
      <StandardPagination
        total={30}
        pageSize={10}
        defaultCurrent={1}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText("Next"));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("does not go below page 1 on Previous", () => {
    const onChange = jest.fn();
    render(
      <StandardPagination
        total={30}
        pageSize={10}
        defaultCurrent={1}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText("Previous"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders an ellipsis when there are many pages and current is at start", () => {
    render(
      <StandardPagination
        total={100}
        pageSize={10}
        defaultCurrent={1}
        onChange={jest.fn()}
      />,
    );
    // pages: 1 2 3 4 ... 10
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText("5")).not.toBeInTheDocument();
  });

  it("renders middle ellipses when current is in the middle", () => {
    render(
      <StandardPagination
        total={100}
        pageSize={10}
        defaultCurrent={5}
        onChange={jest.fn()}
      />,
    );
    // pages: 1 ... 4 5 6 ... 10
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders the tail window when current is near the end", () => {
    render(
      <StandardPagination
        total={100}
        pageSize={10}
        defaultCurrent={9}
        onChange={jest.fn()}
      />,
    );
    // pages: 1 ... 7 8 9 10
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("resets current page when defaultCurrent prop changes", () => {
    const { rerender } = render(
      <StandardPagination
        total={100}
        pageSize={10}
        defaultCurrent={2}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText("2")).toHaveAttribute("aria-current", "page");
    rerender(
      <StandardPagination
        total={100}
        pageSize={10}
        defaultCurrent={5}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText("5")).toHaveAttribute("aria-current", "page");
  });
});
