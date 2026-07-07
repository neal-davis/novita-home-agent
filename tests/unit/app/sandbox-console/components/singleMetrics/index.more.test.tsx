import { act, render, screen, waitFor } from "@testing-library/react";
import SingleMetrics from "@/app/sandbox-console/components/singleMetrics";
import { reqSandboxMetrics } from "@/api/sandbox";

jest.mock("@/api/sandbox", () => ({ reqSandboxMetrics: jest.fn() }));

jest.mock("@tremor/react", () => ({
  LineChart: ({ categories }: { categories: string[] }) => (
    <div data-testid="line-chart">{categories.join(",")}</div>
  ),
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-content">{children}</div>
  ),
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

const mockMetrics = reqSandboxMetrics as jest.Mock;

function renderInTable(ui: React.ReactElement) {
  return render(
    <table>
      <tbody>{ui}</tbody>
    </table>,
  );
}

describe("sandbox singleMetrics (more branches)", () => {
  let consoleLog: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
    mockMetrics.mockResolvedValue({
      cpuUtilizationMax: 10,
      cpuUtilizationAvg: 5,
      memUsedMBMax: 100,
      memUsedMBAvg: 50,
      items: [
        {
          timestamp: "1767225600",
          cpuUtilization: 50,
          memTotalMB: 1024,
          memUsedMB: 256,
        },
      ],
    });
  });
  afterEach(() => {
    consoleLog.mockRestore();
    jest.useRealTimers();
  });

  it("shows a 'Seconds ago' counter that increments with the interval timer", async () => {
    renderInTable(
      <SingleMetrics state="running" sandboxID="sb-9" colCount={5} />,
    );

    // Resolve the initial fetch so metricTimeStrap is set.
    await act(async () => {
      await Promise.resolve();
    });

    // Advance the 1s interval a few ticks; the elapsed-seconds label updates.
    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() =>
      expect(screen.getByText("Seconds ago")).toBeInTheDocument(),
    );
    // Counter rendered a numeric value (not the "/" placeholder).
    const counter = screen.getByText("Seconds ago").previousSibling as Element;
    expect(counter.textContent).not.toBe("/");
  });

  it("auto-refreshes the metrics once more than 60 seconds elapse", async () => {
    renderInTable(
      <SingleMetrics state="running" sandboxID="sb-9" colCount={5} />,
    );

    await act(async () => {
      await Promise.resolve();
    });
    expect(mockMetrics).toHaveBeenCalledTimes(1);

    // Cross the 60s threshold -> triggers an automatic refetch.
    await act(async () => {
      jest.advanceTimersByTime(61000);
      await Promise.resolve();
    });

    await waitFor(() => expect(mockMetrics).toHaveBeenCalledTimes(2));
  });
});
