import { fireEvent, render, screen } from "@testing-library/react";
import WorkerManager from "@/app/gpus-console/serverless/components/Worker/WorkerManager";
import { WORKER_STATE } from "@/api/gpu-instance/serverless";

jest.mock("@/components/ui/standard/tooltip", () => ({
  AppTooltip: ({ children, title }: any) => (
    <span data-tooltip={typeof title === "string" ? title : undefined}>
      {children}
    </span>
  ),
}));

jest.mock("@/app/gpus-console/components/InstanceLog", () => ({
  __esModule: true,
  default: ({ address }: any) => <div>worker log {address}</div>,
}));

const workers: any[] = [
  {
    id: "worker-1",
    state: WORKER_STATE.RUNNING,
    healthy: true,
    logAddress: "addr-1",
  },
  {
    id: "worker-2",
    state: WORKER_STATE.RUNNING,
    healthy: false,
    logAddress: "addr-2",
  },
  {
    id: "worker-3",
    state: WORKER_STATE.PENDING,
    healthy: true,
    logAddress: "addr-3",
  },
];

describe("WorkerManager", () => {
  it("renders one nav item per worker and shows the first worker log by default", () => {
    render(<WorkerManager workers={workers} />);

    expect(screen.getByText("worker-1")).toBeInTheDocument();
    expect(screen.getByText("worker-2")).toBeInTheDocument();
    expect(screen.getByText("worker-3")).toBeInTheDocument();
    expect(screen.getByText("worker log addr-1")).toBeInTheDocument();
  });

  it("switches the active log when another worker is clicked", () => {
    render(<WorkerManager workers={workers} />);

    fireEvent.click(screen.getByText("worker-3"));
    expect(screen.getByText("worker log addr-3")).toBeInTheDocument();
  });

  it("surfaces the health-check-failed tooltip for an unhealthy running worker", () => {
    render(<WorkerManager workers={workers} />);

    expect(
      screen.getByText("worker-2").closest("[data-tooltip]"),
    ).toHaveAttribute("data-tooltip", "Health check failed");
    expect(
      screen.getByText("worker-1").closest("[data-tooltip]"),
    ).toHaveAttribute("data-tooltip", "Click to view Worker Logs");
  });

  it("falls back to the first worker when the selected worker disappears", () => {
    const { rerender } = render(<WorkerManager workers={workers} />);
    fireEvent.click(screen.getByText("worker-2"));
    expect(screen.getByText("worker log addr-2")).toBeInTheDocument();

    rerender(<WorkerManager workers={[workers[0], workers[2]]} />);
    expect(screen.getByText("worker log addr-1")).toBeInTheDocument();
  });
});
