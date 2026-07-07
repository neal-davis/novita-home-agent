import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/components/ui/toggle-group", () => ({
  ToggleGroup: ({ children, onValueChange }: any) => (
    <div>
      <button data-testid="set-day" onClick={() => onValueChange("day")}>
        set-day
      </button>
      <button data-testid="set-empty" onClick={() => onValueChange("")}>
        set-empty
      </button>
      {children}
    </div>
  ),
  ToggleGroupItem: ({ children, value }: any) => (
    <button data-value={value}>{children}</button>
  ),
}));

import DateToggleGroup from "@/app/sandbox-console/view/DateToggleGroup";

const options = [
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
];

describe("DateToggleGroup", () => {
  it("renders an item per option", () => {
    render(<DateToggleGroup options={options} onCycleChange={jest.fn()} />);
    expect(screen.getByText("Hour")).toBeInTheDocument();
    expect(screen.getByText("Day")).toBeInTheDocument();
  });

  it("propagates a selected value", () => {
    const onCycleChange = jest.fn();
    render(<DateToggleGroup options={options} onCycleChange={onCycleChange} />);
    fireEvent.click(screen.getByTestId("set-day"));
    expect(onCycleChange).toHaveBeenCalledWith("day");
  });

  it("falls back to '0' when the toggle is cleared", () => {
    const onCycleChange = jest.fn();
    render(<DateToggleGroup options={options} onCycleChange={onCycleChange} />);
    fireEvent.click(screen.getByTestId("set-empty"));
    expect(onCycleChange).toHaveBeenCalledWith("0");
  });
});
