import { act, renderHook, waitFor } from "@testing-library/react";
import { z } from "zod";
import {
  createLLMDedicatedEndpoint,
  getLLMDedicatedEndpointList,
  getLLMDedicatedSpec,
  getRecommendedEndpointConfig,
} from "@/api/dedicated-endpoint";
import { getFullLLMModels } from "@/api/model";
import analytics from "@/app/components/analytics/analytics";
import { message } from "@/components/ui/standard/notify";
import { useCreateEndpointForm } from "@/app/models-console/llm-dedicated-endpoints/sub-pages/CreateEndpoint/useCreateEndpointForm";

jest.mock("@/api/dedicated-endpoint", () => ({
  createLLMDedicatedEndpoint: jest.fn(),
  getLLMDedicatedEndpointList: jest.fn(),
  getLLMDedicatedSpec: jest.fn(),
  getRecommendedEndpointConfig: jest.fn(),
}));

jest.mock("@/api/model", () => ({
  getFullLLMModels: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    success: jest.fn(),
  },
}));

jest.mock("@/app/components/analytics/analytics", () => ({
  __esModule: true,
  default: {
    trackClick: jest.fn(),
  },
}));

const mockCreateEndpoint = createLLMDedicatedEndpoint as jest.Mock;
const mockGetEndpointList = getLLMDedicatedEndpointList as jest.Mock;
const mockGetSpec = getLLMDedicatedSpec as jest.Mock;
const mockGetRecommendedConfig = getRecommendedEndpointConfig as jest.Mock;
const mockGetModels = getFullLLMModels as jest.Mock;
const mockTrackClick = analytics.trackClick as jest.Mock;
const mockMessageSuccess = message.success as jest.Mock;

const gpuSpec = {
  gpuDisplayName: "NVIDIA L40S",
  gpuName: "L40S",
  price: 1.2,
} as any;

function setupHook(initialModelId?: string) {
  const goToListPage = jest.fn();
  const goToDetail = jest.fn();
  const hook = renderHook(() =>
    useCreateEndpointForm({
      goToDetail,
      goToListPage,
      initialModelId,
    }),
  );

  return {
    ...hook,
    goToDetail,
    goToListPage,
  };
}

