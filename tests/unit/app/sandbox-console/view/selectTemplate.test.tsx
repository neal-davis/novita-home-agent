import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SelectTemplate from "@/app/sandbox-console/view/selectTemplate";
import { reqSandboxTemplateList } from "@/api/sandbox";

jest.mock("@/api/sandbox", () => ({
  reqSandboxTemplateList: jest.fn(),
}));

// Run the debounced search synchronously
jest.mock("lodash/debounce", () => (fn: (...args: unknown[]) => unknown) => {
  const wrapped = (...args: unknown[]) => fn(...args);
  return wrapped;
});

jest.mock("@/components/ui/popover", () => ({
  Popover: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (v: boolean) => void;
  }) => (
    <div data-testid="popover" data-open={open}>
      <button type="button" onClick={() => onOpenChange(!open)}>
        toggle-popover
      </button>
      {children}
    </div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
  PopoverContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-content">{children}</div>
  ),
}));

jest.mock("@/components/ui/command", () => ({
  Command: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CommandList: ({
    children,
    onScroll,
  }: {
    children: React.ReactNode;
    onScroll?: (e: unknown) => void;
  }) => (
    <div data-testid="command-list" onScroll={onScroll}>
      {children}
    </div>
  ),
  CommandEmpty: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CommandGroup: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  CommandItem: ({
    children,
    onSelect,
  }: {
    children: React.ReactNode;
    onSelect?: () => void;
  }) => (
    <div role="option" aria-selected={false} onClick={() => onSelect?.()}>
      {children}
    </div>
  ),
  CommandLoading: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command-loading">{children}</div>
  ),
}));

const mockReq = reqSandboxTemplateList as jest.Mock;

describe("view/selectTemplate", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    mockReq.mockResolvedValue({
      templates: [
        { templateID: "tpl-1", alias: "Alpha" },
        { templateID: "tpl-2", alias: "" },
      ],
    });
  });

  afterEach(() => consoleLogSpy.mockRestore());

  it("shows the placeholder before any selection", () => {
    render(<SelectTemplate onSelect={jest.fn()} />);
    expect(screen.getByText("Select a Template")).toBeInTheDocument();
  });

  it("loads templates when opened and selects an item", async () => {
    const onSelect = jest.fn();
    render(<SelectTemplate onSelect={onSelect} />);

    fireEvent.click(screen.getByText("toggle-popover"));

    await waitFor(() =>
      expect(mockReq).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          pageSize: 50,
          templateType: "all",
          showOfficial: true,
        }),
      ),
    );

    // Aliased item renders "tpl-1 (Alpha)"; non-aliased renders raw id
    await waitFor(() =>
      expect(screen.getByText("tpl-1 (Alpha)")).toBeInTheDocument(),
    );
    expect(screen.getByText("tpl-2")).toBeInTheDocument();

    fireEvent.click(screen.getByText("tpl-1 (Alpha)"));
    expect(onSelect).toHaveBeenCalledWith({
      templateID: "tpl-1",
      name: "Alpha",
    });
  });

  it("selects the All option which clears the filter", async () => {
    const onSelect = jest.fn();
    render(<SelectTemplate onSelect={onSelect} />);
    fireEvent.click(screen.getByText("toggle-popover"));

    await waitFor(() =>
      expect(screen.getByText("tpl-1 (Alpha)")).toBeInTheDocument(),
    );
    // "All" option is the first CommandItem when templates exist
    fireEvent.click(screen.getByText("All"));
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("runs a search query through the input", async () => {
    render(<SelectTemplate onSelect={jest.fn()} />);
    fireEvent.click(screen.getByText("toggle-popover"));
    await waitFor(() => expect(mockReq).toHaveBeenCalled());

    mockReq.mockClear();
    fireEvent.change(screen.getByPlaceholderText("Search Templates..."), {
      target: { value: "  query  " },
    });

    await waitFor(() =>
      expect(mockReq).toHaveBeenCalledWith(
        expect.objectContaining({ search: "query" }),
      ),
    );
  });

  it("handles a failed template request", async () => {
    mockReq.mockRejectedValue(new Error("nope"));
    render(<SelectTemplate onSelect={jest.fn()} />);
    fireEvent.click(screen.getByText("toggle-popover"));

    await waitFor(() => expect(mockReq).toHaveBeenCalled());
    // No options rendered after failure
    await waitFor(() =>
      expect(screen.queryAllByRole("option")).toHaveLength(0),
    );
  });

  it("loads more on scroll when a full page is returned", async () => {
    const fullPage = Array.from({ length: 50 }, (_, i) => ({
      templateID: `t-${i}`,
      alias: "",
    }));
    mockReq.mockResolvedValue({ templates: fullPage });

    render(<SelectTemplate onSelect={jest.fn()} />);
    fireEvent.click(screen.getByText("toggle-popover"));
    await waitFor(() => expect(mockReq).toHaveBeenCalledTimes(1));

    const list = screen.getByTestId("command-list");
    Object.defineProperty(list, "scrollTop", { value: 1000, writable: true });
    Object.defineProperty(list, "clientHeight", { value: 200 });
    Object.defineProperty(list, "scrollHeight", { value: 1100 });
    fireEvent.scroll(list);

    await waitFor(() =>
      expect(mockReq).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2 }),
      ),
    );
  });
});
