import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SelectTemplate from "@/app/sandbox-console/usage/selectTemplate";
import { reqSandboxTemplateList } from "@/api/sandbox";

jest.mock("@/api/sandbox", () => ({
  reqSandboxTemplateList: jest.fn(),
}));

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

describe("usage/selectTemplate", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    mockReq.mockResolvedValue({
      templates: [
        { templateID: "tpl-1", alias: "Alpha", cpuCount: 2, memoryMB: 1024 },
        { templateID: "tpl-2", alias: "", cpuCount: 4, memoryMB: 2048 },
      ],
    });
  });

  afterEach(() => consoleLogSpy.mockRestore());

  it("shows the All label before any selection", () => {
    render(<SelectTemplate onSelect={jest.fn()} />);
    expect(screen.getAllByText("All").length).toBeGreaterThan(0);
  });

  it("loads templates with cpu/memory info and selects one", async () => {
    const onSelect = jest.fn();
    render(<SelectTemplate onSelect={onSelect} />);
    fireEvent.click(screen.getByText("toggle-popover"));

    await waitFor(() => expect(mockReq).toHaveBeenCalled());

    // Items render an "ID:tpl-1" style label with cores + MiB
    await waitFor(() =>
      expect(screen.getByText(/ID:tpl-1/)).toBeInTheDocument(),
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();

    fireEvent.click(screen.getByText(/ID:tpl-1/));
    expect(onSelect).toHaveBeenCalledWith({
      templateID: "tpl-1",
      name: "Alpha",
    });
  });

  it("selects the All option, clearing the filter", async () => {
    const onSelect = jest.fn();
    render(<SelectTemplate onSelect={onSelect} />);
    fireEvent.click(screen.getByText("toggle-popover"));
    await waitFor(() => expect(mockReq).toHaveBeenCalled());

    // The first "All" entry inside the list is the clear option
    const allEntries = screen.getAllByText("All");
    fireEvent.click(allEntries[allEntries.length - 1]);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("runs a trimmed search query", async () => {
    render(<SelectTemplate onSelect={jest.fn()} />);
    fireEvent.click(screen.getByText("toggle-popover"));
    await waitFor(() => expect(mockReq).toHaveBeenCalled());

    mockReq.mockClear();
    fireEvent.change(screen.getByPlaceholderText("Search Templates..."), {
      target: { value: " foo " },
    });
    await waitFor(() =>
      expect(mockReq).toHaveBeenCalledWith(
        expect.objectContaining({ search: "foo" }),
      ),
    );
  });

  it("handles request failure gracefully", async () => {
    mockReq.mockRejectedValue(new Error("boom"));
    render(<SelectTemplate onSelect={jest.fn()} />);
    fireEvent.click(screen.getByText("toggle-popover"));
    await waitFor(() => expect(mockReq).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.queryAllByRole("option")).toHaveLength(0),
    );
  });

  it("loads more on scroll near the bottom", async () => {
    const fullPage = Array.from({ length: 50 }, (_, i) => ({
      templateID: `t-${i}`,
      alias: "",
      cpuCount: 1,
      memoryMB: 512,
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
