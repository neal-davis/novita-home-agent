import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import Section from "@/app/sandbox-console/usage/section";
import {
  reqSandboxRunningCount,
  reqSandboxStats,
  reqSandboxStorageRealTime,
  reqSandboxStorageStats,
  reqSandboxUsage,
} from "@/api/sandbox";
import { message } from "@/components/ui/standard/notify";
import * as XLSX from "xlsx";

dayjs.extend(utc);

jest.mock("@/api/sandbox", () => ({
  reqSandboxRunningCount: jest.fn(),
  reqSandboxStats: jest.fn(),
  reqSandboxStorageRealTime: jest.fn(),
  reqSandboxStorageStats: jest.fn(),
  reqSandboxUsage: jest.fn(),
}));

const mockChart = {
  dispose: jest.fn(),
  resize: jest.fn(),
  setOption: jest.fn(),
};

jest.mock("echarts", () => ({
  getInstanceByDom: jest.fn(() => null),
  init: jest.fn(() => mockChart),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    warning: jest.fn(),
  },
}));

// DateRangePicker mock that can emit several different ranges so we can
// exercise the >31-day error, hour-too-long error, reversed (empty) range, etc.
jest.mock("@/components/ui/standard/date-range-picker-utc", () => ({
  __esModule: true,
  default: ({
    onChange,
  }: {
    onChange: (value?: { from?: Date; to?: Date }) => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() =>
          onChange({
            from: new Date("2025-12-01T00:00:00Z"),
            to: new Date("2026-02-01T00:00:00Z"),
          })
        }
      >
        range-over31
      </button>
      <button
        type="button"
        onClick={() =>
          onChange({
            from: new Date("2026-01-10T00:00:00Z"),
            to: new Date("2026-01-12T00:00:00Z"),
          })
        }
      >
        range-2day
      </button>
      <button
        type="button"
        onClick={() =>
          onChange({
            from: new Date("2026-01-20T00:00:00Z"),
            to: new Date("2026-01-10T00:00:00Z"),
          })
        }
      >
        range-reversed
      </button>
    </div>
  ),
}));

