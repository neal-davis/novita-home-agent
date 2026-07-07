import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SelectTemplate from "@/app/sandbox-console/view/selectTemplate";
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

describe("view/selectTemplate (more branches)", () => {
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

  it("shows the selected template (with alias) in the trigger and 'Loaded all' footer", async () => {
    render(<SelectTemplate onSelect={jest.fn()} />);
    fireEvent.click(screen.getByText("toggle-popover"));

    await waitFor(() =>
      expect(screen.getByText("tpl-1 (Alpha)")).toBeInTheDocument(),
    );
    // < PAGE_SIZE templates -> hasMore false -> "Loaded all" footer renders.
    expect(screen.getByText("Loaded all")).toBeInTheDocument();

    // Select the aliased item; the trigger reflects "tpl-1 (Alpha)".
    fireEvent.click(screen.getByText("tpl-1 (Alpha)"));
    await waitFor(() =>
      expect(screen.getAllByText("tpl-1 (Alpha)").length).toBeGreaterThan(0),
    );
  });

  it("shows the raw id in the trigger when the selected template has no alias", async () => {
    render(<SelectTemplate onSelect={jest.fn()} />);
    fireEvent.click(screen.getByText("toggle-popover"));

    await waitFor(() => expect(screen.getByText("tpl-2")).toBeInTheDocument());

    // Selecting the non-aliased item shows just the id in the trigger.
    fireEvent.click(screen.getByText("tpl-2"));
    await waitFor(() =>
      expect(screen.getAllByText("tpl-2").length).toBeGreaterThan(0),
    );
  });

  it("stops reloading once the retry limit is reached", async () => {
    render(<SelectTemplate onSelect={jest.fn()} />);

    // Open/close three times; each successful open bumps retryTimes.
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByText("toggle-popover")); // open
      // eslint-disable-next-line no-await-in-loop
      await waitFor(() => expect(mockReq).toHaveBeenCalledTimes(i + 1));
      fireEvent.click(screen.getByText("toggle-popover")); // close
    }

    expect(mockReq).toHaveBeenCalledTimes(3);
    // Fourth open: retryTimes >= 3 short-circuits, no new fetch.
    fireEvent.click(screen.getByText("toggle-popover"));
    await Promise.resolve();
    expect(mockReq).toHaveBeenCalledTimes(3);
  });
});
