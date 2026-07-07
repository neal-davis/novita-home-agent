import { render, screen } from "@testing-library/react";
import { ScrollArea } from "@/components/ui/scroll-area";

describe("ScrollArea", () => {
  it("renders children inside the viewport", () => {
    render(
      <ScrollArea data-testid="sa">
        <div>Scrollable content</div>
      </ScrollArea>,
    );
    expect(screen.getByText("Scrollable content")).toBeInTheDocument();
    expect(screen.getByTestId("sa")).toHaveClass("overflow-hidden");
  });

  it("merges custom className on the root", () => {
    render(
      <ScrollArea className="sa-x" data-testid="sa2">
        <div>x</div>
      </ScrollArea>,
    );
    expect(screen.getByTestId("sa2")).toHaveClass("sa-x");
  });

  it("forwards arbitrary props to the root", () => {
    render(
      <ScrollArea data-testid="sa3" id="my-area">
        <div>x</div>
      </ScrollArea>,
    );
    expect(screen.getByTestId("sa3")).toHaveAttribute("id", "my-area");
  });
});
