import { render, screen } from "@testing-library/react";
import { Toggle, toggleVariants } from "@/components/ui/toggle";

describe("Toggle", () => {
  it("renders a button with off state by default", () => {
    render(<Toggle aria-label="bold">B</Toggle>);
    const btn = screen.getByRole("button", { name: "bold" });
    expect(btn).toHaveAttribute("data-state", "off");
    expect(btn).toHaveTextContent("B");
  });

  it("reflects pressed state", () => {
    render(
      <Toggle aria-label="bold" pressed>
        B
      </Toggle>,
    );
    expect(screen.getByRole("button", { name: "bold" })).toHaveAttribute(
      "data-state",
      "on",
    );
  });

  it("applies outline variant + size via toggleVariants", () => {
    expect(toggleVariants({ variant: "outline", size: "lg" })).toContain(
      "border",
    );
    expect(toggleVariants({ size: "lg" })).toContain("h-11");
  });

  it("merges className through variants", () => {
    render(
      <Toggle aria-label="t" className="tg-x">
        x
      </Toggle>,
    );
    expect(screen.getByRole("button", { name: "t" })).toHaveClass("tg-x");
  });
});
