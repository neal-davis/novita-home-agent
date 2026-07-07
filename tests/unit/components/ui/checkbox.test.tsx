import { fireEvent, render, screen } from "@testing-library/react";
import { Checkbox } from "@/components/ui/checkbox";

describe("Checkbox", () => {
  it("renders an unchecked checkbox by default", () => {
    render(<Checkbox aria-label="agree" />);
    const cb = screen.getByRole("checkbox", { name: "agree" });
    expect(cb).toHaveAttribute("data-state", "unchecked");
  });

  it("fires onCheckedChange and reflects checked state on click", () => {
    const onCheckedChange = jest.fn();
    render(<Checkbox aria-label="agree" onCheckedChange={onCheckedChange} />);
    const cb = screen.getByRole("checkbox", { name: "agree" });
    fireEvent.click(cb);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("renders controlled checked state", () => {
    render(<Checkbox aria-label="agree" checked />);
    expect(screen.getByRole("checkbox", { name: "agree" })).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("respects disabled and merges className", () => {
    render(<Checkbox aria-label="agree" disabled className="cb-x" />);
    const cb = screen.getByRole("checkbox", { name: "agree" });
    expect(cb).toBeDisabled();
    expect(cb).toHaveClass("cb-x");
  });
});
