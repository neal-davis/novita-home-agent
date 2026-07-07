import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import DateToggleGroup from "@/app/billing/billing-details/components/DateToggleGroup";

jest.mock("@/components/ui/toggle-group", () => ({
  ToggleGroup: ({ children, value, onValueChange }: any) => (
    <div data-testid="toggle-group" data-value={value}>
      <button type="button" onClick={() => onValueChange("Week")}>
        set week
      </button>
      <button type="button" onClick={() => onValueChange("")}>
        set empty
      </button>
      {children}
    </div>
  ),
  ToggleGroupItem: ({ children, value }: any) => (
    <button type="button" data-value={value}>
      {children}
    </button>
  ),
}));

const options = [
  { value: "Hour", label: "Hour" },
  { value: "Day", label: "Day" },
  { value: "Week", label: "Week" },
];

describe("DateToggleGroup", () => {
  it("renders all options and defaults the value to the selected prop", () => {
    render(
      <DateToggleGroup
        options={options}
        selected="Day"
        onCycleChange={jest.fn()}
      />,
    );

    expect(screen.getByText("Hour")).toBeInTheDocument();
    expect(screen.getByText("Day")).toBeInTheDocument();
    expect(screen.getByText("Week")).toBeInTheDocument();
    expect(screen.getByTestId("toggle-group")).toHaveAttribute(
      "data-value",
      "Day",
    );
  });

  it("falls back to the first option when no selection is provided", () => {
    render(<DateToggleGroup options={options} onCycleChange={jest.fn()} />);

    expect(screen.getByTestId("toggle-group")).toHaveAttribute(
      "data-value",
      "Hour",
    );
  });

  it("calls onCycleChange and updates value for a non-empty change", () => {
    const onCycleChange = jest.fn();
    render(
      <DateToggleGroup
        options={options}
        selected="Day"
        onCycleChange={onCycleChange}
      />,
    );

    fireEvent.click(screen.getByText("set week"));
    expect(onCycleChange).toHaveBeenCalledWith("Week");
    expect(screen.getByTestId("toggle-group")).toHaveAttribute(
      "data-value",
      "Week",
    );
  });

  it("ignores empty value changes", () => {
    const onCycleChange = jest.fn();
    render(
      <DateToggleGroup
        options={options}
        selected="Day"
        onCycleChange={onCycleChange}
      />,
    );

    fireEvent.click(screen.getByText("set empty"));
    expect(onCycleChange).not.toHaveBeenCalled();
  });
});
