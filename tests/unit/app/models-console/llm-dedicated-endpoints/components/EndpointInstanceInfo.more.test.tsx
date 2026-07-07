import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EndpointInstanceInfo from "@/app/models-console/llm-dedicated-endpoints/components/EndpointInstanceInfo";
import {
  getLLMDedicatedSpec,
  getRecommendedEndpointConfig,
} from "@/api/dedicated-endpoint";

jest.mock("@/api/dedicated-endpoint", () => ({
  getLLMDedicatedSpec: jest.fn(),
  getRecommendedEndpointConfig: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: { warning: jest.fn(), error: jest.fn(), success: jest.fn() },
}));

jest.mock(
  "@/app/models-console/llm-dedicated-endpoints/components/form-field/InstanceField",
  () => ({
    __esModule: true,
    default: ({ selectedInstance }: any) => (
      <div>
        <span>selected:{selectedInstance?.gpuName ?? "none"}</span>
        <span>num:{selectedInstance?.gpuNum ?? "none"}</span>
      </div>
    ),
  }),
);

const mockGetSpec = getLLMDedicatedSpec as jest.Mock;
const mockGetRecommended = getRecommendedEndpointConfig as jest.Mock;

function setup(
  resources: any,
  baseModel: any = { modelId: "meta/m", token: "tok" },
) {
  const handleUpdate = jest.fn().mockResolvedValue(undefined);
  const syncEndpointData = jest.fn().mockResolvedValue(undefined);
  render(
    <EndpointInstanceInfo
      resources={resources as never}
      baseModel={baseModel as never}
      handleUpdate={handleUpdate}
      syncEndpointData={syncEndpointData}
    />,
  );
  return { handleUpdate, syncEndpointData };
}

describe("EndpointInstanceInfo (more branches)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSpec.mockResolvedValue({
      specs: [{ gpuName: "A100" }, { gpuName: "H100" }],
    });
  });

  it("keeps current gpu count when it is one of the offered gpuNums", async () => {
    mockGetRecommended.mockResolvedValue({
      engineType: "vllm",
      engineVersion: "1",
      resources: [{ gpuName: "A100", gpuNums: [1, 2, 4] }],
    });
    setup({
      gpu: { name: "A100", count: 2, cudaVersion: "12.1" },
      cpuNum: 8,
      memory: 32,
      storage: 100,
    });
    await waitFor(() => expect(mockGetRecommended).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await waitFor(() => screen.getByText("selected:A100"));
    expect(screen.getByText("num:2")).toBeInTheDocument();
  });

  it("falls back to the closest gpuNum <= current count when current is not offered", async () => {
    mockGetRecommended.mockResolvedValue({
      engineType: "vllm",
      engineVersion: "1",
      resources: [{ gpuName: "A100", gpuNums: [1, 2] }],
    });
    // current count 3 not in [1,2] -> closest <=3 is 2
    setup({
      gpu: { name: "A100", count: 3, cudaVersion: "12.1" },
      cpuNum: 8,
      memory: 32,
      storage: 100,
    });
    await waitFor(() => expect(mockGetRecommended).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await waitFor(() => screen.getByText("selected:A100"));
    expect(screen.getByText("num:2")).toBeInTheDocument();
  });

  it("falls back to min gpuNum when all offered are greater than current count", async () => {
    mockGetRecommended.mockResolvedValue({
      engineType: "vllm",
      engineVersion: "1",
      resources: [{ gpuName: "A100", gpuNums: [4, 8] }],
    });
    // current count 1 < all -> picks sorted min (4)
    setup({
      gpu: { name: "A100", count: 1, cudaVersion: "12.1" },
      cpuNum: 8,
      memory: 32,
      storage: 100,
    });
    await waitFor(() => expect(mockGetRecommended).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await waitFor(() => screen.getByText("selected:A100"));
    expect(screen.getByText("num:4")).toBeInTheDocument();
  });

  it("selects first instance when current gpu name has no match in recommended list", async () => {
    mockGetRecommended.mockResolvedValue({
      engineType: "vllm",
      engineVersion: "1",
      resources: [{ gpuName: "H100", gpuNums: [2] }],
    });
    setup({
      gpu: { name: "A100", count: 1, cudaVersion: "12.1" },
      cpuNum: 8,
      memory: 32,
      storage: 100,
    });
    await waitFor(() => expect(mockGetRecommended).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await waitFor(() => screen.getByText("selected:H100"));
    // gpuNums[0] used since name mismatched
    expect(screen.getByText("num:2")).toBeInTheDocument();
  });

  it("does not fetch recommended config when baseModel has no modelId", async () => {
    setup(
      {
        gpu: { name: "A100", count: 1 },
        cpuNum: 8,
        memory: 32,
        storage: 100,
      },
      { modelId: "", token: "" },
    );
    await waitFor(() => expect(mockGetSpec).toHaveBeenCalled());
    expect(mockGetRecommended).not.toHaveBeenCalled();
  });
});
