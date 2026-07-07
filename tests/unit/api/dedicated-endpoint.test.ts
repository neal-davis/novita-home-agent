jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

jest.mock("@/api/api", () => ({
  request: jest.fn(),
  requestInServerEnv: jest.fn(),
}));

import { request, requestInServerEnv } from "@/api/api";
import Cookies from "js-cookie";
import {
  checkHfBaseModel,
  checkLoraAdapters,
  createLLMDedicatedEndpoint,
  deleteLLMDedicatedEndpoint,
  getHfModel,
  getLLMDedicatedEndpointById,
  getLLMDedicatedEndpointByIdInServerEnv,
  getLLMDedicatedEndpointChangeHistory,
  getLLMDedicatedEndpointList,
  getLLMDedicatedEndpointMetrics,
  getLLMDedicatedEndpointMetrics24h,
  getLLMDedicatedEngineVersions,
  getLLMDedicatedSpec,
  getLLMDedicatedUserInfo,
  getModelDetailConfigs,
  getModelDetailConfigsInServerEnv,
  getModelReadmeContent,
  getReadmeContent,
  getRecommendedEndpointConfig,
  restartLLMDedicatedEndpoint,
  stopLLMDedicatedEndpoint,
  updateLLMDedicatedEndpoint,
} from "@/api/dedicated-endpoint";

const mockRequest = request as jest.Mock;
const mockRequestInServerEnv = requestInServerEnv as jest.Mock;
const mockCookiesGet = Cookies.get as jest.Mock;
const mockFetch = global.fetch as jest.Mock;

