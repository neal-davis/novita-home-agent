import { fireEvent, render, screen } from "@testing-library/react";
import { SelectFilter } from "@/components/ui/standard/selectFilter";

jest.mock("lucide-react", () => ({
  ChevronDown: () => <span data-testid="chevron" />,
  CircleX: () => <span data-testid="clear-icon" />,
  SearchIcon: ({ className }: any) => (
    <span className={className} data-testid="search-icon" />
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: jest
    .requireActual<typeof import("react")>("react")
    .forwardRef<
      HTMLInputElement,
      any
    >(({ autoComplete, className, containerClassName, onBlur, onChange, onClick, onFocus, onKeyDown, onPointerDown, placeholder, value }, ref) => <input autoComplete={autoComplete} className={className} data-container-class={containerClassName} onBlur={onBlur} onChange={(event) => onChange?.(event)} onClick={onClick} onFocus={onFocus} onKeyDown={onKeyDown} onPointerDown={onPointerDown} placeholder={placeholder} ref={ref} value={value} />),
}));

jest.mock("@/components/ui/select", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const SelectContext = React.createContext({
    disabled: false,
    onOpenChange: (_: boolean) => {},
    onValueChange: (_: string) => {},
    open: false,
  });
  const SelectContent = React.forwardRef<HTMLDivElement, any>(
    ({ children, className, disableScrollButton, topSlot }, ref) => {
      const { open } = React.useContext(SelectContext);
      if (!open) return null;
      return (
        <div
          className={className}
          data-disable-scroll={String(disableScrollButton)}
          ref={ref}
        >
          {topSlot}
          {children}
        </div>
      );
    },
  );
  SelectContent.displayName = "MockSelectContent";

  const SelectTrigger = React.forwardRef<HTMLButtonElement, any>(
    ({ children, className, icon }, ref) => {
      const { disabled, onOpenChange, open } = React.useContext(SelectContext);
      return (
        <button
          className={className}
          disabled={disabled}
          onClick={() => onOpenChange(!open)}
          ref={ref}
          type="button"
        >
          {children}
          {icon}
        </button>
      );
    },
  );
  SelectTrigger.displayName = "MockSelectTrigger";

  return {
    Select: ({
      children,
      disabled,
      onOpenChange,
      onValueChange,
      open,
    }: any) => (
      <SelectContext.Provider
        value={{
          disabled: Boolean(disabled),
          onOpenChange,
          onValueChange,
          open,
        }}
      >
        <div data-open={open}>{children}</div>
      </SelectContext.Provider>
    ),
    SelectContent,
    SelectItem: ({
      children,
      checkPosition,
      className,
      hideCheck,
      onPointerDown,
      onPointerMove,
      value,
    }: any) => {
      const { onValueChange } = React.useContext(SelectContext);
      return (
        <button
          className={className}
          data-check-position={checkPosition}
          data-hide-check={String(Boolean(hideCheck))}
          onClick={() => onValueChange(value)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          type="button"
        >
          {children}
        </button>
      );
    },
    SelectTrigger,
    SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  };
});

const options = [
  { id: "a", label: "Alpha", tags: ["first", "one"] },
  { id: "b", label: "Beta", tags: ["second", "two"] },
  { id: "c", label: null, tags: [null, "blank"] },
];

function renderSelectFilter(
  overrides: Partial<
    React.ComponentProps<typeof SelectFilter<(typeof options)[number]>>
  > = {},
) {
  const onValueChange = jest.fn();
  const onClear = jest.fn();
  render(
    <SelectFilter
      getOptionLabel={(option) => option.label}
      getOptionSearchText={(option) => option.tags}
      getOptionValue={(option) => option.id}
      onValueChange={onValueChange}
      options={options}
      placeholder="Choose option"
      {...overrides}
    />,
  );
  return { onClear, onValueChange };
}

beforeEach(() => {
  jest.clearAllMocks();
  global.requestAnimationFrame = jest.fn((callback) => {
    callback(0);
    return 1;
  });
});

describe("SelectFilter", () => {
  it("renders placeholder, opens with searchable options, filters by custom search text, and selects a value", () => {
    const { onValueChange } = renderSelectFilter();

    expect(screen.getByText("Choose option")).toBeInTheDocument();
    expect(screen.getByTestId("chevron")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Choose option/i }));
    expect(screen.getByPlaceholderText("Search...")).toHaveAttribute(
      "autocomplete",
      "off",
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search..."), {
      target: { value: "second" },
    });
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Beta"));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(screen.getByPlaceholderText("Search...")).toHaveValue("");
  });

  it("renders selected custom content, clear action, and custom empty text", () => {
    const onClear = jest.fn();
    renderSelectFilter({
      allowClear: true,
      clearAriaLabel: "Remove selected option",
      emptyText: <span>No options</span>,
      onClear,
      renderOption: (option) => <span>row {option.label ?? "Empty"}</span>,
      renderTrigger: (option) => <strong>selected {option?.id}</strong>,
      value: "a",
    });

    expect(screen.getByText("selected a")).toBeInTheDocument();
    fireEvent.pointerDown(
      screen.getByRole("button", { name: "Remove selected option" }),
    );
    expect(onClear).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /selected a/i }));
    fireEvent.change(screen.getByPlaceholderText("Search..."), {
      target: { value: "missing" },
    });
    expect(screen.getByText("No options")).toBeInTheDocument();
  });

  it("uses default clear value, closes on outside pointer down, and respects disabled state", () => {
    const { onValueChange } = renderSelectFilter({
      allowClear: true,
      value: "b",
    });

    fireEvent.pointerDown(
      screen.getByRole("button", { name: "Clear selection" }),
    );
    expect(onValueChange).toHaveBeenCalledWith("");

    fireEvent.click(screen.getByRole("button", { name: /Beta/i }));
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();

    renderSelectFilter({
      disabled: true,
      value: "a",
    });
    const disabledTrigger = screen
      .getAllByRole("button", { name: /Alpha/i })
      .at(-1);
    expect(disabledTrigger).toBeDisabled();
  });

  it("passes customization props to search and item slots and can hide search", () => {
    renderSelectFilter({
      contentClassName: "custom-content",
      disableScrollButton: false,
      inputPlaceholder: "Find model",
      itemCheckPosition: "left",
      itemClassName: "custom-item",
      itemHideCheck: true,
      searchIconClassName: "custom-search-icon",
      searchInputClassName: "custom-search-input",
      searchInputWrapClassName: "custom-input-wrap",
      searchContainerClassName: "custom-search-row",
      triggerClassName: "custom-trigger",
      triggerIcon: <span data-testid="custom-icon" />,
      useDefaultSearchContainerClassName: false,
    });

    fireEvent.click(screen.getByRole("button", { name: /Choose option/i }));
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Find model")).toHaveClass(
      "custom-search-input",
    );
    expect(screen.getByTestId("search-icon")).toHaveClass("custom-search-icon");
    expect(screen.getByText("Alpha")).toHaveClass("custom-item");
    expect(screen.getByText("Alpha")).toHaveAttribute(
      "data-check-position",
      "left",
    );
    expect(screen.getByText("Alpha")).toHaveAttribute(
      "data-hide-check",
      "true",
    );
    expect(screen.getByText("Alpha").parentElement).toHaveAttribute(
      "data-disable-scroll",
      "false",
    );

    renderSelectFilter({ showSearch: false });
    fireEvent.click(
      screen
        .getAllByRole("button", { name: /Choose option/i })
        .at(-1) as Element,
    );
    expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument();
  });
});
