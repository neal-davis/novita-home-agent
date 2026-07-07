import { render, screen, waitFor } from "@testing-library/react";
import InstanceMetrics from "@/app/gpus-console/instances/components/InstanceMetrics";
import { reqMetricsGpuInstance } from "@/api/gpu-instance/instances";

jest.mock("@/api/gpu-instance/instances", () => ({
  reqMetricsGpuInstance: jest.fn(),
}));
jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div>skeleton</div>,
}));
jest.mock("@/app/gpus-console/instances/components/metricBar", () => ({
  __esModule: true,
  default: ({ data }: any) => (
    <div>
      {data.map((d: any, i: number) => (
        <span key={i}>
          bar:{d.name}={String(d.value)}
        </span>
      ))}
    </div>
  ),
}));

const mockMetrics = reqMetricsGpuInstance as jest.Mock;

describe("InstanceMetrics more branches", () => {
  let logSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => logSpy.mockRestore());

  it("shows skeletons while the metrics request is pending", () => {
    let resolve: (v: any) => void = () => {};
    mockMetrics.mockReturnValue(
      new Promise((r) => {
        resolve = r;
      }),
    );
    render(<InstanceMetrics id="i-load" instanceInfo={{}} />);
    // loading branch: skeleton placeholders rendered before resolution
    expect(screen.getAllByText("skeleton").length).toBeGreaterThan(0);
    resolve({});
  });

  it("returns empty gpu arrays when avg has data but no gpuIds", async () => {
    mockMetrics.mockResolvedValue({
      cpuUtilization: [{ timestamp: "t", value: 20 }],
      memUtilization: [{ timestamp: "t", value: 30 }],
      rootDiskUtilization: [{ timestamp: "t", value: 5 }],
      gpuUtilization: { avg: [{ timestamp: "t", value: 90 }] },
      gpuMemUtilization: { avg: [{ timestamp: "t", value: 60 }] },
    });
    render(<InstanceMetrics id="i-noids" instanceInfo={{ cpuNum: 2 }} />);
    await waitFor(() => expect(mockMetrics).toHaveBeenCalled());
    // avg values flow through, but no per-gpu bars are added
    expect(await screen.findByText(/bar:Avg=90/)).toBeInTheDocument();
    expect(screen.getByText(/bar:Avg=60/)).toBeInTheDocument();
    // CPU value divided by cpuNum (20 / 2 = 10)
    expect(screen.getByText(/bar:CPU Utilization=10/)).toBeInTheDocument();
  });

  it("falls back to zero for a gpu whose items array is empty", async () => {
    mockMetrics.mockResolvedValue({
      cpuUtilization: [{ timestamp: "t", value: 8 }],
      memUtilization: [],
      rootDiskUtilization: [],
      gpuUtilization: {
        avg: [{ timestamp: "t", value: 50 }],
        gpuIds: [{ gpuId: "gpu-empty", items: [] }],
      },
      gpuMemUtilization: {
        avg: [{ timestamp: "t", value: 40 }],
        gpuIds: [{ gpuId: "gpu-empty-mem", items: [] }],
      },
    });
    render(<InstanceMetrics id="i-empty-items" instanceInfo={{}} />);
    await waitFor(() => expect(mockMetrics).toHaveBeenCalled());
    expect(await screen.findByText(/bar:gpu-empty=0/)).toBeInTheDocument();
    expect(screen.getByText(/bar:gpu-empty-mem=0/)).toBeInTheDocument();
  });
});
