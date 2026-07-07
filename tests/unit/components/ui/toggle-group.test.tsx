import { render, screen } from "@testing-library/react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

describe("ToggleGroup", () => {
  it("renders items and the selected value's state", () => {
    render(
      <ToggleGroup type="single" value="b">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    const b = screen.getByText("B").closest("button");
    expect(b).toHaveAttribute("data-state", "on");
  });

  it("passes variant/size context down to items", () => {
    render(
      <ToggleGroup type="single" variant="outline" size="lg">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const item = screen.getByText("A").closest("button");
    expect(item).toHaveClass("border");
    expect(item).toHaveClass("h-11");
  });

  it("merges className on root", () => {
    render(
      <ToggleGroup type="single" className="tg-root" data-testid="root">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(screen.getByTestId("root")).toHaveClass("tg-root");
  });
});
