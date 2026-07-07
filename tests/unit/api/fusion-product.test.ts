jest.mock("@/api/api", () => ({
  request: jest.fn(),
  service_base_url: "https://service.example.test",
}));

import { request } from "@/api/api";
import {
  fetchMultimodalPlaygroundConfig,
  getEnabledFusionProductConfigs,
  getEnabledFusionProductConfigsForServer,
} from "@/api/fusion-product";

const mockRequest = request as jest.Mock;
const mockFetch = global.fetch as jest.Mock;
let mockConsoleWarn: jest.SpyInstance;

function config(name: string, priceConfig?: unknown) {
  return {
    fusionConfig: { name },
    modelConfig: {
      config: {
        name,
        ...(priceConfig !== undefined ? { priceConfig } : {}),
      },
    },
  };
}

function jsonFetchResponse(body: unknown, ok = true, status = 200) {
  return {
    json: jest.fn().mockResolvedValue(body),
    ok,
    status,
  };
}

describe("fusion product API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleWarn = jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    mockConsoleWarn.mockRestore();
  });

  it("fetches multimodal playground config from the client API", async () => {
    mockRequest.mockResolvedValueOnce({ configs: [{ id: "cfg-1" }] });

    await expect(fetchMultimodalPlaygroundConfig(["model-a"])).resolves.toEqual(
      [{ id: "cfg-1" }],
    );
    expect(mockRequest).toHaveBeenCalledWith({
      method: "GET",
      query: { returnSchema: true },
      url: "/v1/product/multimodal-model/list",
    });
  });

  it("parses client-side priceConfig JSON and handles invalid responses", async () => {
    mockRequest.mockResolvedValueOnce({
      configs: [
        config("priced", JSON.stringify({ unit: "image" })),
        config("plain"),
        config("broken", "{"),
      ],
      total: 3,
    });

    await expect(getEnabledFusionProductConfigs("priced")).resolves.toEqual([
      expect.objectContaining({
        fusionConfig: { name: "priced" },
        pricingConfig: { unit: "image" },
      }),
      expect.objectContaining({ fusionConfig: { name: "plain" } }),
      expect.objectContaining({ fusionConfig: { name: "broken" } }),
    ]);
    expect(mockRequest).toHaveBeenCalledWith({
      method: "GET",
      query: {
        fusion_product_names: "priced",
        returnSchema: true,
      },
      url: "/v1/product/multimodal-model/list",
    });
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      "Failed to parse priceConfig for model:",
      "broken",
      expect.any(SyntaxError),
    );

    mockRequest.mockRejectedValueOnce(new Error("request failed"));
    await expect(getEnabledFusionProductConfigs()).resolves.toEqual([]);
  });

  it("fetches server-side configs with cached native fetch", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonFetchResponse({
        configs: [config("server", JSON.stringify({ unit: "token" }))],
        total: 1,
      }),
    );

    await expect(
      getEnabledFusionProductConfigsForServer("server"),
    ).resolves.toEqual([
      expect.objectContaining({
        fusionConfig: { name: "server" },
        pricingConfig: { unit: "token" },
      }),
    ]);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://service.example.test/v1/product/multimodal-model/list?returnSchema=true&fusion_product_names=server",
      expect.objectContaining({
        headers: { "Content-Type": "application/json" },
        method: "GET",
        next: { revalidate: 60 },
      }),
    );
  });

  it("returns empty server-side configs for non-ok and thrown fetches", async () => {
    mockFetch.mockResolvedValueOnce(jsonFetchResponse({}, false, 500));
    await expect(getEnabledFusionProductConfigsForServer()).resolves.toEqual(
      [],
    );
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      "Failed to fetch product configs: 500",
    );

    mockFetch.mockRejectedValueOnce(new Error("fetch failed"));
    await expect(getEnabledFusionProductConfigsForServer()).resolves.toEqual(
      [],
    );
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      "Error fetching product configs:",
      expect.any(Error),
    );
  });
});