describe("dedicated endpoint API wrappers", () => {
  const signal = new AbortController().signal;

  beforeEach(() => {
    mockCookiesGet.mockReset();
    mockFetch.mockReset();
    mockRequest.mockResolvedValue({});
    mockRequestInServerEnv.mockResolvedValue({});
    jest.clearAllMocks();
  });

  it("builds endpoint list filters only for present filter values", () => {
    getLLMDedicatedEndpointList({
      pageSize: 20,
      pageNum: 2,
      sortKey: "newest",
      filter: {
        id: "endpoint-1",
        status: "running",
        endpointName: "chat",
      },
      signal,
    });

    expect(mockRequest).toHaveBeenCalledWith({
      url: "/api/v1/llm/dedicated/endpoint",
      query: {
        pageSize: 20,
        pageNum: 2,
        sortKey: "newest",
        "filter.id": "endpoint-1",
        "filter.status": "running",
        "filter.query": "chat",
      },
      signal,
    });
  });

  it("returns endpoint by id from both browser and server environment requests", async () => {
    const endpoint = { id: "endpoint-1", name: "Endpoint" };
    mockRequest.mockResolvedValueOnce({ endpoints: [endpoint] });
    await expect(
      getLLMDedicatedEndpointById({ id: "endpoint-1", signal }),
    ).resolves.toBe(endpoint);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/llm/dedicated/endpoint",
      query: {
        pageSize: 1,
        pageNum: 1,
        sortKey: "newest",
        "filter.id": "endpoint-1",
      },
      signal,
    });

    mockRequestInServerEnv.mockResolvedValueOnce({ endpoints: [endpoint] });
    await expect(
      getLLMDedicatedEndpointByIdInServerEnv("endpoint-1", "server-token"),
    ).resolves.toBe(endpoint);
    expect(mockRequestInServerEnv).toHaveBeenLastCalledWith({
      method: "GET",
      url: "/api/v1/llm/dedicated/endpoint?pageSize=1&pageNum=1&sortKey=newest&filter.id=endpoint-1",
      token: "server-token",
    });
  });

  it("builds endpoint mutation payloads", () => {
    const endpointParams = {
      name: "Endpoint",
      resources: { gpuName: "A10", gpuNum: 1 } as any,
      scalingPolicy: { minReplicas: 0, maxReplicas: 1 } as any,
      engine: { engineType: "vllm", engineVersion: "latest" } as any,
      baseModel: {
        provider: "huggingface",
        modelId: "owner/model",
        token: "hf-token",
      },
      loras: [],
      isSuffixDecodingEnable: true,
      signal,
    };

    createLLMDedicatedEndpoint(endpointParams);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/llm/dedicated/endpoint",
      method: "POST",
      data: { endpoint: endpointParams },
      signal,
    });

    updateLLMDedicatedEndpoint({
      id: "endpoint-1",
      updateData: { name: "Updated" },
      signal,
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/llm/dedicated/endpoint",
      method: "PUT",
      data: {
        id: "endpoint-1",
        updateData: { name: "Updated" },
        signal,
      },
      signal,
    });

    stopLLMDedicatedEndpoint({ id: "endpoint-1", force: true, signal });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/llm/dedicated/endpoint/stop",
      method: "PUT",
      data: { id: "endpoint-1", force: true },
      signal,
    });

    restartLLMDedicatedEndpoint({ id: "endpoint-1", signal });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/llm/dedicated/endpoint/recovery",
      method: "PUT",
      data: { id: "endpoint-1" },
      signal,
    });

    deleteLLMDedicatedEndpoint({ id: "endpoint-1", signal });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/llm/dedicated/endpoint",
      method: "DELETE",
      query: { id: "endpoint-1" },
      signal,
    });
  });

  it("selects authenticated spec endpoint when token cookie exists", () => {
    mockCookiesGet.mockReturnValueOnce("token");

    getLLMDedicatedSpec({ gpuName: "A10", signal });

    expect(mockRequest).toHaveBeenCalledWith({
      url: "/api/v1/llm/dedicated/auth/spec",
      query: { "filter.gpuName": "A10" },
      signal,
    });
  });

  it("uses public spec endpoint and omits empty filters without an auth token", () => {
    mockCookiesGet.mockReturnValueOnce(undefined);

    getLLMDedicatedSpec({ signal });

    expect(mockRequest).toHaveBeenCalledWith({
      url: "/api/v1/llm/dedicated/spec",
      query: {},
      signal,
    });
  });

  it("builds HuggingFace validation and LoRA compatibility requests", () => {
    getHfModel({ modelId: "owner/model", token: "hf-token", signal });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/huggingface/model",
      query: { modelId: "owner/model", token: "hf-token", limit: 30 },
      signal,
    });

    checkHfBaseModel({
      modelId: "owner/model",
      token: "hf-token",
      revision: "main",
      signal,
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/huggingface/model/check",
      query: {
        modelId: "owner/model",
        token: "hf-token",
        revision: "main",
      },
      signal,
      ignoreMsg: true,
    });

    checkLoraAdapters({
      baseModel: "owner/model",
      hfToken: "hf-token",
      loraAdapters: ["adapter-a"],
      signal,
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/cluster/api/v1/check-lora-adapters",
      method: "POST",
      data: {
        baseModel: "owner/model",
        hfToken: "hf-token",
        loraAdapters: ["adapter-a"],
      },
      signal,
      ignoreMsg: true,
    });

    checkHfBaseModel({ modelId: "owner/model", signal });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/huggingface/model/check",
      query: { modelId: "owner/model" },
      signal,
      ignoreMsg: true,
    });

    checkLoraAdapters({
      baseModel: "owner/model",
      loraAdapters: [],
      signal,
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/cluster/api/v1/check-lora-adapters",
      method: "POST",
      data: {
        baseModel: "owner/model",
        loraAdapters: [],
      },
      signal,
      ignoreMsg: true,
    });
  });

  it("builds readme and model detail config requests", () => {
    getReadmeContent();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/product/content-blocks?keys=LLM_DE_LIST_README&keys=LLM_DE_CREATE_README&keys=LLM_DE_DETAIL_README",
    });

    getModelReadmeContent("owner/model");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/v1/product/content-blocks?keys=HOW_TO_USE_README_owner-model&keys=MODEL_CARD_README_owner-model&keys=PROMPTING_README_owner-model&keys=APPLICATIONS_README_owner-model",
    });

    getModelDetailConfigs("owner/model");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/model-detail-configs",
      query: { modelId: "owner/model" },
    });
  });

  it("fetches server-side model detail configs and handles missing configs", async () => {
    mockFetch.mockResolvedValueOnce({
      status: 200,
      json: jest.fn().mockResolvedValue({
        data: [
          { attributes: { modelId: "other-model", title: "Other" } },
          { attributes: { modelId: "owner-model", title: "Matched" } },
        ],
      }),
    });

    await expect(
      getModelDetailConfigsInServerEnv("owner/model"),
    ).resolves.toMatchObject({
      matchedConfig: { modelId: "owner-model", title: "Matched" },
    });
    expect(mockFetch).toHaveBeenLastCalledWith(
      "https://api-strapi-staging.pplabs.tech/api/model-detail-configs",
      expect.objectContaining({
        cache: "no-cache",
        headers: { "Content-Type": "application/json" },
        method: "GET",
        mode: "cors",
      }),
    );

    mockFetch.mockResolvedValueOnce({
      status: 404,
      json: jest.fn(),
    });
    await expect(
      getModelDetailConfigsInServerEnv("missing/model"),
    ).resolves.toEqual({
      code: 404,
      reason: "UNKNOWN_ERROR",
    });
  });

  it("rethrows server-side model detail config fetch failures", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    mockFetch.mockRejectedValueOnce(new Error("network"));

    await expect(
      getModelDetailConfigsInServerEnv("owner/model"),
    ).rejects.toThrow("network");
    expect(consoleError).toHaveBeenCalledWith(
      "🌐 [API] Fetch error:",
      expect.any(Error),
    );

    consoleError.mockRestore();
  });

  it("builds recommendation, history and metrics requests", () => {
    getLLMDedicatedEngineVersions({ engineType: "vllm", signal });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/llm/dedicated/engine/versions",
      query: { engineType: "vllm" },
      signal,
    });

    getRecommendedEndpointConfig({
      modelId: "owner/model",
      hfToken: "hf-token",
      loras: [
        { modelId: "lora/model", name: "adapter", provider: "huggingface" },
      ],
      source: "novita",
      signal,
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/llm/dedicated/recommended-endpoint-specs",
      method: "POST",
      data: {
        modelId: "owner/model",
        hfToken: "hf-token",
        loras: [
          { modelId: "lora/model", name: "adapter", provider: "huggingface" },
        ],
        source: "novita",
      },
      signal,
      ignoreMsg: true,
    });

    getRecommendedEndpointConfig({
      modelId: "owner/model",
      signal,
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/llm/dedicated/recommended-endpoint-specs",
      method: "POST",
      data: { modelId: "owner/model" },
      signal,
      ignoreMsg: true,
    });

    getLLMDedicatedUserInfo();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/llm/dedicated/user/info",
    });

    getLLMDedicatedEndpointChangeHistory({
      endpointId: "endpoint-1",
      pageNum: 1,
      pageSize: 10,
      sortKey: "newest",
      signal,
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/llm/dedicated/endpoint/change-history",
      query: {
        endpointId: "endpoint-1",
        pageNum: 1,
        pageSize: 10,
        sortKey: "newest",
      },
      signal,
    });

    getLLMDedicatedEndpointChangeHistory({
      endpointId: "endpoint-1",
      pageNum: 1,
      pageSize: 10,
      signal,
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/llm/dedicated/endpoint/change-history",
      query: {
        endpointId: "endpoint-1",
        pageNum: 1,
        pageSize: 10,
      },
      signal,
    });

    getLLMDedicatedEndpointMetrics({
      endpointId: "endpoint-1",
      metricName: "ttft_p50",
      startTime: "2026-01-01",
      endTime: "2026-01-02",
      signal,
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/llm/dedicated/endpoint/metrics",
      query: {
        endpointId: "endpoint-1",
        metricName: "ttft_p50",
        startTime: "2026-01-01",
        endTime: "2026-01-02",
      },
      signal,
    });

    getLLMDedicatedEndpointMetrics24h({ endpointId: "endpoint-1", signal });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/api/v1/llm/dedicated/endpoint/metrics24h",
      query: { endpointId: "endpoint-1" },
      signal,
    });
  });
});
