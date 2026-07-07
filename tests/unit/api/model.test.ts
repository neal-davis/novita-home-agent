import { TEST_SERVICE_BASE_URL, withEnv } from "../helpers/env";
import {
  getCivitaiModelDetails,
  getEmbeddingModelList,
  getFullLLMModelsWithCache,
  getFullLLMModels,
  getLLMOnDemandModels,
  getModelList,
  getModelDetail,
  getModels,
  getRerankerModelList,
  searchCivitaiModel,
} from "@/api/model";
import { LLMModelStatus, ModelLabelMap } from "@/types/models";

const mockFetch = global.fetch as jest.Mock;

const rawLlmModel = (id: string, modelType = "chat") => ({
  id,
  title: `vendor/${id}`,
  display_name: `Display ${id}`,
  description: "description",
  context_size: 4096,
  input_token_price_per_m: 10000,
  output_token_price_per_m: 20000,
  input_modalities: ["text"],
  output_modalities: ["text"],
  features: [],
  model_type: modelType,
  status: 1,
});

const jsonResponse = (data: unknown, ok = true, status = 200) =>
  Promise.resolve({
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response);

describe("model API helpers", () => {
  let consoleError: jest.SpyInstance;
  let consoleLog: jest.SpyInstance;

  beforeAll(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterAll(() => {
    consoleError.mockRestore();
    consoleLog.mockRestore();
  });

  it("builds model list query params and filters inactive model records", async () => {
    mockFetch.mockResolvedValueOnce(
      await jsonResponse({
        models: [
          { id: 1, status: 1, sd_name: "Active" },
          { id: 2, status: 0, sd_name: "Inactive" },
        ],
        pagination: { next_cursor: "c_100" },
      }),
    );

    await expect(
      getModels({
        pageIndex: 2,
        pageSize: 50,
        type: "checkpoint",
        visibility: "public",
        filter: {
          source: "civitai",
          tags: "ALL",
          query: "anime",
          base_model: "SD XL",
          is_sdxl: true,
          is_inpainting: false,
          model_version_id: 123,
          in_whitelist: true,
        },
        fetchId: 7,
      }),
    ).resolves.toEqual({
      models: [{ id: 1, status: 1, sd_name: "Active" }],
      nextCursor: "c_100",
      fetchId: 7,
    });

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toContain("/v3/model?");
    expect(url).toContain("pagination.limit=50");
    expect(url).toContain("pagination.cursor=c_100");
    expect(url).toContain("filter.query=anime");
    expect(url).toContain("filter.is_sdxl=1");
    expect(url).toContain("filter.is_inpainting=0");
    expect(url).toContain("filter.model_version_id=123");
    expect(url).toContain("filter.in_whitelist=true");
    expect(init).toMatchObject({
      mode: "cors",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("maps model detail from the first matching model record", async () => {
    mockFetch.mockResolvedValueOnce(
      await jsonResponse({
        models: [
          {
            id: 10,
            status: 1,
            is_nsfw: false,
            cover_url: "https://cdn.example.test/cover.png",
            sd_name: "Display Name",
            sd_name_in_api: "api-name",
            type: { name: "checkpoint" },
            hash_sha256: "hash",
            tags: ["tag-a"],
            model_details: [
              {
                prompt: "prompt",
                negative_prompt: "negative",
                width: 4096,
                height: 4096,
                sampler_name: "Unknown Sampler",
                steps: 30,
                cfg_scale: 7,
                seed: 42,
              },
            ],
          },
        ],
        pagination: {},
      }),
    );

    await expect(getModelDetail(10)).resolves.toMatchObject({
      model_id: 10,
      cover_url: "https://cdn.example.test/cover.png",
      model_name: "Display Name",
      name: "api-name",
      width: 2048,
      height: 2048,
      sampler_name: "DPM++ 2M Karras",
      steps: 30,
      tags: ["tag-a"],
    });
  });

  it("returns null model detail when no matching model exists", async () => {
    mockFetch.mockResolvedValueOnce(
      await jsonResponse({ models: [], pagination: { next_cursor: "" } }),
    );

    await expect(getModelDetail(404)).resolves.toBeNull();
  });

  it("uses fallback model fields and accepts known sampler values in model detail", async () => {
    mockFetch.mockResolvedValueOnce(
      await jsonResponse({
        models: [
          {
            id: 11,
            status: 1,
            sd_name: "Fallback Display",
            sd_name_in_api: "fallback-api",
            model_details: [
              {
                sampler_name: "Euler a",
                width: 768,
                height: 512,
              },
            ],
          },
        ],
        pagination: {},
      }),
    );

    await expect(
      getModelDetail(11, {
        is_sdxl: true,
        is_sd3: false,
        base_model: "SDXL",
      } as any),
    ).resolves.toMatchObject({
      model_id: 11,
      sampler_name: "Euler a",
      steps: 20,
      is_sdxl: true,
      is_sd3: false,
      base_model: "SDXL",
    });
  });

  it("returns civitai details only when the response contains an id", async () => {
    mockFetch.mockResolvedValueOnce(
      await jsonResponse({ id: 123, name: "Model" }),
    );
    await expect(getCivitaiModelDetails("123")).resolves.toEqual({
      id: 123,
      name: "Model",
    });

    mockFetch.mockResolvedValueOnce(await jsonResponse({ error: "not found" }));
    await expect(getCivitaiModelDetails("missing")).resolves.toBeNull();
  });

  it("fetches on-demand models by dedicated display label and applies the limit", async () => {
    await withEnv({ NEXT_PUBLIC_BASE_URL: TEST_SERVICE_BASE_URL }, async () => {
      mockFetch.mockResolvedValueOnce(
        await jsonResponse({
          data: [
            {
              id: "chat-a",
              title: "Chat A",
              display_name: "Chat A",
              labels: [
                { key: ModelLabelMap.Display, value: ModelLabelMap.Dedicated },
              ],
            },
            {
              id: "chat-b",
              title: "Chat B",
              display_name: "Chat B",
              labels: [],
            },
          ],
        }),
      );

      await expect(getLLMOnDemandModels(1, "token")).resolves.toEqual([
        expect.objectContaining({
          id: "chat-a",
          title: "Chat A",
          displayName: "Chat A",
        }),
      ]);

      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVICE_BASE_URL}/v1/product/model/list?include_de=true`,
        expect.objectContaining({
          cache: "no-store",
          headers: expect.objectContaining({
            Authorization: "Bearer token",
          }),
        }),
      );
    });
  });

  it("returns no on-demand models for malformed responses and fetch failures", async () => {
    await withEnv({ NEXT_PUBLIC_BASE_URL: TEST_SERVICE_BASE_URL }, async () => {
      mockFetch.mockResolvedValueOnce(await jsonResponse({ data: null }));
      await expect(getLLMOnDemandModels()).resolves.toEqual([]);

      mockFetch.mockRejectedValueOnce(new Error("network down"));
      await expect(getLLMOnDemandModels()).resolves.toEqual([]);
    });
  });

  it("fetches chat models with auth headers and filters deprecated records", async () => {
    await withEnv({ NEXT_PUBLIC_BASE_URL: TEST_SERVICE_BASE_URL }, async () => {
      mockFetch.mockResolvedValueOnce(
        await jsonResponse({
          data: [
            rawLlmModel("active-chat", "chat"),
            {
              ...rawLlmModel("deprecated-chat", "chat"),
              status: LLMModelStatus.Deprecated,
            },
          ],
        }),
      );

      const models = await getModelList("token");

      expect(models).toHaveLength(1);
      expect(models[0]).toMatchObject({
        id: "active-chat",
        displayName: "Display active-chat",
      });
      expect(mockFetch).toHaveBeenCalledWith(
        `${TEST_SERVICE_BASE_URL}/v1/product/model/list?include_de=true`,
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer token",
          }),
          cache: "no-store",
        }),
      );
    });
  });

  it("returns an empty chat model list for malformed responses and fetch failures", async () => {
    await withEnv({ NEXT_PUBLIC_BASE_URL: TEST_SERVICE_BASE_URL }, async () => {
      mockFetch.mockResolvedValueOnce(await jsonResponse({ data: {} }));
      await expect(getModelList("token")).resolves.toEqual([]);

      mockFetch.mockRejectedValueOnce(new Error("service unavailable"));
      await expect(getModelList("token")).resolves.toEqual([]);
    });
  });

  it("fetches embedding and reranker model lists with typed query params", async () => {
    await withEnv({ NEXT_PUBLIC_BASE_URL: TEST_SERVICE_BASE_URL }, async () => {
      mockFetch
        .mockResolvedValueOnce(
          await jsonResponse({ data: [rawLlmModel("embed", "embedding")] }),
        )
        .mockResolvedValueOnce(
          await jsonResponse({ data: [rawLlmModel("rerank", "reranker")] }),
        );

      await expect(getEmbeddingModelList("token")).resolves.toHaveLength(1);
      expect(mockFetch.mock.calls[0][0]).toBe(
        `${TEST_SERVICE_BASE_URL}/v1/product/model/list?model_type=embedding&include_de=true`,
      );

      await expect(getRerankerModelList("token")).resolves.toHaveLength(1);
      expect(mockFetch.mock.calls[1][0]).toBe(
        `${TEST_SERVICE_BASE_URL}/v1/product/model/list?model_type=reranker&include_de=true`,
      );
    });
  });

  it("returns cached full model data and falls back to direct API when cache fails", async () => {
    mockFetch.mockResolvedValueOnce(
      await jsonResponse({ data: [{ id: "cached-model" }] }),
    );

    await expect(getFullLLMModelsWithCache(["chat"], "token")).resolves.toEqual(
      [{ id: "cached-model" }],
    );
    expect(mockFetch).toHaveBeenLastCalledWith(
      "/api/llm-models?filter=chat",
      expect.objectContaining({
        method: "GET",
        cache: "default",
        headers: expect.objectContaining({
          Authorization: "Bearer token",
        }),
      }),
    );

    mockFetch
      .mockResolvedValueOnce(await jsonResponse({ error: "bad" }, false, 500))
      .mockResolvedValueOnce(
        await jsonResponse({ data: [rawLlmModel("chat", "chat")] }),
      )
      .mockResolvedValueOnce(await jsonResponse({ data: [] }))
      .mockResolvedValueOnce(await jsonResponse({ data: [] }));

    await expect(
      getFullLLMModelsWithCache(["chat", "embedding", "reranker"], "token"),
    ).resolves.toHaveLength(1);
  });

  it("fetches only the requested full model categories", async () => {
    await withEnv({ NEXT_PUBLIC_BASE_URL: TEST_SERVICE_BASE_URL }, async () => {
      mockFetch
        .mockResolvedValueOnce(
          await jsonResponse({
            data: [rawLlmModel("embed-only", "embedding")],
          }),
        )
        .mockResolvedValueOnce(
          await jsonResponse({
            data: [rawLlmModel("rerank-only", "reranker")],
          }),
        );

      const models = await getFullLLMModels(["embedding", "reranker"], "token");

      expect(models.map((model) => model.id)).toEqual([
        "embed-only",
        "rerank-only",
      ]);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(mockFetch.mock.calls[0][0]).toContain("model_type=embedding");
      expect(mockFetch.mock.calls[1][0]).toContain("model_type=reranker");
    });
  });

  it("falls back to direct model fetch when cached response parsing fails", async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error("invalid json");
        },
      } as unknown as Response)
      .mockResolvedValueOnce(
        await jsonResponse({ data: [rawLlmModel("direct-chat", "chat")] }),
      );

    await expect(
      getFullLLMModelsWithCache(["chat"], "token"),
    ).resolves.toHaveLength(1);
  });

  it("aggregates civitai model version matches and skips missing details", async () => {
    mockFetch
      .mockResolvedValueOnce(
        await jsonResponse({
          models: [
            {
              id: 20,
              status: 1,
              is_nsfw: true,
              cover_url: "https://cdn.example.test/model.png",
              sd_name: "Model Twenty",
              sd_name_in_api: "model-twenty",
              type: { name: "checkpoint" },
              hash_sha256: "hash-20",
              tags: ["style"],
              model_details: [{ width: 512, height: 512 }],
            },
          ],
          pagination: {},
        }),
      )
      .mockResolvedValueOnce(await jsonResponse({ models: [], pagination: {} }))
      .mockRejectedValueOnce(new Error("detail failed"));

    await expect(
      searchCivitaiModel(
        [
          { id: 20, baseModel: "SDXL", baseModelType: "standard" },
          { id: 21, baseModel: "SD 1.5", baseModelType: "standard" },
          { id: 22, baseModel: "SD3", baseModelType: "standard" },
        ],
        2,
      ),
    ).resolves.toEqual([
      expect.objectContaining({
        id: 20,
        base_model: "SDXL",
        cover_url: "https://cdn.example.test/model.png",
        hash_sha256: "hash-20",
        is_nsfw: true,
        tags: ["style"],
        type: { name: "checkpoint", display_name: "checkpoint" },
      }),
    ]);
  });
});
