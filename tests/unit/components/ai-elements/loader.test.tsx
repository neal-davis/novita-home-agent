import { render, screen } from "@testing-library/react";
import { Loader } from "@/components/ai-elements/loader";

describe("Loader", () => {
  it("renders a spinning wrapper with the loader svg", () => {
    const { container } = render(<Loader />);
    expect(container.firstChild).toHaveClass("animate-spin");
    expect(screen.getByTitle("Loader")).toBeInTheDocument();
  });

  it("applies the size prop to the svg", () => {
    render(<Loader size={32} />);
    const svg = screen.getByTitle("Loader").closest("svg");
    expect(svg).toHaveAttribute("width", "32");
    expect(svg).toHaveAttribute("height", "32");
  });

  it("merges custom className", () => {
    const { container } = render(<Loader className="ld-x" />);
    expect(container.firstChild).toHaveClass("ld-x");
  });
});
