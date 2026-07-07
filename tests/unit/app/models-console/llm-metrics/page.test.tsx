import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Page from "@/app/models-console/llm-metrics/page";
import EventEmitter from "@/app/models-console/llm-metrics/EventEmitter";
import { Metrics_Event } from "@/app/models-console/llm-metrics/components/types";
import { getLLMMetrics, getLLMMetricsModels } from "@/api/metrics";
import analytics from "@/app/components/analytics/analytics";

dayjs.extend(utc);

let selectValueChange = (_: string) => {};

jest.mock("@/api/metrics", () => ({
  getLLMMetrics: jest.fn(),
  getLLMMetricsModels: jest.fn(),
}));

jest.mock("@/app/components/Permission/PermissionWrapper", () => ({
  __esModule: true,
  default: ({ children, action, resource, resourceGroup }: any) => (
    <section
      data-action={action}
      data-resource={resource}
      data-resource-group={resourceGroup}
    >
      {children}
    </section>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

jest.mock("@/components/ui/select", () => ({
  Select: ({ children, onValueChange, value }: any) => {
    selectValueChange = onValueChange;
    return <div data-selected={value}>{children}</div>;
  },
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <button onClick={() => selectValueChange(value)} type="button">
      {children}
    </button>
  ),
  SelectTrigger: ({ children, disabled }: any) => (
    <div data-disabled={disabled ? "yes" : "no"}>{children}</div>
  ),
  SelectValue: () => <span>selected model</span>,
}));

jest.mock("@/app/models-console/llm-metrics/components/RangeButton", () => ({
  RangeButton: ({ onChange, range, value }: any) => (
    <div>
      <span>refresh value {value}</span>
      {range.map((item: any) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          type="button"
        >
          refresh {item.label}
        </button>
      ))}
    </div>
  ),
}));

jest.mock("@/app/models-console/llm-metrics/components/DateTimePicker", () => ({
  DateTimePicker: ({ onChange, range }: any) => (
    <div>
      <span>date range {range?.from?.toISOString() || "empty"}</span>
      <button
        onClick={() =>
          onChange({
            from: new Date("2026-06-10T00:00:00Z"),
            to: new Date("2026-06-15T00:00:00Z"),
          })
        }
        type="button"
      >
        choose recent range
      </button>
      <button
        onClick={() =>
          onChange({
            from: new Date("2026-05-01T00:00:00Z"),
            to: new Date("2026-06-15T00:00:00Z"),
          })
        }
        type="button"
      >
        choose old range
      </button>
    </div>
  ),
}));

jest.mock("@/app/models-console/llm-metrics/components/ChartTitle", () => ({
  ChartTitle: ({ title, help }: any) => (
    <span>
      {title} {help}
    </span>
  ),
}));

jest.mock("@/app/models-console/llm-metrics/components/CharWrapper", () => ({
  __esModule: true,
  default: ({
    fetchMetrics,
    maxValue,
    minValue,
    title,
    valueFormatter,
  }: any) => (
    <article>
      <h3>{typeof title === "string" ? title : title}</h3>
      {valueFormatter && <div>formatted {valueFormatter(61000)}</div>}
      {minValue && <div>min {minValue([{ value: 92 }, { value: 0 }])}</div>}
      {maxValue && <div>max {maxValue()}</div>}
      <button
        onClick={async () => {
          const result = await fetchMetrics({
            model: "llama-3",
            signal: new AbortController().signal,
          });
          const payload = Array.isArray(result) ? result : [result];
          document.body.dataset.metricsResult = JSON.stringify(payload);
        }}
        type="button"
      >
        fetch {typeof title === "string" ? title : "chart"}
      </button>
    </article>
  ),
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: { trackClick: jest.fn() },
}));

jest.mock("@/app/components/analytics/constants", () => ({
  CLICK_BTN_IDs: {
    MODELS_CONSOLE: {
      LLM_METRICS_SELECT_MODEL: "select-model",
      LLM_METRICS_SELECT_REFRESH_RATE: "select-refresh",
      LLM_METRICS_SELECT_TIME_RANGE: "select-time",
    },
  },
}));

jest.mock("@/constants/constants", () => ({
  PERMISSION: {
    ACTION: { all: "all" },
    RESOURCE: { llm_metrics: "llm_metrics" },
    RESOURCE_GROUP: { model_api: "model_api" },
  },
}));

const mockGetLLMMetrics = getLLMMetrics as jest.Mock;
const mockGetLLMMetricsModels = getLLMMetricsModels as jest.Mock;
const mockAnalytics = analytics.trackClick as jest.Mock;
let emitSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-06-15T12:00:00Z"));
  emitSpy = jest.spyOn(EventEmitter, "emit");
  mockGetLLMMetricsModels.mockResolvedValue({ models: ["llama-3", "mixtral"] });
  mockGetLLMMetrics.mockImplementation(({ metricsType }) =>
    Promise.resolve({
      data: [
        { date: "1781492400", value: 10 },
        { date: "1781496000", value: 20 },
      ],
      metricsType,
    }),
  );
  delete document.body.dataset.metricsResult;
});

