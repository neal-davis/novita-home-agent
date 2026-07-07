import { convertRawModelToLLMModelClient } from "@/lib/utils/models";

describe("convertRawModelToLLMModelClient", () => {
  it("maps a minimal chat model and leaves optional pricing undefined", () => {
    const raw = {
      id: "meta/llama-3",
      title: "meta/llama-3",
      display_name: "Llama 3",
      input_token_price_per_m: 10000,
      output_token_price_per_m: 20000,
      context_size: 8192,
      status: 1,
      features: ["serverless"],
    };
    const model = convertRawModelToLLMModelClient(raw);
    // name strips the org prefix
    expect(model.name).toBe("llama-3");
    expect(model.infos.inputPricing).toBe("$1/Mt");
    expect(model.infos.outputPricing).toBe("$2/Mt");
    // no origin / cache pricing supplied
    expect(model.infos.originInputPricing).toBeUndefined();
    expect(model.infos.cacheReadPricing).toBeUndefined();
    // chat + serverless feature => both tags present
    expect(model.tags).toEqual(expect.arrayContaining(["LLM", "Serverless"]));
  });

  it("includes origin and cache pricing when they differ from base", () => {
    const raw = {
      id: "anthropic/claude",
      title: "Claude",
      display_name: "Claude",
      input_token_price_per_m: 10000,
      input_pricing: { originPricePerM: 30000 },
      output_token_price_per_m: 20000,
      output_pricing: { originPricePerM: 50000 },
      cache_read_input_token_price_per_m: 5000,
      cache_read_input_pricing: { originPricePerM: 8000 },
      cache_creation_input_token_price_per_m: 6000,
      cache_creation_input_pricing: { originPricePerM: 9000 },
      cache_creation_1_hour_input_token_price_per_m: 7000,
      cache_creation_1_hour_input_pricing: { originPricePerM: 11000 },
      status: 1,
      model_type: "chat",
    };
    const model = convertRawModelToLLMModelClient(raw);
    // title without "/" is used verbatim
    expect(model.name).toBe("Claude");
    expect(model.infos.originInputPricing).toBe("$3/Mt");
    expect(model.infos.originOutputPricing).toBe("$5/Mt");
    expect(model.infos.cacheReadPricing).toBe("$0.5/Mt");
    expect(model.infos.originCacheReadPricing).toBe("$0.8/Mt");
    expect(model.infos.cacheWrite5mPricing).toBe("$0.6/Mt");
    expect(model.infos.cacheWrite1hPricing).toBe("$0.7/Mt");
    expect(model.linkPath).toBeTruthy();
  });

  it("tags embedding and reranker model types and applies the fallback type", () => {
    const embedding = convertRawModelToLLMModelClient(
      { id: "e", title: "Embed", status: 0, model_type: "embedding" },
      "embedding",
    );
    expect(embedding.tags).toContain("Embedding");
    // not available => no linkPath
    expect(embedding.linkPath).toBeUndefined();

    const reranker = convertRawModelToLLMModelClient(
      { id: "r", title: "Rank", status: "offline" },
      "reranker",
    );
    expect(reranker.tags).toContain("Reranker");
  });

  it("falls back displayName to name when display_name is empty", () => {
    const model = convertRawModelToLLMModelClient({
      id: "x",
      title: "Solo",
      status: 0,
    });
    expect(model.displayName).toBe("Solo");
  });
});
