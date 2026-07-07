import * as React from "react";
import { render, screen } from "@testing-library/react";

import { ConsoleButton } from "@/app/user/components/console-button";

describe("ConsoleButton", () => {
  it("renders children and applies a custom class", () => {
    render(<ConsoleButton className="extra">Go</ConsoleButton>);
    const btn = screen.getByText("Go").closest("button")!;
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain("extra");
  });
});
