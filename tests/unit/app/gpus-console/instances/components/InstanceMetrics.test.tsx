import { render, screen, waitFor, act } from "@testing-library/react";
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

const fullMetrics = {
  cpuUtilization: [{ timestamp: "t", value: 40 }],
  memUtilization: [{ timestamp: "t", value: 55 }],
  rootDiskUtilization: [{ timestamp: "t", value: 12 }],
  gpuUtilization: {
    avg: [{ timestamp: "t", value: 80 }],
    gpuIds: [{ gpuId: "gpu0", items: [{ value: 81 }] }],
  },
  gpuMemUtilization: {
    avg: [{ timestamp: "t", value: 70 }],
    gpuIds: [{ gpuId: "gpu0", items: [{ value: 71 }] }],
  },
};

describe("InstanceMetrics", () => {
  let logSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    logSpy = jest.spyOn(console, "log").mockImplementation();
  });
  afterEach(() => logSpy.mockRestore());

  it("renders metric bars from a populated response", async () => {
    mockMetrics.mockResolvedValue(fullMetrics);
    render(<InstanceMetrics id="i-1" instanceInfo={{ cpuNum: 4 }} />);

    await waitFor(() =>
      expect(mockMetrics).toHaveBeenCalledWith({ instanceId: "i-1" }),
    );
    expect(
      await screen.findByText(/bar:CPU Utilization=10/),
    ).toBeInTheDocument();
    expect(screen.getByText(/bar:Mem Utilization=55/)).toBeInTheDocument();
    expect(screen.getByText(/bar:gpu0=81/)).toBeInTheDocument();
    expect(screen.getByText(/bar:gpu0=71/)).toBeInTheDocument();
  });

  it("uses zero fallbacks when arrays are empty", async () => {
    mockMetrics.mockResolvedValue({
      cpuUtilization: [],
      memUtilization: [],
      rootDiskUtilization: [],
      gpuUtilization: { avg: [] },
      gpuMemUtilization: { avg: [] },
    });
    render(<InstanceMetrics id="i-2" instanceInfo={{}} />);

    await waitFor(() => expect(mockMetrics).toHaveBeenCalled());
    expect(
      await screen.findByText(/bar:CPU Utilization=0/),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/bar:Avg=0/).length).toBeGreaterThan(0);
  });

  it("recovers to an empty metric set when the request fails", async () => {
    mockMetrics.mockRejectedValue(new Error("nope"));
    render(<InstanceMetrics id="i-3" instanceInfo={{}} />);

    await waitFor(() => expect(mockMetrics).toHaveBeenCalled());
    expect(
      await screen.findByText(/bar:CPU Utilization=0/),
    ).toBeInTheDocument();
  });

  it("does not fetch metrics without an id", async () => {
    render(<InstanceMetrics id="" instanceInfo={{}} />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockMetrics).not.toHaveBeenCalled();
  });
});
