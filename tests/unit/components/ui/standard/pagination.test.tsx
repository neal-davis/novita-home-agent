import { fireEvent, render, screen } from "@testing-library/react";
import StandardPagination from "@/components/ui/standard/pagination";

describe("StandardPagination (pagination)", () => {
  it("renders all page labels when total pages <= 5", () => {
    render(
      <StandardPagination
        total={20}
        pageSize={10}
        defaultCurrent={1}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });

  it("marks the current page active and fires onChange on label click", () => {
    const onChange = jest.fn();
    render(
      <StandardPagination
        total={50}
        pageSize={10}
        defaultCurrent={1}
        onChange={onChange}
      />,
    );
    expect(screen.getByText("1")).toHaveAttribute("aria-current", "page");
    fireEvent.click(screen.getByText("4"));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("does not advance past the last page on Next", () => {
    const onChange = jest.fn();
    render(
      <StandardPagination
        total={20}
        pageSize={10}
        defaultCurrent={2}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText("Next"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("goes to the previous page", () => {
    const onChange = jest.fn();
    render(
      <StandardPagination
        total={50}
        pageSize={10}
        defaultCurrent={3}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByText("Previous"));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("renders ellipsis and the last page for many pages", () => {
    render(
      <StandardPagination
        total={100}
        pageSize={10}
        defaultCurrent={1}
        onChange={jest.fn()}
      />,
    );
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders the near-end window when current is close to the last page", () => {
    render(
      <StandardPagination
        total={100}
        pageSize={10}
        defaultCurrent={9}
        onChange={jest.fn()}
      />,
    );
    // window: 1 … 7 8 9 10
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("9")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("10")).toBeInTheDocument();
    // not in window
    expect(screen.queryByText("5")).not.toBeInTheDocument();
  });

  it("renders a centered window with two ellipses for a middle page", () => {
    render(
      <StandardPagination
        total={100}
        pageSize={10}
        defaultCurrent={5}
        onChange={jest.fn()}
      />,
    );
    // window: 1 … 4 5 6 … 10
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("5")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
    expect(screen.queryByText("8")).not.toBeInTheDocument();
  });

  it("applies custom button styling when requested", () => {
    render(
      <StandardPagination
        total={50}
        pageSize={10}
        defaultCurrent={2}
        onChange={jest.fn()}
        align="center"
        customButtonStyle
      />,
    );
    // navigation controls still render with the alternate style branch
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });
});
