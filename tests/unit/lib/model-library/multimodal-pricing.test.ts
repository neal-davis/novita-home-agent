import type { MultimodalPricing } from "@/types/models";
import {
  getMultimodalDetailEntries,
  getMultimodalSummaryEntries,
} from "@/lib/model-library/multimodal-pricing";

describe("multimodal pricing adapter", () => {
  it("builds Text-only summary entries and keeps cache ordering", () => {
    const pricing: MultimodalPricing = {
      input_price: [
        {
          modals: ["text"],
          input_token_discount_price: 1200,
          input_token_base_price: 2400,
          cache_read_input_discount_price: 300,
          cache_read_input_base_price: 600,
          cache_creation_1_hour_input_discount_price: 500,
          cache_creation_1_hour_input_base_price: 1000,
        },
      ],
      output_price: [
        {
          modals: ["text"],
          output_token_discount_price: 4800,
          output_token_base_price: 4800,
        },
      ],
    };

    expect(getMultimodalSummaryEntries(pricing)).toEqual([
      expect.objectContaining({
        label: "Text · Input",
        modality: "text",
        kind: "input",
        pricePerM: 1200,
      }),
      expect.objectContaining({
        label: "Text · Output",
        modality: "text",
        kind: "output",
        pricePerM: 4800,
      }),
      expect.objectContaining({
        label: "Text · Cache Read",
        modality: "text",
        kind: "cache-read",
        pricePerM: 300,
      }),
      expect.objectContaining({
        label: "Text · Cache Write 1h",
        modality: "text",
        kind: "cache-write-1h",
        pricePerM: 500,
      }),
    ]);
  });

  it("splits combined modality rows into independent detail keys and filters empty values", () => {
    const pricing: MultimodalPricing = {
      inputPrice: [
        {
          modals: ["text", "image"],
          inputTokenDiscountPrice: 1000,
          inputTokenBasePrice: 1500,
          cacheCreationInputDiscountPrice: "",
        },
        {
          modals: ["audio"],
          inputTokenDiscountPrice: 8000,
          inputTokenBasePrice: 9000,
        },
      ],
      outputPrice: [
        {
          modals: ["image"],
          outputTokenDiscountPrice: 30000,
          outputTokenBasePrice: 45000,
        },
      ],
    };

    expect(
      getMultimodalDetailEntries(pricing).map((entry) => entry.label),
    ).toEqual(["Image · Input", "Image · Output", "Audio · Input"]);
  });

  it("keeps zero-valued prices when the API returns free multimodal pricing", () => {
    const pricing: MultimodalPricing = {
      input_price: [
        {
          modals: ["text"],
          input_token_discount_price: 0,
          input_token_base_price: 0,
        },
      ],
    };

    expect(getMultimodalSummaryEntries(pricing)).toEqual([
      expect.objectContaining({ label: "Text · Input", pricePerM: 0 }),
    ]);
  });
});
