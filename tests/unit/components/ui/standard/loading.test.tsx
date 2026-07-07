import { render, screen } from "@testing-library/react";
import Loading from "@/components/ui/standard/loading";

describe("Loading", () => {
  it("renders a spinner overlay", () => {
    const { container } = render(<Loading />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders children below the spinner", () => {
    render(<Loading>Please wait</Loading>);
    expect(screen.getByText("Please wait")).toBeInTheDocument();
  });

  it("merges custom className on the overlay", () => {
    const { container } = render(<Loading className="loading-x" />);
    expect(container.firstChild).toHaveClass("loading-x");
  });
});
