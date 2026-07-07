import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

describe("sandbox singleMetrics", () => {
  let consoleLog: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
    mockMetrics.mockResolvedValue({
      cpuUtilizationMax: 80.5,
      cpuUtilizationAvg: 40.25,
      memUsedMBMax: 512,
      memUsedMBAvg: 256,
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
  afterEach(() => consoleLog.mockRestore());

  it("loads metrics and renders peak/avg labels and charts", async () => {
    renderInTable(
      <SingleMetrics state="running" sandboxID="sb-1" colCount={5} />,
    );

    await waitFor(() =>
      expect(mockMetrics).toHaveBeenCalledWith({
        sandboxId: "sb-1",
      }),
    );

    expect(
      screen.getByText(/Peak CPU Utilization: 80.50 %/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Average CPU Utilization: 40.25 %/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Memory Utilization Max: 512 MB/),
    ).toBeInTheDocument();
    expect(screen.getAllByTestId("line-chart")).toHaveLength(2);
  });

  it("does not render the paused tooltip when running", async () => {
    renderInTable(
      <SingleMetrics state="running" sandboxID="sb-1" colCount={5} />,
    );
    await waitFor(() => expect(mockMetrics).toHaveBeenCalled());
    expect(screen.queryByTestId("tooltip-content")).not.toBeInTheDocument();
  });

  it("renders the paused tooltip when state is paused", async () => {
    renderInTable(
      <SingleMetrics state="paused" sandboxID="sb-1" colCount={5} />,
    );
    await waitFor(() => expect(mockMetrics).toHaveBeenCalled());
    expect(screen.getByTestId("tooltip-content")).toBeInTheDocument();
  });

  it("refreshes metrics on click of the refresh button", async () => {
    const { container } = renderInTable(
      <SingleMetrics state="running" sandboxID="sb-1" colCount={5} />,
    );
    await waitFor(() => expect(mockMetrics).toHaveBeenCalledTimes(1));

    const refresh = container.querySelector(".icon-rotate")?.parentElement;
    fireEvent.click(refresh as Element);
    await waitFor(() => expect(mockMetrics).toHaveBeenCalledTimes(2));
  });
});
