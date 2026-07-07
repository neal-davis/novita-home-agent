import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
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

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/detail/MultiDimensionalTimeRangePicker",
  () => ({
    __esModule: true,
    TIME_RANGE_MS: {
      "5m": 5 * 60 * 1000,
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
    },
    default: ({ onChange, value }: any) => (
      <button
        onClick={() =>
          onChange({
            label: "Last 1 hour",
            type: "preset",
            value: "1h",
          })
        }
        type="button"
      >
        range {value.label}
      </button>
    ),
  }),
);

const mockGetMetrics = getLLMDedicatedEndpointMetrics as jest.Mock;

function mockMetricsResponse() {
  mockGetMetrics.mockImplementation(({ metricName }) =>
    Promise.resolve({
      dataPoints: [
        {
          timestamp: Date.parse("2026-01-15T11:59:00Z") / 1000,
          value: metricName === "replicas_active" ? 2 : 1.5,
        },
      ],
    }),
  );
}

describe("MetricsTab", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    mockChart.group = "";
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-15T12:00:00Z"));
    mockMetricsResponse();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.useRealTimers();
  });

  it("loads every chart metric for the default range and wires chart options", async () => {
    render(
      <MetricsTab endpointId="endpoint-1" status={LLM_DE_STATUS.RUNNING} />,
    );

    expect(screen.getByText("UTC+0")).toBeInTheDocument();
    expect(screen.getByText("TTFT (Time to First Token)")).toBeInTheDocument();
    expect(
      screen.getByText("TPOT (Time Per Output Token)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Processed Tokens")).toBeInTheDocument();
    expect(screen.getByText("Concurrent Requests")).toBeInTheDocument();
    expect(screen.getByText("Replicas (Active)")).toBeInTheDocument();
    expect(screen.getAllByText("streaming only")).toHaveLength(2);

    await waitFor(() => expect(mockGetMetrics).toHaveBeenCalledTimes(11));
    expect(mockGetMetrics).toHaveBeenCalledWith(
      expect.objectContaining({
        endpointId: "endpoint-1",
        endTime: String(Date.parse("2026-01-15T12:00:00Z") / 1000),
        metricName: "ttft_p50",
        startTime: String(Date.parse("2026-01-15T11:55:00Z") / 1000),
      }),
    );
    await waitFor(() => expect(mockChart.setOption).toHaveBeenCalled());
    expect(mockChart.setOption).toHaveBeenCalledWith(
      expect.objectContaining({
        series: expect.any(Array),
        tooltip: expect.any(Object),
        xAxis: expect.objectContaining({
          max: Date.parse("2026-01-15T12:00:00Z"),
          min: Date.parse("2026-01-15T11:55:00Z"),
        }),
      }),
    );
  });

  it("refetches metrics when the range changes and when the refresh button is pressed", async () => {
    render(
      <MetricsTab endpointId="endpoint-1" status={LLM_DE_STATUS.RUNNING} />,
    );

    await waitFor(() => expect(mockGetMetrics).toHaveBeenCalledTimes(11));
    mockGetMetrics.mockClear();

    fireEvent.click(
      screen.getByRole("button", { name: "range Last 5 minutes" }),
    );
    await waitFor(() => expect(mockGetMetrics).toHaveBeenCalledTimes(11));
    expect(mockGetMetrics).toHaveBeenCalledWith(
      expect.objectContaining({
        endpointId: "endpoint-1",
        endTime: String(Date.parse("2026-01-15T12:00:00Z") / 1000),
        metricName: "throughput_total",
        startTime: String(Date.parse("2026-01-15T11:00:00Z") / 1000),
      }),
    );

    mockGetMetrics.mockClear();
    const refreshButton = screen.getAllByRole("button")[1];
    fireEvent.click(refreshButton);

    expect(refreshButton).toBeDisabled();
    await waitFor(() => expect(mockGetMetrics).toHaveBeenCalledTimes(11));

    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(refreshButton).not.toBeDisabled();
  });

  it("logs metric failures without preventing other charts from rendering", async () => {
    mockGetMetrics.mockImplementation(({ metricName }) => {
      if (metricName === "replicas_active") {
        return Promise.reject(new Error("metrics unavailable"));
      }
      return Promise.resolve({ dataPoints: [] });
    });

    render(
      <MetricsTab endpointId="endpoint-1" status={LLM_DE_STATUS.FAILED} />,
    );

    await waitFor(() =>
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch replicas_active metrics:",
        expect.any(Error),
      ),
    );
    await waitFor(() => expect(mockChart.setOption).toHaveBeenCalled());
  });
});
