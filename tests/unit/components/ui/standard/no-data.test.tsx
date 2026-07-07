import { render, screen } from "@testing-library/react";
import { NoData } from "@/components/ui/standard/no-data";

describe("NoData", () => {
  it("renders the default title and the no-data image", () => {
    render(<NoData />);
    expect(screen.getByText("No Data")).toBeInTheDocument();
    expect(screen.getByAltText("no data")).toBeInTheDocument();
  });

  it("renders a custom title and description", () => {
    render(<NoData title="Nothing here" description="Try again later" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("Try again later")).toBeInTheDocument();
  });

  it("omits the description paragraph when not provided", () => {
    const { container } = render(<NoData title="t" />);
    // title + img only -> exactly one <p>
    expect(container.querySelectorAll("p")).toHaveLength(1);
  });

  it("merges custom className", () => {
    render(<NoData className="nd-x" data-testid="nd" />);
    expect(screen.getByTestId("nd")).toHaveClass("nd-x");
  });
});
