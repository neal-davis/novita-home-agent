import { render, screen } from "@testing-library/react";
import Alert from "@/components/ui/standard/alert";

describe("standard Alert", () => {
  it("renders the title and content paragraphs", () => {
    render(<Alert title="Heads up" content={["Line one", "Line two"]} />);
    expect(screen.getByText("Heads up")).toBeInTheDocument();
    expect(screen.getByText("Line one")).toBeInTheDocument();
    expect(screen.getByText("Line two")).toBeInTheDocument();
  });

  it("omits the title heading when title is empty", () => {
    const { container } = render(<Alert title="" content={["Only body"]} />);
    expect(container.querySelector("h2")).not.toBeInTheDocument();
    expect(screen.getByText("Only body")).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(
      <Alert title="t" content={["c"]} className="alert-x" />,
    );
    expect(container.firstChild).toHaveClass("alert-x");
  });
});
