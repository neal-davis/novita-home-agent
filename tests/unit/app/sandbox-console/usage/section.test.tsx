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
jest.mock("@/components/ui/standard/date-range-picker-utc", () => ({
  __esModule: true,
  default: ({
    onChange,
    startTime,
  }: {
    onChange: (value?: { from?: Date; to?: Date }) => void;
    startTime?: Date;
  }) => (
    <button
      type="button"
      onClick={() =>
        onChange({
          from: new Date("2026-01-10T00:00:00Z"),
          to: new Date("2026-01-11T00:00:00Z"),
        })
      }
    >
      date range {startTime?.toISOString().slice(0, 10)}
    </button>
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
const mockWriteFile = XLSX.writeFile as jest.Mock;
const mockWarning = message.warning as jest.Mock;

const baseTimestamp = Date.parse("2026-01-15T00:00:00Z") / 1000;
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
      {
        infos: [{ storage: "512", timestamp: String(baseTimestamp) }],
        storageType: "sandbox_snapshot",
      },
      {
        infos: [{ storage: "256", timestamp: String(baseTimestamp) }],
        storageType: "snapshot_template",
      },
    ],
  });
  mockReqSandboxStorageRealTime.mockResolvedValue({
    freeStorage: 4096,
    storage: 2048,
  });
}

describe("sandbox usage section", () => {
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

  it("loads dashboard metrics, renders charts, filters templates, and exports loaded data", async () => {
    render(<Section />);

    expect(screen.getAllByText(/date range 2026-01-15/)).toHaveLength(2);

    await waitFor(() => {
      expect(mockReqSandboxUsage).toHaveBeenCalledWith({ templateId: "" });
      expect(mockReqSandboxRunningCount).toHaveBeenCalled();
      expect(mockReqSandboxStorageStats).toHaveBeenCalled();
      expect(mockReqSandboxStorageRealTime).toHaveBeenCalled();
      expect(screen.getAllByText("2")).not.toHaveLength(0);
      expect(screen.getAllByText("2.00")).not.toHaveLength(0);
      expect(screen.getAllByText("$2.5")).toHaveLength(2);
    });

    await waitFor(() => {
      expect(mockChart.setOption).toHaveBeenCalled();
    });

    const exportButtons = screen.getAllByRole("button", { name: "Export" });
    fireEvent.click(exportButtons[0]);
    fireEvent.click(exportButtons[1]);
    fireEvent.click(exportButtons[2]);

    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.anything(),
      "Usage-Group.xlsx",
    );
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.anything(),
      "Usage-Storage.xlsx",
    );
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.anything(),
      "Usage-Cost.xlsx",
    );

    const templateButtons = screen.getAllByRole("button", {
      name: "choose template",
    });
    fireEvent.click(templateButtons[0]);
    fireEvent.click(templateButtons[1]);

    await waitFor(() => {
      expect(mockReqSandboxUsage).toHaveBeenLastCalledWith({
        templateId: "template-1",
      });
      expect(mockReqSandboxRunningCount).toHaveBeenLastCalledWith(
        expect.objectContaining({ templateId: "template-1" }),
      );
    });
  });

  it("shows no-data states and warns when exporting before data is available", async () => {
    mockReqSandboxUsage.mockResolvedValue({ usages: [] });
    mockReqSandboxRunningCount.mockResolvedValue({ stats: [] });
    mockReqSandboxStats.mockResolvedValue({ stats: [] });
    mockReqSandboxStorageStats.mockResolvedValue({ stats: [] });

    render(<Section />);

    fireEvent.click(screen.getAllByRole("button", { name: "Export" })[0]);
    expect(mockWarning).toHaveBeenCalledWith(
      "Please wait for the data to load",
    );

    await waitFor(() => {
      expect(mockChart.setOption).toHaveBeenCalled();
    });
    expect(screen.getByText("No Storage data found")).toBeInTheDocument();
    expect(screen.getByText("No cost data found")).toBeInTheDocument();
  });

  it("errors when a minute-level range exceeds one day", async () => {
    render(<Section />);
    await waitFor(() => expect(mockReqSandboxRunningCount).toHaveBeenCalled());

    mockReqSandboxRunningCount.mockClear();
    // The date-range mock picks 2026-01-10 -> 2026-01-11; with the default
    // "Minute" cycle this is rejected as too long for minute-level grouping.
    fireEvent.click(screen.getAllByRole("button", { name: /date range/ })[0]);

    await waitFor(() =>
      expect(message.error).toHaveBeenCalledWith(
        "The selected time range is too long for minute-level grouping. Please select 1 day",
      ),
    );
  });

  it("switches cycle grouping to Day and refetches stats", async () => {
    render(<Section />);
    await waitFor(() => expect(mockReqSandboxStats).toHaveBeenCalled());

    mockReqSandboxStats.mockClear();
    mockReqSandboxRunningCount.mockClear();
    // First toggle group controls the vCPU/RAM/sandbox cycleType -> "Day"
    fireEvent.click(screen.getAllByTestId("toggle-group")[0]);

    await waitFor(() =>
      expect(mockReqSandboxRunningCount).toHaveBeenLastCalledWith(
        expect.objectContaining({ cycleType: "Day" }),
      ),
    );
  });

  it("warns on cost export while still loading", async () => {
    // Keep the usage request pending so costLoading stays true
    mockReqSandboxUsage.mockReturnValue(new Promise(() => {}));
    render(<Section />);

    const exportButtons = screen.getAllByRole("button", { name: "Export" });
    // The last Export button maps to cost export
    fireEvent.click(exportButtons[exportButtons.length - 1]);
    expect(mockWarning).toHaveBeenCalledWith(
      "Please wait for the data to load",
    );
  });
});
