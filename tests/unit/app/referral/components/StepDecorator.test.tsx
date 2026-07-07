import * as React from "react";
import { render, screen } from "@testing-library/react";
import StepDecorator from "@/app/referral/components/StepDecorator";

describe("referral StepDecorator", () => {
  it("renders the step number", () => {
    render(<StepDecorator step={2} active={false} completed={false} />);
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders for active and completed states without crashing", () => {
    const { rerender } = render(
      <StepDecorator step={1} active={true} completed={false} />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    rerender(<StepDecorator step={3} active={false} completed={true} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
