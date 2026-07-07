import { render, screen, fireEvent } from "@testing-library/react";
import { ListToolbar } from "@/app/models-console/llm-dedicated-endpoints/sub-pages/DedicatedEndpointList/ListToolbar";

const trackClick = jest.fn();
jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: (...a: unknown[]) => trackClick(...a) },
}));
jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    MODELS_CONSOLE: { LLM_DE_CREATE_ENDPOINT_ENTRY: "create-entry" },
  },
}));

// SearchInput: simple input firing onSearch on change
jest.mock("@/components/ui/input", () => ({
  SearchInput: ({
    onSearch,
    placeholder,
    value,
  }: {
    onSearch: (v: string) => void;
    placeholder: string;
    value: string;
  }) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onSearch(e.target.value)}
    />
  ),
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value: string;
    onValueChange: (v: string) => void;
  }) => (
    <select
      aria-label="status"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <option value={value}>{children}</option>,
  SelectTrigger: () => null,
  SelectValue: () => null,
}));

function setup(props: Record<string, unknown> = {}) {
  const onStatusChange = jest.fn();
  const onEndpointNameChange = jest.fn();
  const onCreateEndpoint = jest.fn();
  render(
    <ListToolbar
      dedicatedEndpointList={[{ id: "1" }, { id: "2" }] as never}
      totalCount={2}
      filterStatus="all"
      filterEndpointName=""
      onStatusChange={onStatusChange}
      onEndpointNameChange={onEndpointNameChange}
      onCreateEndpoint={onCreateEndpoint}
      {...props}
    />,
  );
  return { onStatusChange, onEndpointNameChange, onCreateEndpoint };
}

describe("ListToolbar", () => {
  beforeEach(() => jest.clearAllMocks());

  it("shows total endpoint count (plural)", () => {
    setup();
    expect(screen.getByText("2 endpoints")).toBeInTheDocument();
  });

  it("shows singular form for one endpoint", () => {
    setup({ dedicatedEndpointList: [{ id: "1" }], totalCount: 1 });
    expect(screen.getByText("1 endpoint")).toBeInTheDocument();
  });

  it("shows filtered ratio when list differs from total", () => {
    setup({ dedicatedEndpointList: [{ id: "1" }], totalCount: 5 });
    expect(screen.getByText("1/5 endpoints")).toBeInTheDocument();
  });

  it("New Endpoint click fires callback and analytics", () => {
    const { onCreateEndpoint } = setup();
    fireEvent.click(screen.getByRole("button", { name: /New Endpoint/ }));
    expect(onCreateEndpoint).toHaveBeenCalled();
    expect(trackClick).toHaveBeenCalledWith("create-entry", {
      position: "toolbar",
    });
  });

  it("search input fires onEndpointNameChange", () => {
    const { onEndpointNameChange } = setup();
    fireEvent.change(screen.getByPlaceholderText(/Search by endpoint/), {
      target: { value: "abc" },
    });
    expect(onEndpointNameChange).toHaveBeenCalledWith("abc");
  });

  it("status select fires onStatusChange", () => {
    const { onStatusChange } = setup();
    fireEvent.change(screen.getByLabelText("status"), {
      target: { value: "running" },
    });
    expect(onStatusChange).toHaveBeenCalledWith("running");
  });

  it("clear button appears for active filter and resets to all", () => {
    const { onStatusChange } = setup({ filterStatus: "running" });
    // clear (X) button is the icon-only button
    const clearBtn = screen
      .getAllByRole("button")
      .find((b) => !b.textContent?.includes("New Endpoint"));
    fireEvent.click(clearBtn!);
    expect(onStatusChange).toHaveBeenCalledWith("all");
  });
});
