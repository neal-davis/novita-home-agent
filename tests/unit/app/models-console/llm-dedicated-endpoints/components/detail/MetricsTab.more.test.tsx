import { render, screen, waitFor } from "@testing-library/react";
import { getLLMDedicatedEndpointMetrics } from "@/api/dedicated-endpoint";
import { LLM_DE_STATUS } from "@/app/models-console/llm-dedicated-endpoints/components/DEModelStatus";
import MetricsTab from "@/app/models-console/llm-dedicated-endpoints/components/detail/MetricsTab";

const mockChart = {
  dispose: jest.fn(),
  group: "",
  resize: jest.fn(),
  setOption: jest.fn(),
};

jest.mock("echarts", () => ({
  __esModule: true,
  connect: jest.fn(),
  graphic: {
    LinearGradient: jest.fn((...args) => ({ args, type: "linear-gradient" })),
  },
  init: jest.fn(() => mockChart),
}));

jest.mock("@/api/dedicated-endpoint", () => ({
  getLLMDedicatedEndpointMetrics: jest.fn(),
}));

// Picker mock that lets each test pick which range to emit on mount via a global.
jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/detail/MultiDimensionalTimeRangePicker",
  () => ({
    __esModule: true,
    TIME_RANGE_MS: {
      "5m": 5 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
    },
    default: ({ onChange }: any) => (
      <div>
        <button
          onClick={() =>
            onChange({
              type: "custom",
              startTime: Date.parse("2026-01-15T10:00:00Z"),
              endTime: Date.parse("2026-01-15T11:00:00Z"),
              label: "Custom",
            })
          }
          type="button"
        >
          set-custom-valid
        </button>
        <button
          onClick={() => onChange({ type: "custom", label: "Custom empty" })}
          type="button"
        >
          set-custom-empty
        </button>
        <button
          onClick={() =>
            onChange({
              type: "preset",
              value: "unknown-xyz",
              label: "Bad preset",
            })
          }
          type="button"
        >
          set-preset-unknown
        </button>
      </div>
    ),
  }),
);

const mockGetMetrics = getLLMDedicatedEndpointMetrics as jest.Mock;

