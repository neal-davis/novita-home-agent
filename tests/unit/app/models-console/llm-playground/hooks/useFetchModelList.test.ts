import { renderHook, waitFor } from "@testing-library/react";
import { useFetchModelList } from "@/app/models-console/llm-playground/hooks/useFetchModelList";
import { getFullLLMModelsWithCache } from "@/api/model";
import { getLLMDedicatedEndpointById } from "@/api/dedicated-endpoint";

jest.mock("@/api/model", () => ({
  getFullLLMModelsWithCache: jest.fn(),
}));
jest.mock("@/api/dedicated-endpoint", () => ({
  getLLMDedicatedEndpointById: jest.fn(),
}));

const mockGetModels = getFullLLMModelsWithCache as jest.Mock;
const mockGetEndpoint = getLLMDedicatedEndpointById as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => (console.error as jest.Mock).mockRestore?.());

describe("useFetchModelList (regular list)", () => {
  it("keeps only serverless models and selects the first", async () => {
    mockGetModels.mockResolvedValue([
      { id: "a", features: ["serverless"] },
      { id: "b", features: ["dedicated"] },
      { id: "c", features: "serverless" },
    ]);
    const { result } = renderHook(() => useFetchModelList());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.modelList.map((m) => m.id)).toEqual(["a", "c"]);
    expect(result.current.currentModel?.id).toBe("a");
    expect(result.current.error).toBeNull();
  });

  it("sets currentModel to null when there are no serverless models", async () => {
    mockGetModels.mockResolvedValue([{ id: "b", features: ["dedicated"] }]);
    const { result } = renderHook(() => useFetchModelList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.modelList).toEqual([]);
    expect(result.current.currentModel).toBeNull();
  });

  it("captures a fetch error", async () => {
    mockGetModels.mockRejectedValue(new Error("network down"));
    const { result } = renderHook(() => useFetchModelList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe("network down");
  });
});

describe("useFetchModelList (dedicated endpoint)", () => {
  it("builds a single model from a dedicated endpoint", async () => {
    mockGetEndpoint.mockResolvedValue({
      name: "My Endpoint",
      baseModel: { modelAlias: "alias-1", modelId: "raw-1" },
      engine: { config: { maxModelLen: 4096 } },
    });
    const { result } = renderHook(() =>
      useFetchModelList({ dedicatedEndpointId: "ep-1" }),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetModels).not.toHaveBeenCalled();
    expect(result.current.modelList).toHaveLength(1);
    const model = result.current.currentModel!;
    expect(model.id).toBe("alias-1");
    expect(model.displayName).toBe("My Endpoint");
    expect(model.context_size).toBe(4096);
    expect(model.max_output_tokens).toBe(2048);
  });

  it("errors when the endpoint is not found", async () => {
    mockGetEndpoint.mockResolvedValue(null);
    const { result } = renderHook(() =>
      useFetchModelList({ dedicatedEndpointId: "missing" }),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error?.message).toBe("Dedicated endpoint not found");
  });
});
