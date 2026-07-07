import { fireEvent, render, screen } from "@testing-library/react";
import MultiDimensionalTimeRangePicker from "@/app/models-console/llm-dedicated-endpoints/components/detail/MultiDimensionalTimeRangePicker";

jest.mock("@/components/ui/popover", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const PopoverContext = React.createContext({
    open: false,
    setOpen: (_: boolean) => {},
  });

  return {
    Popover: ({ children, onOpenChange, open }: any) => (
      <PopoverContext.Provider value={{ open, setOpen: onOpenChange }}>
        <div>{children}</div>
      </PopoverContext.Provider>
    ),
    PopoverContent: ({ children }: any) => {
      const { open } = React.useContext(PopoverContext);
      return open ? <div>{children}</div> : null;
    },
    PopoverTrigger: ({ children }: any) => {
      const { open, setOpen } = React.useContext(PopoverContext);
      return React.cloneElement(React.Children.only(children), {
        onClick: (event: React.MouseEvent) => {
          children.props.onClick?.(event);
          setOpen(!open);
        },
      });
    },
  };
});

describe("MultiDimensionalTimeRangePicker", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-15T12:34:56Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("selects preset ranges and closes the picker", () => {
    const onChange = jest.fn();

    render(
      <MultiDimensionalTimeRangePicker
        onChange={onChange}
        value={{
          label: "Last 5 minutes",
          type: "preset",
          value: "5m",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Last 5 minutes/ }));
    fireEvent.click(screen.getByRole("button", { name: "Last 1 hour" }));

    expect(onChange).toHaveBeenCalledWith({
      label: "Last 1 hour",
      type: "preset",
      value: "1h",
    });
    expect(
      screen.queryByRole("button", { name: "Last 1 hour" }),
    ).not.toBeInTheDocument();
  });

  it("builds a custom UTC range from selected days and typed times", () => {
    const onChange = jest.fn();

    render(
      <MultiDimensionalTimeRangePicker
        onChange={onChange}
        value={{
          label: "Last 24 hours",
          type: "preset",
          value: "24h",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Last 24 hours/ }));
    expect(screen.getByText("2026 / 01")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "10" }));
    fireEvent.click(screen.getByRole("button", { name: "12" }));
    fireEvent.change(screen.getByPlaceholderText("00:00:00"), {
      target: { value: "01:02:03" },
    });
    fireEvent.change(screen.getByPlaceholderText("23:59:59"), {
      target: { value: "04:05:06" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onChange).toHaveBeenCalledWith({
      endTime: Date.UTC(2026, 0, 12, 4, 5, 6, 999),
      label: "26/01/10 01:02:03 - 26/01/12 04:05:06",
      startTime: Date.UTC(2026, 0, 10, 1, 2, 3),
      type: "custom",
      value: "custom",
    });
  });

  it("restores custom selections when reopened and defaults today's empty end time to now", () => {
    const onChange = jest.fn();

    render(
      <MultiDimensionalTimeRangePicker
        onChange={onChange}
        value={{
          endTime: Date.UTC(2026, 0, 12, 4, 5, 6, 999),
          label: "custom range",
          startTime: Date.UTC(2026, 0, 10, 1, 2, 3),
          type: "custom",
          value: "custom",
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /custom range/ }));
    expect(screen.getByDisplayValue("01:02:03")).toBeInTheDocument();
    expect(screen.getByDisplayValue("04:05:06")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "15" }));
    fireEvent.click(screen.getByRole("button", { name: "15" }));
    fireEvent.change(screen.getByDisplayValue("01:02:03"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByDisplayValue("04:05:06"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onChange).toHaveBeenCalledWith({
      endTime: Date.UTC(2026, 0, 15, 12, 34, 56, 999),
      label: "26/01/15 00:00:00 - 26/01/15 12:34:56",
      startTime: Date.UTC(2026, 0, 15, 0, 0, 0),
      type: "custom",
      value: "custom",
    });
  });
});
