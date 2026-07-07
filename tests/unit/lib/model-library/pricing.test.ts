import { ModelType, type LLMModelWithStatus } from "@/types/models";
import { convertRawModelToLLMModelClient } from "@/lib/utils/models";
import {
  getListExpandedPriceLines,
  getListSummaryPriceLines,
  getModelExpandLabel,
  getModelPriceLines,
  getTieredPricingRows,
} from "@/lib/model-library/pricing";

describe("model-library pricing", () => {
  it("returns no tier rows when tiered billing is not configured", () => {
    expect(getTieredPricingRows({ is_tiered_billing: false })).toEqual([]);
  });

  it("normalizes tiered pricing rows with cache prices and discount state", () => {
    const rows = getTieredPricingRows({
      is_tiered_billing: true,
      tiered_billing_configs: [
        {
          min_tokens: 1,
          max_tokens: 262144,
          output_min_tokens: 0,
          input_pricing: { pricePerM: 30000, originPricePerM: 40000 },
          output_pricing: { pricePerM: 0, originPricePerM: 0 },
          cache_read_input_pricing: {
            pricePerM: 2000,
            originPricePerM: 3000,
          },
          cache_creation_input_pricing: {
            pricePerM: 2000,
            originPricePerM: 3000,
          },
        },
      ],
    });

    expect(rows).toEqual([
      {
        inputRange: "[1 - 262,144)",
        prices: [
          { label: "Cache Read", value: "$0.2/Mt", discounted: true },
          { label: "Cache Write", value: "$0.2/Mt", discounted: true },
          { label: "Input", value: "$3/Mt", discounted: true },
          { label: "Output", value: "$0/Mt", discounted: false },
        ],
      },
    ]);
  });

  it("marks discounted LLM price lines without replacing final prices", () => {
    const model = {
      type: ModelType.Chat,
      input_token_price_per_m_toString: "1",
      infos: {
        inputPricing: "$1/Mt",
        originInputPricing: "$2/Mt",
        outputPricing: "$3/Mt",
        originOutputPricing: "$3/Mt",
        contextSize: "131072",
        maxOutputTokens: "4096",
      },
    } as LLMModelWithStatus;

    expect(getModelPriceLines(model)).toEqual([
      {
        label: "Input",
        value: "$1/Mt",
        originalValue: "$2/Mt",
        discounted: true,
      },
      {
        label: "Output",
        value: "$3/Mt",
        originalValue: undefined,
        discounted: false,
      },
    ]);
  });

  it("uses Text-prefixed multimodal summary lines for console library LLM pricing", () => {
    const model = {
      type: ModelType.Chat,
      input_token_price_per_m_toString: "1",
      infos: {
        inputPricing: "$9/Mt",
        outputPricing: "$9/Mt",
        contextSize: "131072",
        maxOutputTokens: "4096",
      },
      multimodal_pricing: {
        input_price: [
          {
            modals: ["text"],
            input_token_discount_price: 1200,
            input_token_base_price: 2400,
            cache_read_input_discount_price: 300,
            cache_read_input_base_price: 600,
          },
          {
            modals: ["image"],
            input_token_discount_price: 22000,
            input_token_base_price: 26000,
          },
        ],
        output_price: [
          {
            modals: ["text"],
            output_token_discount_price: 4800,
            output_token_base_price: 4800,
          },
        ],
      },
    } as LLMModelWithStatus;

    expect(getModelPriceLines(model)).toEqual([
      expect.objectContaining({
        label: "Text · Input",
        value: "$0.12/Mt",
        originalValue: "$0.24/Mt",
        discounted: true,
      }),
      expect.objectContaining({
        label: "Text · Output",
        value: "$0.48/Mt",
        originalValue: undefined,
        discounted: false,
      }),
      expect.objectContaining({
        label: "Text · Cache Read",
        value: "$0.03/Mt",
        originalValue: "$0.06/Mt",
        discounted: true,
      }),
    ]);
  });

  it("derives the Multimodal expand label and splits list summary/detail prices", () => {
    const model = {
      type: ModelType.Chat,
      input_token_price_per_m_toString: "1",
      infos: {
        inputPricing: "$9/Mt",
        outputPricing: "$9/Mt",
        contextSize: "131072",
        maxOutputTokens: "4096",
      },
      multimodal_pricing: {
        input_price: [
          {
            modals: ["text"],
            input_token_discount_price: 1200,
            input_token_base_price: 2400,
            cache_read_input_discount_price: 300,
            cache_read_input_base_price: 600,
          },
          {
            modals: ["image"],
            input_token_discount_price: 22000,
            input_token_base_price: 26000,
          },
        ],
        output_price: [
          {
            modals: ["text"],
            output_token_discount_price: 4800,
            output_token_base_price: 4800,
          },
          {
            modals: ["image"],
            output_token_discount_price: 32000,
            output_token_base_price: 40000,
          },
        ],
      },
    } as LLMModelWithStatus;

    expect(getModelExpandLabel(model)).toBe("Multimodal");
    expect(getListSummaryPriceLines(model).map((line) => line.label)).toEqual([
      "Text · Input",
      "Text · Output",
      "Text · Cache Read",
    ]);
    expect(getListExpandedPriceLines(model).map((line) => line.label)).toEqual([
      "Image · Input",
      "Image · Output",
    ]);
  });

  it("keeps the Multimodal expand label when only non-text multimodal prices exist", () => {
    const model = {
      type: ModelType.Chat,
      input_token_price_per_m_toString: "1",
      infos: {
        inputPricing: "$9/Mt",
        outputPricing: "$9/Mt",
        contextSize: "131072",
        maxOutputTokens: "4096",
      },
      multimodal_pricing: {
        input_price: [
          {
            modals: ["image"],
            input_token_discount_price: 22000,
            input_token_base_price: 26000,
          },
        ],
        output_price: [
          {
            modals: ["image"],
            output_token_discount_price: 32000,
            output_token_base_price: 40000,
          },
        ],
      },
    } as LLMModelWithStatus;

    expect(getModelExpandLabel(model)).toBe("Multimodal");
  });

  it("prefers the Tiered expand label when tiered billing is configured", () => {
    const model = {
      type: ModelType.Chat,
      input_token_price_per_m_toString: "1",
      is_tiered_billing: true,
      tiered_billing_configs: [
        {
          min_tokens: 1,
          max_tokens: 262144,
          output_min_tokens: 0,
          input_pricing: { pricePerM: 1200, originPricePerM: 1200 },
          output_pricing: { pricePerM: 4800, originPricePerM: 4800 },
          cache_read_input_pricing: { pricePerM: 300, originPricePerM: 300 },
          cache_creation_input_pricing: {
            pricePerM: 500,
            originPricePerM: 500,
          },
        },
      ],
      multimodal_pricing: {
        input_price: [
          {
            modals: ["text"],
            input_token_discount_price: 1200,
            input_token_base_price: 2400,
          },
        ],
        output_price: [
          {
            modals: ["text"],
            output_token_discount_price: 4800,
            output_token_base_price: 4800,
          },
        ],
      },
    } as LLMModelWithStatus;

    expect(getModelExpandLabel(model)).toBe("Tiered");
  });

  it("falls back to legacy infos when multimodal_pricing normalizes to no usable entries", () => {
    const model = {
      type: ModelType.Chat,
      input_token_price_per_m_toString: "1",
      infos: {
        inputPricing: "$1/Mt",
        outputPricing: "$2/Mt",
        contextSize: "131072",
        maxOutputTokens: "4096",
      },
      multimodal_pricing: {
        input_price: [{ modals: ["text"], input_token_discount_price: "" }],
      },
    } as LLMModelWithStatus;

    expect(getModelPriceLines(model)).toEqual([
      {
        label: "Input",
        value: "$1/Mt",
        originalValue: undefined,
        discounted: false,
      },
      {
        label: "Output",
        value: "$2/Mt",
        originalValue: undefined,
        discounted: false,
      },
    ]);
  });

  it("shows reranker output pricing when the API provides an output token price", () => {
    const model = convertRawModelToLLMModelClient(
      {
        id: "reranker-with-output",
        title: "BAAI/bge-reranker-v2",
        display_name: "BAAI/bge-reranker-v2",
        description: "reranker",
        context_size: 8192,
        input_token_price_per_m: 10000,
        output_token_price_per_m: 20000,
        status: 1,
        labels: [],
        tags: [],
        features: [],
      },
      "reranker",
    );

    expect(getModelPriceLines(model)).toEqual([
      {
        label: "Input",
        value: "$1/Mt",
        originalValue: undefined,
        discounted: false,
      },
      {
        label: "Output",
        value: "$2/Mt",
        originalValue: undefined,
        discounted: false,
      },
    ]);
  });

  it("does not show reranker output pricing when the API does not provide it", () => {
    const model = convertRawModelToLLMModelClient(
      {
        id: "reranker-without-output",
        title: "BAAI/bge-reranker-base",
        display_name: "BAAI/bge-reranker-base",
        description: "reranker",
        context_size: 8192,
        input_token_price_per_m: 10000,
        output_token_price_per_m: undefined,
        status: 1,
        labels: [],
        tags: [],
        features: [],
      },
      "reranker",
    );

    expect(getModelPriceLines(model)).toEqual([
      {
        label: "Input",
        value: "$1/Mt",
        originalValue: undefined,
        discounted: false,
      },
    ]);
  });
});
