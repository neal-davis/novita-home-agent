import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import UsageDashboard from "@/app/models-console/metrics/usage/UsageDashboard";
import {
  useModelAPIUsage,
  useModelAPIUsageScopes,
  useUsageQuota,
} from "@/app/models-console/metrics/usage/useModelAPIUsage";

jest.mock("@/app/models-console/metrics/usage/UsageCharts", () => ({
  StackedCostChart: ({ labels, datasets, onTooltipChange }: any) => (
    <button
      type="button"
      onClick={() =>
        onTooltipChange({
          x: 1,
          y: 2,
          label: labels[0],
          values: datasets.map((dataset: any) => ({
            name: dataset.name,
            value: 1,
            color: dataset.color,
          })),
        })
      }
    >
      chart {labels.join(",")}
    </button>
  ),
  UsageTooltipLayer: ({ tooltip }: any) => (
    <div>{tooltip ? `tooltip ${tooltip.label}` : "no tooltip"}</div>
  ),
}));

jest.mock("@/components/ui/standard/date-range-picker-utc", () => ({
  __esModule: true,
  default: ({ disabled, onChange }: any) => (
    <button
      type="button"
      data-before={disabled?.before?.toISOString?.()}
      onClick={() =>
        onChange({
          from: new Date("2026-01-10T00:00:00Z"),
          to: new Date("2026-05-02T00:00:00Z"),
        })
      }
    >
      pick usage range
    </button>
  ),
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
  TooltipProvider: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
}));

jest.mock("lucide-react", () => ({
  ArrowDown: () => <span>down</span>,
  ArrowUp: () => <span>up</span>,
  ChevronDown: () => <span>chevron</span>,
  Circle: ({ fill }: any) => <span data-fill={fill}>circle</span>,
  Infinity: () => <span>infinity</span>,
  Info: () => <span>info</span>,
  KeyRound: () => <span>key icon</span>,
  Search: () => <span>search icon</span>,
  Users: () => <span>users icon</span>,
}));

jest.mock("@/app/models-console/metrics/usage/useModelAPIUsage", () => ({
  useModelAPIUsage: jest.fn(),
  useModelAPIUsageScopes: jest.fn(),
  useUsageQuota: jest.fn(),
}));

const mockUseScopes = useModelAPIUsageScopes as jest.Mock;
const mockUseUsage = useModelAPIUsage as jest.Mock;
const mockUseQuota = useUsageQuota as jest.Mock;

const teamScope = {
  type: "team",
  memberId: null,
  keyId: null,
  label: "Team Usage",
};
const memberScope = {
  type: "member",
  memberId: "member-1",
  memberName: "Ada",
  keyId: null,
  label: "Ada Lovelace",
  keyCount: 2,
  keys: [
    {
      type: "key",
      memberId: "member-1",
      keyId: "key-1",
      label: "prod-key",
    },
    {
      type: "key",
      memberId: "member-1",
      keyId: "key-2",
      label: "stage-key",
    },
    {
      type: "key",
      memberId: "member-1",
      keyId: "key-3",
      label: "dev-key",
    },
  ],
};

const baseUsage = {
  metrics: {
    requests: 1234,
    inputTokens: 2000,
    cacheTokens: 300,
    outputTokens: 400,
  },
  costLabels: ["Jun 1"],
  costDatasets: [{ id: "m1", name: "llama", color: "#f00", data: [1] }],
  modelRows: [
    {
      id: "model-1",
      model: "llama-3",
      requests: 1000,
      inputTokens: 2000,
      cacheTokens: 300,
      outputTokens: 400,
      cost: 1.25,
    },
  ],
  keyRows: [
    {
      id: "key-1",
      name: "prod-key",
      member: "Ada",
      requests: 500,
      totalTokens: 2700,
      cost: 0.5,
    },
  ],
  meta: {
    currency: "USD",
    isLive: true,
    granularity: "Hourly",
    delayMinutes: 3,
  },
  loading: false,
  error: null,
};