afterEach(() => {
  emitSpy.mockRestore();
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe("LLM metrics page", () => {
  it("loads models, selects a model, updates recent date ranges, and emits refresh events", async () => {
    render(<Page />);

    expect(await screen.findByText("llama-3")).toBeInTheDocument();
    expect(screen.getByText("mixtral")).toBeInTheDocument();
    expect(emitSpy).toHaveBeenCalledWith(Metrics_Event.Fetch_With_Abort, {
      model: "llama-3",
    });

    fireEvent.click(screen.getByText("mixtral"));
    expect(mockAnalytics).toHaveBeenCalledWith("select-model", {
      model: "mixtral",
    });
    expect(emitSpy).toHaveBeenCalledWith(Metrics_Event.Fetch_With_Abort, {
      model: "mixtral",
    });

    fireEvent.click(screen.getByText("choose recent range"));
    expect(mockAnalytics).toHaveBeenCalledWith("select-time", {
      dateRange: {
        from: new Date("2026-06-10T00:00:00Z"),
        to: new Date("2026-06-15T00:00:00Z"),
      },
    });
    await waitFor(() => {
      expect(mockGetLLMMetricsModels).toHaveBeenCalledWith(
        expect.objectContaining({
          endTime: 1781481600,
          startTime: 1781049600,
          signal: expect.any(AbortSignal),
        }),
      );
    });

    fireEvent.click(screen.getByText("choose old range"));
    expect(mockAnalytics).not.toHaveBeenCalledWith("select-time", {
      dateRange: {
        from: new Date("2026-05-01T00:00:00Z"),
        to: new Date("2026-06-15T00:00:00Z"),
      },
    });

    fireEvent.click(screen.getByText("refresh 5 s"));
    expect(mockAnalytics).toHaveBeenCalledWith("select-refresh", {
      refresh: 5,
    });
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(emitSpy).toHaveBeenCalledWith(Metrics_Event.Fetch_Wait_Previous, {
      model: expect.any(String),
    });
  });

  it("fetches chart data through page-provided metric callbacks and formats values", async () => {
    render(<Page />);

    expect(
      await screen.findByText("Request Per Minute (RPM)"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("formatted 1.02mins").length).toBeGreaterThan(0);
    expect(screen.getByText("min 88.32")).toBeInTheDocument();
    expect(screen.getByText("max 100")).toBeInTheDocument();

    fireEvent.click(screen.getByText("fetch Request Per Minute (RPM)"));
    await waitFor(() => {
      expect(mockGetLLMMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          metricsType: "RPM",
          model: "llama-3",
          signal: expect.any(AbortSignal),
        }),
      );
    });
    expect(document.body.dataset.metricsResult).toContain(
      '"metricsType":"RPM"',
    );

    fireEvent.click(screen.getAllByText("fetch chart")[0]);
    await waitFor(() => {
      expect(mockGetLLMMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          metricsType: "Request_Success_Rate",
        }),
      );
    });
    expect(document.body.dataset.metricsResult).toContain(
      '"metricsType":"Success Rate"',
    );
  });

  it("clears the selected model when the metrics model API returns no models", async () => {
    mockGetLLMMetricsModels.mockResolvedValue({ models: [] });

    render(<Page />);

    expect(await screen.findByText("No LLM api calls")).toBeInTheDocument();
    expect(emitSpy).toHaveBeenCalledWith(Metrics_Event.Clear, {});
  });
});