describe("useCreateEndpointForm", () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    mockGetSpec.mockResolvedValue({
      specs: [gpuSpec],
    });
    mockGetEndpointList.mockResolvedValue({
      endpoints: [],
    });
    mockGetRecommendedConfig.mockResolvedValue({
      engineType: "vllm",
      engineVersion: "0.8",
      resources: [
        {
          gpuName: "L40S",
          gpuNums: [2, 4],
        },
      ],
    });
    mockCreateEndpoint.mockResolvedValue({
      endpoint: {
        id: "endpoint-1",
        name: "endpoint-one",
      },
    });
    mockGetModels.mockResolvedValue([
      {
        displayName: "Llama 3.1 8B",
        hf_mirror_url: "novita/llama-3-1-8b",
        id: "meta-llama/Llama-3.1-8B",
        name: "llama",
      },
    ]);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("initializes an initial Novita model and derives recommended GPU instances", async () => {
    const { result } = setupHook("meta-llama-Llama-3.1-8B");

    expect(result.current.isInitializingModel).toBe(true);

    await waitFor(() =>
      expect(result.current.modelValue).toMatchObject({
        modelId: "novita/llama-3-1-8b",
        provider: "novita",
      }),
    );
    act(() => {
      result.current.setModelCheckStatus("success");
    });
    await waitFor(() =>
      expect(result.current.instanceInfo).toMatchObject({
        gpuName: "L40S",
        gpuNum: 2,
        gpuNums: [2, 4],
      }),
    );

    expect(result.current.endpointName).toBe("llama-3-1-8b");
    expect(mockGetRecommendedConfig).toHaveBeenCalledWith({
      modelId: "novita/llama-3-1-8b",
      source: "self_hosting",
    });
    expect(mockTrackClick).toHaveBeenCalledWith(expect.any(String), {
      modelId: "novita/llama-3-1-8b",
    });
    expect(result.current.isInitializingModel).toBe(false);
  });

  it("submits a valid Hugging Face endpoint with autoscaling, engine and LoRA payload", async () => {
    const { result, goToDetail, goToListPage } = setupHook();

    await waitFor(() => expect(mockGetSpec).toHaveBeenCalled());

    await act(async () => {
      result.current.setEndpointName("my-endpoint");
      result.current.setModelValue({
        loraAdapters: [
          {
            modelAlias: "adapter-a",
            modelId: "owner/adapter-a",
          },
          {
            modelAlias: "",
            modelId: "owner/adapter-b",
          },
        ],
        modelId: "owner/base-model",
        provider: "huggingface",
        token: "hf-token",
      });
      result.current.setAutoscalingInfo({
        cooldownPeriod: 600,
        enabled: true,
        maxReplicas: 5,
        minReplicas: 2,
      });
      result.current.setEngineValue({
        isSuffixDecodingEnable: true,
        maxNumSeqs: 32,
      });
      result.current.setModelCheckStatus("success");
    });

    await waitFor(() =>
      expect(mockGetRecommendedConfig).toHaveBeenCalledWith({
        hfToken: "hf-token",
        loras: [
          {
            modelId: "owner/adapter-a",
            name: "adapter-a",
            provider: "huggingface",
          },
          {
            modelId: "owner/adapter-b",
            name: "",
            provider: "huggingface",
          },
        ],
        modelId: "owner/base-model",
      }),
    );
    await waitFor(() =>
      expect(result.current.instanceInfo).toMatchObject({
        gpuName: "L40S",
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockCreateEndpoint).toHaveBeenCalledWith({
      baseModel: {
        modelId: "owner/base-model",
        provider: "huggingface",
        token: "hf-token",
      },
      engine: {
        config: {
          maxNumSeqs: 32,
        },
      },
      isSuffixDecodingEnable: true,
      loras: [
        {
          modelId: "owner/adapter-a",
          name: "adapter-a",
          provider: "huggingface",
          token: "hf-token",
        },
        {
          modelId: "owner/adapter-b",
          provider: "huggingface",
          token: "hf-token",
        },
      ],
      name: "my-endpoint",
      resources: {
        gpu: {
          count: 2,
          name: "L40S",
        },
      },
      scalingPolicy: {
        coolDownPeriod: 600,
        enable: true,
        maxReplicas: 5,
        minReplicas: 2,
      },
    });
    expect(mockMessageSuccess).toHaveBeenCalledWith(
      "Endpoint created successfully",
    );
    expect(goToDetail).toHaveBeenCalledWith({
      id: "endpoint-1",
      name: "endpoint-one",
    });
    expect(goToListPage).not.toHaveBeenCalled();
  });

  it("validates before submit, clears field errors and debounces duplicate name checks", async () => {
    jest.useFakeTimers();
    mockGetEndpointList.mockResolvedValueOnce({
      endpoints: [{ id: "existing" }],
    });
    const { result } = setupHook();
    const nameField = document.createElement("div");
    nameField.scrollIntoView = jest.fn();
    (
      result.current.refs.nameFieldRef as { current: HTMLDivElement | null }
    ).current = nameField;

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(mockCreateEndpoint).not.toHaveBeenCalled();
    expect(result.current.validationErrors.name).toBeTruthy();
    expect(nameField.scrollIntoView).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "center",
    });

    act(() => {
      result.current.validateField(
        "name",
        "ok-name",
        z.string().min(3, "bad name"),
      );
    });
    expect(result.current.validationErrors.name).toBeUndefined();

    act(() => {
      result.current.checkEndpointNameExists("existing-endpoint");
      jest.advanceTimersByTime(500);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockGetEndpointList).toHaveBeenCalledWith({
      filter: {
        endpointName: "existing-endpoint",
      },
      pageNum: 1,
      pageSize: 1,
      sortKey: "newest",
    });
    expect(result.current.validationErrors.name).toBe(
      "An endpoint with this name already exists",
    );
    jest.useRealTimers();
  });

  it("falls back to the list page when create response has no endpoint id", async () => {
    mockCreateEndpoint.mockResolvedValueOnce({});
    const { result, goToDetail, goToListPage } = setupHook();

    await waitFor(() => expect(mockGetSpec).toHaveBeenCalled());

    await act(async () => {
      result.current.setEndpointName("list-fallback");
      result.current.setModelValue({
        loraAdapters: [],
        modelId: "owner/base-model",
        provider: "huggingface",
        token: "",
      });
      result.current.setModelCheckStatus("success");
    });
    await waitFor(() =>
      expect(result.current.instanceInfo).toMatchObject({
        gpuName: "L40S",
      }),
    );

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(goToDetail).not.toHaveBeenCalled();
    expect(goToListPage).toHaveBeenCalledTimes(1);
  });
});
