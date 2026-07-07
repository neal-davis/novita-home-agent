import { render, screen } from "@testing-library/react";
import { ConsoleModelBadge } from "@/app/models-console/library/components/ConsoleModelBadge";

describe("ConsoleModelBadge", () => {
  it("uses the paragraph-12 design token with miletus for top-right status tags", () => {
    render(<ConsoleModelBadge badge={{ label: "New", kind: "new" }} />);

    expect(screen.getByText("New")).toHaveClass("font-miletus");
    expect(screen.getByText("New")).toHaveClass("text-paragraph-12");
    expect(screen.getByText("New")).not.toHaveClass("text-[12px]");
  });
});
