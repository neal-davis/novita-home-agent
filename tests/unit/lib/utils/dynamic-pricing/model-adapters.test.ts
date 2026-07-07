const mockGenerateTableRows = jest.fn();
const mockGenerateDocLink = jest.fn(() => "/docs/demo");

jest.mock("@/lib/utils/dynamic-pricing/table-generator", () => ({
  generateTableRows: (...args: unknown[]) => mockGenerateTableRows(...args),
}));

jest.mock("@/lib/utils/dynamic-pricing/doc-link-generator", () => ({
  generateDocLink: (...args: unknown[]) => mockGenerateDocLink(...args),
}));

import {
  convertDynamicModelToLibraryModel,
  convertToAudioModel,
  convertToImageModel,
  convertToVideoModel,
  extractPrimaryPath,
  generatePriceInfoString,
} from "@/lib/utils/dynamic-pricing/model-library-adapter";
import { generateDynamicMultimodalPricingTableRows } from "@/lib/utils/dynamic-pricing/model-table-adapter";
import { ModelType } from "@/types/models";

const makeConfig = (
  category = "video_gen",
  overrides: Record<string, any> = {},
) =>
  ({
    fusionConfig: {
      displayName: "Demo Model",
      id: 77,
      labels: [{ value: "2" }, { value: "Featured" }, "New", { value: "5" }],
      name: "demo-model",
      series: " Demo Series ",
    },
    modelConfig: {
      config: {
        billingExpr: "sku * body.duration",
        category,
        name: "fallback-model",
        openapiSchema: JSON.stringify({ paths: { "/v3/demo": {} } }),
      },
    },
    pricingConfig: {
      table: {
        priceNote: "intro price",
        priceUnit: "clip",
      },
    },
    ...overrides,
  }) as any;

describe("dynamic pricing model adapters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("extracts the first OpenAPI path and ignores empty or invalid schema", () => {
    expect(
      extractPrimaryPath(JSON.stringify({ paths: { "/a": {}, "/b": {} } })),
    ).toBe("/a");
    expect(extractPrimaryPath("")).toBeUndefined();
    expect(extractPrimaryPath("{bad json")).toBeUndefined();
  });

  it("generates compact price info strings using discounts, units and mode labels", () => {
    mockGenerateTableRows.mockReturnValueOnce([
      {
        discountPrice: 0.2,
        duration: 5,
        mode: "fast",
        originalPrice: 0.4,
        resolution: "720p",
      },
      { price: 9 },
    ]);

    expect(generatePriceInfoString(makeConfig(), {})).toEqual([
      "$0.2 /clip 720p 5s  (fast)",
    ]);

    mockGenerateTableRows.mockReturnValueOnce([{ price: "Custom pricing" }]);
    expect(generatePriceInfoString(makeConfig("audio_gen"), {})).toEqual([
      "Custom pricing",
    ]);

    mockGenerateTableRows.mockReturnValueOnce([{ price: "-" }]);
    expect(generatePriceInfoString(makeConfig("image_gen"), {})).toEqual([]);

    mockGenerateTableRows.mockReturnValueOnce([
      { discountPrice: 0, originalPrice: 0, price: 0 },
    ]);
    expect(generatePriceInfoString(makeConfig("audio_gen"), {})).toEqual([
      "Free",
    ]);
  });

  it("converts dynamic configs to typed library cards with metadata", () => {
    mockGenerateTableRows.mockReturnValue([{ price: 1 }]);

    expect(convertToVideoModel(makeConfig(), {})).toEqual(
      expect.objectContaining({
        badgeLabels: ["Featured", "New"],
        displayName: "Demo Model",
        featuredOrder: 2,
        id: "dynamic-video-77",
        infos: ["$1 /clip"],
        isFeatured: true,
        link: "/docs/demo",
        name: "demo-model",
        paths: "/v3/demo",
        series: "Demo Series",
        type: ModelType.Video,
      }),
    );

    expect(convertToImageModel(makeConfig("image_gen"), {})).toEqual(
      expect.objectContaining({
        id: "dynamic-image-77",
        type: ModelType.Images,
      }),
    );
    expect(convertToAudioModel(makeConfig("audio_gen"), {})).toEqual(
      expect.objectContaining({
        id: "dynamic-audio-77",
        type: ModelType.Audio,
      }),
    );
    expect(
      convertDynamicModelToLibraryModel(makeConfig("unknown"), {}),
    ).toBeNull();
  });

  it("formats dynamic table rows, inferred audio flags and image dimensions", () => {
    mockGenerateTableRows.mockReturnValueOnce([
      {
        discountPrice: 0.25,
        duration: "6",
        fast_mode: "fast",
        originalPrice: 0.5,
        resolution: "720p",
        skuCode: "SKU_VIDEO_AUDIO",
      },
      {
        discountPrice: 0,
        duration: "null",
        mode: "standard",
        originalPrice: 0,
        size: "480p",
        skuCode: "SKU_SILENT",
      },
      {
        discountPrice: "Contact us",
        generate_audio: false,
        originalPrice: "Contact us",
        skuCode: "SKU_CUSTOM",
      },
    ]);

    expect(generateDynamicMultimodalPricingTableRows(makeConfig(), {})).toEqual(
      [
        expect.objectContaining({
          discountPrice: "0.2500",
          duration: 6,
          hasAudio: true,
          mode: "fast",
          originalPrice: "0.5000",
          price: "$0.2500 /clip",
          priceNote: "intro price",
          priceUnit: "clip",
          rawPrice: 0.25,
          series: "Demo Series",
          skuCode: "SKU_VIDEO_AUDIO",
        }),
        expect.objectContaining({
          discountPrice: "0.0000",
          duration: null,
          hasAudio: false,
          originalPrice: "0.0000",
          price: "Free",
          rawPrice: 0,
        }),
        expect.objectContaining({
          hasAudio: false,
          price: "Contact us",
        }),
      ],
    );

    mockGenerateTableRows.mockReturnValueOnce([
      {
        discountPrice: 0.1,
        height: 512,
        originalPrice: 0.2,
        quality: "hd",
        size: "512*512",
        skuCode: "IMG_SKU",
        width: 512,
      },
    ]);

    expect(
      generateDynamicMultimodalPricingTableRows(makeConfig("image_gen"), {}),
    ).toEqual([
      expect.objectContaining({
        height: 512,
        price: "$0.1000 /clip",
        quality: "hd",
        size: "512*512",
        width: 512,
      }),
    ]);

    mockGenerateTableRows.mockReturnValueOnce([
      {
        discountPrice: 0,
        originalPrice: 0,
        skuCode: "IMG_FREE",
      },
    ]);

    expect(
      generateDynamicMultimodalPricingTableRows(makeConfig("image_gen"), {}),
    ).toEqual([
      expect.objectContaining({
        discountPrice: "0.0000",
        originalPrice: "0.0000",
        price: "Free",
        rawPrice: 0,
      }),
    ]);

    mockGenerateTableRows.mockReturnValueOnce([
      {
        discountPrice: 0,
        originalPrice: 0,
        skuCode: "AUDIO_FREE",
      },
    ]);

    expect(
      generateDynamicMultimodalPricingTableRows(makeConfig("audio_gen"), {}),
    ).toEqual([
      expect.objectContaining({
        discountPrice: "0.0000",
        originalPrice: "0.0000",
        price: "Free",
        rawPrice: 0,
      }),
    ]);
  });
});
