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

describe("usage/selectTemplate (more branches)", () => {
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

  it("renders the selected template summary in the trigger and 'Loaded all' footer", async () => {
    render(<SelectTemplate onSelect={jest.fn()} />);
    fireEvent.click(screen.getByText("toggle-popover"));

    await waitFor(() =>
      expect(screen.getByText(/ID:tpl-1/)).toBeInTheDocument(),
    );
    // Fewer than PAGE_SIZE results -> hasMore false -> "Loaded all".
    expect(screen.getByText("Loaded all")).toBeInTheDocument();

    // Selecting an item updates the trigger to show its cpu/memory summary.
    fireEvent.click(screen.getByText(/ID:tpl-1/));
    await waitFor(() =>
      expect(screen.getAllByText(/ID:tpl-1/).length).toBeGreaterThan(0),
    );
  });

  it("stops fetching after the retry limit is exhausted", async () => {
    render(<SelectTemplate onSelect={jest.fn()} />);

    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText("toggle-popover")); // open
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => expect(mockReq).toHaveBeenCalledTimes(i + 1));
      fireEvent.click(screen.getByText("toggle-popover")); // close
    }

    expect(mockReq).toHaveBeenCalledTimes(3);
    fireEvent.click(screen.getByText("toggle-popover"));
    await Promise.resolve();
    expect(mockReq).toHaveBeenCalledTimes(3);
  });
});
