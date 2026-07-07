jest.mock("@/api/api", () => ({
  BASE_API_URL: "https://api.example.test",
}));

import { getModelDetail, getModels } from "@/api/gpu-instance/model";

const mockFetch = global.fetch as jest.Mock;
let mockConsoleLog: jest.SpyInstance;

function jsonResponse(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
  };
}

describe("gpu instance model fetch helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
  });

  it("builds model list query params and returns only active models", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        models: [
          { id: 1, name: "active", status: 1 },
          { id: 2, name: "hidden", status: 0 },
        ],
      }),
    );

    await expect(
      getModels({
        pageIndex: 2,
        pageSize: 25,
        type: "checkpoint",
        tag: "anime",
        nsfw: true,
        source: "official",
        visibility: "public",
      }),
    ).resolves.toEqual([{ id: 1, name: "active", status: 1 }]);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain("https://api.example.test/v3/model?");
    expect(url).toContain("pagination.limit=25");
    expect(url).toContain("pagination.cursor=c_50");
    expect(url).toContain("filter.is_nsfw=true");
    expect(url).toContain("filter.source=official");
    expect(url).toContain("filter.tags=anime");
    expect(url).toContain("filter.types=checkpoint");
    expect(url).toContain("filter.visibility=public");
    expect(options).toMatchObject({
      mode: "cors",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
    });
  });

  it("uses model list defaults and omits ALL tags from filtering", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ models: [] }));

    await expect(getModels({ tag: "ALL" })).resolves.toEqual([]);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain("pagination.limit=100");
    expect(url).toContain("pagination.cursor=c_0");
    expect(url).toContain("filter.is_nsfw=false");
    expect(url).toContain("filter.source=civitai");
    expect(url).toContain("filter.tags=");
    expect(url).not.toContain("filter.types=");
  });

  it("returns an empty model list for unexpected response shapes", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ data: [] }));

    await expect(getModels()).resolves.toEqual([]);
  });

  it("maps model detail payloads into UI detail fields", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonResponse({
        code: 0,
        data: {
          model: {
            civitai_version_id: 123,
            civitai_image_url: "https://img.example/model.png",
            civitai_image_prompt: "prompt",
            civitai_image_negative_prompt: "negative",
            sd_name: "sdxl",
            civitai_image_width: 1024,
            civitai_image_height: 768,
            civitai_image_sampler_name: "Euler",
            civitai_image_cfg_scale: 7,
            civitai_image_steps: 30,
            civitai_tags: "tag-a,tag-b",
            seed: 42,
            name: "Model Name",
            type: "checkpoint",
            hash: "abc123",
          },
        },
      }),
    );

    await expect(getModelDetail(123)).resolves.toEqual({
      model_id: 123,
      cover_url: "https://img.example/model.png",
      prompt: "prompt",
      negative_prompt: "negative",
      model_name: "sdxl",
      width: 1024,
      height: 768,
      sampler_name: "DPM++ 2M Karras",
      cfg_scale: 7,
      steps: 30,
      tags: ["tag-a", "tag-b"],
      seed: 42,
      name: "Model Name",
      type: "checkpoint",
      hash_sha256: "abc123",
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.test/v2/model/civitai_version_id/123",
      expect.objectContaining({
        method: "GET",
        mode: "cors",
        cache: "no-cache",
      }),
    );
  });

  it("returns null when model detail is missing or unsuccessful", async () => {
    mockFetch.mockResolvedValueOnce(jsonResponse({ code: 1 }));
    await expect(getModelDetail(1)).resolves.toBeNull();

    mockFetch.mockResolvedValueOnce(jsonResponse({ code: 0, data: {} }));
    await expect(getModelDetail(2)).resolves.toBeNull();
  });
});
