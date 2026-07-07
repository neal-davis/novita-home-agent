import { act, fireEvent, render, screen } from "@testing-library/react";
import DateRangePicker from "@/components/ui/standard/date-range-picker-utc";

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

jest.mock("@/components/ui/calendar-utc", () => ({
  Calendar: ({ disabled, onSelect, selected, today }: any) => (
    <div>
      <div>today {today?.toISOString()}</div>
      <div>
        selected {selected?.from?.toISOString()} {selected?.to?.toISOString()}
      </div>
      <div>disabled {disabled ? "yes" : "no"}</div>
      <button
        onClick={() =>
          onSelect({
            from: new Date(2026, 0, 10),
            to: new Date(2026, 0, 12),
          })
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

describe("DateRangePicker UTC", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-15T12:34:56Z"));
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders formatted UTC values and converts calendar selections to UTC day boundaries", () => {
    const onChange = jest.fn();

    render(
      <DateRangePicker
        disabled={{ before: new Date("2026-01-01T00:00:00Z") }}
        endTime={new Date("2026-02-05T18:30:00Z")}
        onChange={onChange}
        startTime={new Date("2026-02-03T14:30:00Z")}
      />,
    );

    expect(screen.getByDisplayValue("02/03/2026")).toBeInTheDocument();
    expect(screen.getByDisplayValue("02/05/2026")).toBeInTheDocument();
    expect(screen.getByText(/today/)).toBeInTheDocument();
    expect(screen.getByText(/disabled/)).toHaveTextContent("disabled yes");

    fireEvent.click(screen.getByText("select calendar range"));
    expect(onChange).toHaveBeenCalledWith({
      from: new Date("2026-01-10T00:00:00.000Z"),
      to: new Date("2026-01-12T00:00:00.000Z"),
    });

    fireEvent.click(screen.getByText("clear calendar range"));
    expect(onChange).toHaveBeenCalledWith({
      from: undefined,
      to: undefined,
    });
  });

  it("supports quick-select ranges using the current UTC day", () => {
    const onChange = jest.fn();

    render(
      <DateRangePicker
        endTime={undefined}
        onChange={onChange}
        quickSelectList={["today", "past7days", "lastweek", "lastmonth"]}
        startTime={undefined}
      />,
    );

    expect(screen.getByText("Pick a Date")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Today"));
    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date("2026-06-15T00:00:00.000Z"),
      to: new Date("2026-06-15T00:00:00.000Z"),
    });

    fireEvent.click(screen.getByText("Past 7 Days"));
    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date("2026-06-09T00:00:00.000Z"),
      to: new Date("2026-06-15T00:00:00.000Z"),
    });

    fireEvent.click(screen.getByText("Last Week"));
    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date("2026-06-08T00:00:00.000Z"),
      to: new Date("2026-06-14T00:00:00.000Z"),
    });

    fireEvent.click(screen.getByText("Last Month"));
    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date("2026-05-01T00:00:00.000Z"),
      to: new Date("2026-05-31T00:00:00.000Z"),
    });
  });

  it("debounces typed dates and falls back to the existing range for invalid input", () => {
    const onChange = jest.fn();

    render(
      <DateRangePicker
        dateFormat="MM/dd/yyyy"
        endTime={new Date("2026-02-05T00:00:00Z")}
        onChange={onChange}
        startTime={new Date("2026-02-03T00:00:00Z")}
      />,
    );

    const startInput = screen.getByDisplayValue("02/03/2026");
    const endInput = screen.getByDisplayValue("02/05/2026");

    fireEvent.change(startInput, { target: { value: "06/01/2026" } });
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date("2026-06-01T00:00:00.000Z"),
      to: new Date("2026-02-05T00:00:00.000Z"),
    });

    fireEvent.change(endInput, { target: { value: "not-a-date" } });
    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(onChange).toHaveBeenLastCalledWith({
      from: new Date("2026-02-03T00:00:00.000Z"),
      to: new Date("2026-02-05T00:00:00.000Z"),
    });
  });

  it("opens the input controls from the empty state when empty values are allowed", () => {
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
});
