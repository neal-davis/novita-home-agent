import { act, fireEvent, render, screen } from "@testing-library/react";
import DateRangePicker from "@/components/ui/standard/date-range-picker";

jest.mock("@/components/ui/popover", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const PopoverContext = React.createContext({ setOpen: (_: boolean) => {} });

  return {
    Popover: ({ children, onOpenChange }: any) => (
      <PopoverContext.Provider value={{ setOpen: onOpenChange }}>
        <div>{children}</div>
      </PopoverContext.Provider>
    ),
    PopoverContent: ({ children }: any) => <div>{children}</div>,
    PopoverTrigger: ({ children, className, style }: any) => {
      const { setOpen } = React.useContext(PopoverContext);
      return (
        <button
          className={className}
          onClick={() => setOpen(true)}
          style={style}
          type="button"
        >
          {children}
        </button>
      );
    },
  };
});

jest.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect, selected }: any) => (
    <div>
      <div data-testid="sel">{selected?.from ? "has-from" : "no-from"}</div>
      <button
        onClick={() =>
          onSelect({ from: new Date(2026, 0, 10), to: new Date(2026, 0, 12) })
        }
        type="button"
      >
        select calendar range
      </button>
      <button onClick={() => onSelect(undefined)} type="button">
        clear calendar range
      </button>
    </div>
  ),
}));

describe("DateRangePicker (local)", () => {
  // Use local-constructed dates so format() output is timezone-stable.
  const start = new Date(2026, 1, 3); // Feb 3 2026 local
  const end = new Date(2026, 1, 5); // Feb 5 2026 local

  it("renders formatted local values and emits the raw calendar range", () => {
    const onChange = jest.fn();

    render(
      <DateRangePicker endTime={end} onChange={onChange} startTime={start} />,
    );

    expect(screen.getByDisplayValue("02/03/2026")).toBeInTheDocument();
    expect(screen.getByDisplayValue("02/05/2026")).toBeInTheDocument();

    fireEvent.click(screen.getByText("select calendar range"));
    expect(onChange).toHaveBeenCalledWith({
      from: new Date(2026, 0, 10),
      to: new Date(2026, 0, 12),
    });

    fireEvent.click(screen.getByText("clear calendar range"));
    expect(onChange).toHaveBeenLastCalledWith({
      from: undefined,
      to: undefined,
    });
  });

  it("shows the empty prompt and opens inputs from the empty state", () => {
    const onChange = jest.fn();

    render(
      <DateRangePicker
        allowEmpty
        endTime={undefined}
        onChange={onChange}
        startTime={undefined}
      />,
    );

    expect(screen.getByText("Pick a Date")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Pick a Date"));
    expect(screen.getByPlaceholderText("Start Date")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("End Date")).toBeInTheDocument();
  });

  it("debounces a valid typed start date and falls back on invalid input", () => {
    jest.useFakeTimers();
    const onChange = jest.fn();

    render(
      <DateRangePicker
        dateFormat="MM/dd/yyyy"
        endTime={end}
        onChange={onChange}
        startTime={start}
      />,
    );

    const startInput = screen.getByDisplayValue("02/03/2026");
    fireEvent.change(startInput, { target: { value: "06/01/2026" } });
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 5, 1),
      to: end,
    });

    const endInput = screen.getByDisplayValue("02/05/2026");
    fireEvent.change(endInput, { target: { value: "garbage" } });
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(onChange).toHaveBeenLastCalledWith({ from: start, to: end });

    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("emits ranges for each quick-select shortcut", () => {
    const onChange = jest.fn();

    render(
      <DateRangePicker
        endTime={undefined}
        onChange={onChange}
        quickSelectList={[
          "today",
          "past7days",
          "lastweek",
          "lastmonth",
          "thisweek",
          "thismonth",
        ]}
        startTime={undefined}
      />,
    );

    for (const label of [
      "Today",
      "Past 7 Days",
      "Last Week",
      "Last Month",
      "This Week",
      "This Month",
    ]) {
      fireEvent.click(screen.getByText(label));
    }

    expect(onChange).toHaveBeenCalledTimes(6);
    // every call provides a from/to range
    for (const call of onChange.mock.calls) {
      expect(call[0].from).toBeInstanceOf(Date);
      expect(call[0].to).toBeInstanceOf(Date);
    }
  });

  it("falls back to the default quick-select list when none is provided", () => {
    const onChange = jest.fn();

    render(
      <DateRangePicker
        endTime={undefined}
        onChange={onChange}
        startTime={undefined}
      />,
    );

    // default list includes all six shortcuts
    expect(screen.getByText("This Month")).toBeInTheDocument();
    fireEvent.click(screen.getByText("This Month"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