describe("UsageDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseScopes.mockReturnValue({
      scopeOptions: {
        team: teamScope,
        members: [memberScope],
      },
      loading: false,
      error: null,
    });
    mockUseUsage.mockReturnValue(baseUsage);
    mockUseQuota.mockReturnValue({
      quota: {
        type: "Recurring",
        limit: 10,
        used: 7,
        period: "Monthly",
      },
      loading: false,
      error: null,
    });
  });

  it("renders live metrics, chart, ranks, and top-key data for team scope", async () => {
    render(<UsageDashboard />);

    await screen.findByText("Team Usage");
    expect(screen.getByText("Total Requests")).toBeInTheDocument();
    expect(screen.getByText("1.2K")).toBeInTheDocument();
    expect(screen.getByText("2.3K")).toBeInTheDocument();
    expect(screen.getByText("Hourly · ~3 min delay")).toBeInTheDocument();
    expect(screen.getByText("llama-3")).toBeInTheDocument();
    expect(screen.getAllByText("prod-key").length).toBeGreaterThan(0);
    expect(screen.queryByText("Current Period Quota")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /chart Jun 1/ }));
    expect(screen.getByText("tooltip Jun 1")).toBeInTheDocument();
  });

  it("changes scope, shows quota, filters members, and toggles sorts", async () => {
    render(<UsageDashboard />);
    await screen.findByText("Team Usage");

    fireEvent.click(screen.getByRole("button", { name: /Team Usage/ }));
    fireEvent.change(screen.getByPlaceholderText("Search member or key"), {
      target: { value: "prod" },
    });
    expect(screen.getAllByText("prod-key").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /Ada Lovelace/ }));
    await waitFor(() => {
      expect(mockUseQuota).toHaveBeenLastCalledWith(
        expect.objectContaining({ type: "member", memberId: "member-1" }),
      );
    });
    expect(screen.getByText("Current Period Quota")).toBeInTheDocument();
    expect(screen.getByText("$7.0000")).toBeInTheDocument();
    expect(screen.getByText("$10.0000")).toBeInTheDocument();
    expect(screen.getByText("70.0%")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Requests" })[0]);
    await waitFor(() => {
      expect(mockUseUsage).toHaveBeenLastCalledWith(
        expect.objectContaining({
          modelSort: { column: "requests", direction: "desc" },
        }),
      );
    });

    fireEvent.click(
      screen.getAllByRole("button", { name: "Requests down" })[0],
    );
    await waitFor(() => {
      expect(mockUseUsage).toHaveBeenLastCalledWith(
        expect.objectContaining({
          modelSort: { column: "requests", direction: "asc" },
        }),
      );
    });
  });

  it("applies time presets, clamps custom ranges, and renders empty/error states", async () => {
    mockUseUsage.mockReturnValue({
      ...baseUsage,
      costLabels: [],
      costDatasets: [],
      modelRows: [],
      keyRows: [],
      error: "Usage failed",
    });
    mockUseScopes.mockReturnValue({
      scopeOptions: {
        team: teamScope,
        members: [],
      },
      loading: false,
      error: "Scopes failed",
    });

    render(<UsageDashboard />);
    await screen.findByText("Usage failed");

    expect(screen.getByText("No cost data in this period")).toBeInTheDocument();
    expect(
      screen.getByText("No model usage in this period"),
    ).toBeInTheDocument();
    expect(screen.getByText("No key usage in this period")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Today" }));
    await waitFor(() => {
      expect(mockUseUsage).toHaveBeenLastCalledWith(
        expect.objectContaining({ timeRange: "today" }),
      );
    });

    fireEvent.click(screen.getByRole("button", { name: "pick usage range" }));
    await waitFor(() => {
      expect(mockUseUsage).toHaveBeenLastCalledWith(
        expect.objectContaining({
          timeRange: "custom",
          customStart: "2026-04-01",
          customEnd: "2026-05-02",
        }),
      );
    });
  });
});
