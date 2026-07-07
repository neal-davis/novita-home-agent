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

describe("useFetchModelList (more branches)", () => {
  it("uses modelId and falls back to 0 max tokens when engine config is missing", async () => {
    mockGetEndpoint.mockResolvedValue({
      // no name -> displayName falls back to modelId; no modelAlias -> uses modelId
      baseModel: { modelId: "raw-99" },
      engine: undefined,
    });
    const { result } = renderHook(() =>
      useFetchModelList({ dedicatedEndpointId: "ep-2" }),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const model = result.current.currentModel!;
    expect(model.id).toBe("raw-99");
    expect(model.displayName).toBe("raw-99");
    expect(model.context_size).toBe(0);
    expect(model.max_output_tokens).toBe(0);
  });

  it("filters out models with non-string or empty feature entries", async () => {
    mockGetModels.mockResolvedValue([
      { id: "ok", features: ["serverless"] },
      { id: "empty-feature", features: [""] },
      { id: "non-string", features: [123] },
      { id: "no-features" },
    ]);
    const { result } = renderHook(() => useFetchModelList());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.modelList.map((m) => m.id)).toEqual(["ok"]);
  });
});
