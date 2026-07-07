import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

jest.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/ui/command", () => ({
  Command: ({ children }: any) => <div>{children}</div>,
  CommandList: ({ children }: any) => <div>{children}</div>,
  CommandGroup: ({ children }: any) => <div>{children}</div>,
  CommandItem: ({ children, onSelect }: any) => (
    <button onClick={onSelect}>{children}</button>
  ),
}));

import SelectRefreshInterval from "@/app/sandbox-console/view/selectRefreshInterval";

describe("SelectRefreshInterval", () => {
  let logSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.useFakeTimers();
    logSpy = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    logSpy.mockRestore();
  });

  it("renders the auto-refresh label and interval options", () => {
    render(
      <SelectRefreshInterval onSelect={jest.fn()} onRefresh={jest.fn()} />,
    );
    expect(screen.getByText("Auto-refresh")).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument();
    expect(screen.getByText("30s")).toBeInTheDocument();
    expect(screen.getByText("1m")).toBeInTheDocument();
  });

  it("invokes onSelect with the chosen interval", () => {
    const onSelect = jest.fn();
    render(<SelectRefreshInterval onSelect={onSelect} onRefresh={jest.fn()} />);
    fireEvent.click(screen.getByText("Off"));
    expect(onSelect).toHaveBeenCalledWith({ value: 0, label: "Off" });
  });
});