describe("MetricsTab (more branches)", () => {
  let consoleErrorSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    mockChart.group = "";
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    mockGetMetrics.mockResolvedValue({ dataPoints: [] });
  });
  afterEach(() => consoleErrorSpy.mockRestore());

  it("custom time range with valid start/end uses those bounds", async () => {
    render(<MetricsTab endpointId="ep-1" status={LLM_DE_STATUS.RUNNING} />);
    await waitFor(() => expect(mockGetMetrics).toHaveBeenCalled());
    mockGetMetrics.mockClear();
    screen.getByText("set-custom-valid").click();
    await waitFor(() =>
      expect(mockGetMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          startTime: String(Date.parse("2026-01-15T10:00:00Z") / 1000),
          endTime: String(Date.parse("2026-01-15T11:00:00Z") / 1000),
        }),
      ),
    );
  });

  it("custom range without bounds falls back to 24h window", async () => {
    render(<MetricsTab endpointId="ep-1" status={LLM_DE_STATUS.RUNNING} />);
    await waitFor(() => expect(mockGetMetrics).toHaveBeenCalled());
    mockGetMetrics.mockClear();
    const before = Date.now();
    screen.getByText("set-custom-empty").click();
    await waitFor(() => expect(mockGetMetrics).toHaveBeenCalled());
    const call = mockGetMetrics.mock.calls[0][0];
    const span = (Number(call.endTime) - Number(call.startTime)) * 1000;
    // ~24h window
    expect(span).toBe(24 * 60 * 60 * 1000);
    expect(Number(call.endTime) * 1000).toBeGreaterThanOrEqual(before - 1000);
  });

  it("preset with unknown value falls back to 24h window", async () => {
    render(<MetricsTab endpointId="ep-1" status={LLM_DE_STATUS.RUNNING} />);
    await waitFor(() => expect(mockGetMetrics).toHaveBeenCalled());
    mockGetMetrics.mockClear();
    screen.getByText("set-preset-unknown").click();
    await waitFor(() => expect(mockGetMetrics).toHaveBeenCalled());
    const call = mockGetMetrics.mock.calls[0][0];
    const span = (Number(call.endTime) - Number(call.startTime)) * 1000;
    expect(span).toBe(24 * 60 * 60 * 1000);
  });

  it("AbortError is swallowed (no console.error) while other errors are logged", async () => {
    mockGetMetrics.mockImplementation(({ metricName }: any) => {
      if (metricName === "ttft_p50") {
        const err = new Error("aborted");
        err.name = "AbortError";
        return Promise.reject(err);
      }
      if (metricName === "ttft_p95") {
        return Promise.reject(new Error("real failure"));
      }
      return Promise.resolve({ dataPoints: [] });
    });
    render(<MetricsTab endpointId="ep-1" status={LLM_DE_STATUS.RUNNING} />);
    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch ttft_p95 metrics:",
        expect.any(Error),
      ),
    );
    // AbortError metric should never have been logged
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      "Failed to fetch ttft_p50 metrics:",
      expect.anything(),
    );
  });

  it("renders integer-unit charts (SingleMetricChart with isInteger) with data", async () => {
    mockGetMetrics.mockResolvedValue({
      dataPoints: [{ timestamp: 1700000000, value: 3.7 }],
    });
    render(<MetricsTab endpointId="ep-1" status={LLM_DE_STATUS.RUNNING} />);
    await waitFor(() => expect(mockChart.setOption).toHaveBeenCalled());
    // integer chart sets minInterval on yAxis
    const calls = mockChart.setOption.mock.calls.map((c) => c[0]);
    const hasIntegerAxis = calls.some(
      (opt) => (opt.yAxis as any)?.minInterval === 1,
    );
    expect(hasIntegerAxis).toBe(true);
  });

  it("resamples multiple data points spread across the window (findNearestDataPoint)", async () => {
    // Pin "now" to a fixed wall clock so the resample window is deterministic
    // regardless of scheduling jitter under the parallel test runner.
    const fixedNowMs = 1_700_000_000_000;
    const dateNowSpy = jest.spyOn(Date, "now").mockReturnValue(fixedNowMs);
    const now = Math.floor(fixedNowMs / 1000);
    // many points across the last hour so the binary search + threshold paths run
    const points = Array.from({ length: 20 }, (_, i) => ({
      timestamp: now - i * 120,
      value: i,
    }));
    mockGetMetrics.mockResolvedValue({ dataPoints: points });
    render(<MetricsTab endpointId="ep-1" status={LLM_DE_STATUS.RUNNING} />);
    await waitFor(() => expect(mockChart.setOption).toHaveBeenCalled());
    // series data should be populated (resampled to SAMPLE_COUNT points); it may
    // land in a later render than the first setOption call, so poll for it.
    await waitFor(() => {
      const withSeries = mockChart.setOption.mock.calls
        .map((c) => c[0])
        .find(
          (opt) =>
            Array.isArray(opt.series) &&
            Array.isArray((opt.series[0] as any)?.data) &&
            (opt.series[0] as any).data.length > 0,
        );
      expect(withSeries).toBeTruthy();
    });
    dateNowSpy.mockRestore();
  });

  it("handles a metrics response with no dataPoints field (resample of empty)", async () => {
    mockGetMetrics.mockResolvedValue({});
    render(<MetricsTab endpointId="ep-1" status={LLM_DE_STATUS.FAILED} />);
    await waitFor(() => expect(mockChart.setOption).toHaveBeenCalled());
    // still renders without throwing
    expect(screen.getByText("Concurrent Requests")).toBeInTheDocument();
  });
});
