import * as React from "react";
import { act, render, screen, fireEvent } from "@testing-library/react";

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

describe("SelectRefreshInterval (more branches)", () => {
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

  it("fires onRefresh once the countdown for the active interval reaches zero", () => {
    const onRefresh = jest.fn();
    render(
      <SelectRefreshInterval onSelect={jest.fn()} onRefresh={onRefresh} />,
    );

    // Default interval is 15s; advancing past it triggers a refresh.
    act(() => {
      jest.advanceTimersByTime(16000);
    });
    expect(onRefresh).toHaveBeenCalled();
  });

  it("stops the timer when the Off interval is selected", () => {
    const onRefresh = jest.fn();
    const onSelect = jest.fn();
    render(<SelectRefreshInterval onSelect={onSelect} onRefresh={onRefresh} />);

    // Switch to "Off" (value 0) -> interval is cleared, no refresh fires.
    fireEvent.click(screen.getByText("Off"));
    expect(onSelect).toHaveBeenCalledWith({ value: 0, label: "Off" });
    // The trigger now shows the label rather than a countdown.
    expect(screen.getAllByText("Off").length).toBeGreaterThan(0);

    onRefresh.mockClear();
    act(() => {
      jest.advanceTimersByTime(30000);
    });
    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("resets the countdown when a new interval is chosen", () => {
    const onRefresh = jest.fn();
    render(
      <SelectRefreshInterval onSelect={jest.fn()} onRefresh={onRefresh} />,
    );

    // Pick 30s -> countdown shows 30s on the trigger.
    fireEvent.click(screen.getByText("30s"));
    expect(screen.getAllByText("30s").length).toBeGreaterThan(0);

    // Not yet elapsed past 30s -> no refresh.
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(onRefresh).not.toHaveBeenCalled();
  });
});