jest.mock("@/components/ui/toggle-group", () => ({
  ToggleGroup: ({
    children,
    onValueChange,
  }: {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
  }) => (
    <div data-testid="toggle-group" onClick={() => onValueChange?.("Day")}>
      {children}
    </div>
  ),
  ToggleGroupItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => <button type="button">{children || value}</button>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    id,
    onClick,
  }: {
    children: React.ReactNode;
    id?: string;
    onClick?: () => void;
  }) => (
    <button id={id} type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

jest.mock("@/app/sandbox-console/usage/selectTemplate", () => ({
  __esModule: true,
  default: ({
    onSelect,
  }: {
    onSelect: (value: { templateID: string }) => void;
  }) => (
    <button
      type="button"
      onClick={() => onSelect({ templateID: "template-1" })}
    >
      choose template
    </button>
  ),
}));

jest.mock("xlsx", () => ({
  utils: {
    book_append_sheet: jest.fn(),
    book_new: jest.fn(() => ({ SheetNames: [], Sheets: {} })),
    json_to_sheet: jest.fn(() => ({ "!ref": "A1:B2" })),
  },
  writeFile: jest.fn(),
}));

const mockReqSandboxUsage = reqSandboxUsage as jest.Mock;
const mockReqSandboxRunningCount = reqSandboxRunningCount as jest.Mock;
const mockReqSandboxStats = reqSandboxStats as jest.Mock;
const mockReqSandboxStorageStats = reqSandboxStorageStats as jest.Mock;
const mockReqSandboxStorageRealTime = reqSandboxStorageRealTime as jest.Mock;
const mockError = message.error as jest.Mock;
const mockWarning = message.warning as jest.Mock;
const mockWriteFile = XLSX.writeFile as jest.Mock;

const baseTimestamp = Date.parse("2026-01-15T00:00:00Z") / 1000;
const noonTimestamp = Date.parse("2026-01-15T12:00:00Z") / 1000;
let consoleLogSpy: jest.SpyInstance;

function resolveDashboardApis() {
  mockReqSandboxUsage.mockResolvedValue({
    usages: [{ amount: "25000", cycle: "2026-01-15" }],
  });
  mockReqSandboxRunningCount.mockResolvedValue({
    stats: [{ runningCount: "3", timestamp: String(baseTimestamp) }],
  });
  mockReqSandboxStats.mockResolvedValue({
    stats: [
      {
        ram: String(2 * 3600 * 1024),
        timestamp: String(baseTimestamp),
        vcpu: "7200",
      },
    ],
  });
  mockReqSandboxStorageStats.mockResolvedValue({
    stats: [
      {
        infos: [{ storage: "2048", timestamp: String(baseTimestamp) }],
        storageType: "",
      },
      {
        infos: [{ storage: "1024", timestamp: String(baseTimestamp) }],
        storageType: "template_build",
      },
    ],
  });
  mockReqSandboxStorageRealTime.mockResolvedValue({
    freeStorage: 4096,
    storage: 2048,
  });
}

describe("sandbox usage section (more branches)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    jest.useFakeTimers({ now: new Date("2026-01-15T12:00:00Z") });
    resolveDashboardApis();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    jest.useRealTimers();
  });

  it("errors when the usage range exceeds 31 days", async () => {
    render(<Section />);
    await waitFor(() => expect(mockReqSandboxStats).toHaveBeenCalled());
    mockError.mockClear();

    // First date picker drives the usage (vCPU/RAM/sandbox) filter.
    fireEvent.click(screen.getAllByText("range-over31")[0]);

    await waitFor(() =>
      expect(mockError).toHaveBeenCalledWith(
        "The selected time range is too long for grouping. Please select 1 - 31 days",
      ),
    );
  });

  it("errors when the storage range exceeds 31 days", async () => {
    render(<Section />);
    await waitFor(() => expect(mockReqSandboxStorageStats).toHaveBeenCalled());
    mockError.mockClear();

    // Second date picker drives the storage filter.
    fireEvent.click(screen.getAllByText("range-over31")[1]);

    await waitFor(() =>
      expect(mockError).toHaveBeenCalledWith(
        "The selected time range is too long for grouping. Please select 1 - 31 days",
      ),
    );
  });

  it("errors when the storage hour-level range exceeds one day", async () => {
    render(<Section />);
    await waitFor(() => expect(mockReqSandboxStorageStats).toHaveBeenCalled());
    mockError.mockClear();

    // Default storage cycle is "Hour"; a 2-day range is rejected.
    fireEvent.click(screen.getAllByText("range-2day")[1]);

    await waitFor(() =>
      expect(mockError).toHaveBeenCalledWith(
        "The selected time range is too long for hour-level grouping. Please select 1 day",
      ),
    );
  });

  it("switches storage grouping to Day and refetches with the Day cycle", async () => {
    render(<Section />);
    await waitFor(() => expect(mockReqSandboxStorageStats).toHaveBeenCalled());
    mockReqSandboxStorageStats.mockClear();

    // Second toggle group controls the storage cycleType -> "Day".
    fireEvent.click(screen.getAllByTestId("toggle-group")[1]);

    await waitFor(() =>
      expect(mockReqSandboxStorageStats).toHaveBeenLastCalledWith(
        expect.objectContaining({ cycleType: "Day" }),
      ),
    );
  });

  it("sets the real-time running sandbox count from the last minute bucket", async () => {
    // A running-count sample exactly at "now" (noon) is the last generated
    // minute bucket, so it becomes the real-time value.
    mockReqSandboxRunningCount.mockResolvedValue({
      stats: [{ runningCount: "42", timestamp: String(noonTimestamp) }],
    });

    render(<Section />);

    await waitFor(() => expect(screen.getByText("42")).toBeInTheDocument());
  });

  it("warns No Data when exporting an empty grouped usage dataset", async () => {
    render(<Section />);
    await waitFor(() => expect(mockReqSandboxStats).toHaveBeenCalled());

    // Reversed range (start after end) yields an empty generated series.
    fireEvent.click(screen.getAllByText("range-reversed")[0]);

    await waitFor(() =>
      expect(screen.getByText("No vCPU usage data found")).toBeInTheDocument(),
    );

    mockWarning.mockClear();
    // First Export button maps to the grouped vCPU/RAM/sandbox export.
    fireEvent.click(screen.getAllByRole("button", { name: "Export" })[0]);
    expect(mockWarning).toHaveBeenCalledWith("No Data!");
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("warns No Data when exporting empty storage and cost datasets", async () => {
    mockReqSandboxUsage.mockResolvedValue({ usages: [] });
    mockReqSandboxStorageStats.mockResolvedValue({ stats: [] });

    render(<Section />);

    await waitFor(() => {
      expect(screen.getByText("No Storage data found")).toBeInTheDocument();
      expect(screen.getByText("No cost data found")).toBeInTheDocument();
    });

    mockWarning.mockClear();
    const exportButtons = screen.getAllByRole("button", { name: "Export" });
    // Second Export = storage, third Export = cost.
    fireEvent.click(exportButtons[1]);
    fireEvent.click(exportButtons[2]);

    expect(mockWarning).toHaveBeenCalledWith("No Data!");
    expect(mockWarning).toHaveBeenCalledTimes(2);
    expect(mockWriteFile).not.toHaveBeenCalled();
  });
});
