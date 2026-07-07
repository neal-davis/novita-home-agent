import * as React from "react";
import { render, screen } from "@testing-library/react";

import { ConsoleButtonDefault } from "@/app/user/components/console-button-default";

describe("ConsoleButtonDefault", () => {
  it("renders children and applies a custom class", () => {
    render(<ConsoleButtonDefault className="extra">Go</ConsoleButtonDefault>);
    const btn = screen.getByText("Go").closest("button")!;
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain("extra");
  });
});
