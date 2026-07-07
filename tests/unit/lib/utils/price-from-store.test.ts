const mockCalculatePriceForSingleParams = jest.fn();
const mockConvertPlaygroundParamsToFieldMapping = jest.fn(
  (params: Record<string, unknown>) => ({
    mapped: true,
    ...params,
  }),
);
const mockCalculatePlaygroundPrice = jest.fn();
const mockCalcPrice = jest.fn();

jest.mock("@/lib/utils/dynamic-pricing/table-generator", () => ({
  calculatePlaygroundPrice: (...args: unknown[]) =>
    mockCalculatePlaygroundPrice(...args),
  calculatePriceForSingleParams: (...args: unknown[]) =>
    mockCalculatePriceForSingleParams(...args),
  convertPlaygroundParamsToFieldMapping: (...args: unknown[]) =>
    mockConvertPlaygroundParamsToFieldMapping(...args),
}));

jest.mock("@/lib/utils/dynamic-pricing/default-config", () => ({
  getDefaultPriceUnit: (category: string) => `unit:${category}`,
}));

jest.mock("@/lib/utils/pricing", () => ({
  calcPrice: (...args: unknown[]) => mockCalcPrice(...args),
}));

import { FUNC_NAME } from "@/app/models/constants/funcs";
import {
  calculateDynamicModelPrice,
  calculatePlaygroundPrice,
  convertPlaygroundParamsToFieldMapping,
  getModelPriceFromConfigsAndMap,
} from "@/lib/utils/price-from-store";

const dynamicConfig = {
  fusionConfig: {
    displayName: "Demo Display",
    id: 42,
    name: "demo-dynamic",
  },
  modelConfig: {
    config: {
      category: "video_gen",
      id: "config-42",
      name: "config-name",
    },
  },
  pricingConfig: {
    table: {
      priceUnit: "second",
    },
  },
} as any;

describe("price-from-store utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calculates dynamic model price with configured unit and rejects missing prices", () => {
    mockCalculatePriceForSingleParams.mockReturnValueOnce({
      price: "1.25",
      skuCode: "SKU_DYNAMIC",
    });

    expect(
      calculateDynamicModelPrice(dynamicConfig, { duration: 5 }, {}),
    ).toEqual({
      price: 1.25,
      skuCode: "SKU_DYNAMIC",
      unit: "second",
    });

    mockCalculatePriceForSingleParams
      .mockReturnValueOnce({ price: "-", skuCode: "SKU_MISSING" })
      .mockReturnValueOnce({ price: Infinity, skuCode: "SKU_BAD" });

    expect(calculateDynamicModelPrice(dynamicConfig, {}, {})).toBeNull();
    expect(calculateDynamicModelPrice(dynamicConfig, {}, {})).toBeNull();
  });

  it("finds dynamic configs by id, display name, config id or config name", () => {
    mockCalculatePriceForSingleParams.mockReturnValue({
      price: 2,
      skuCode: "SKU_DYNAMIC",
    });

    for (const key of [42, "Demo Display", "config-42", "config-name"]) {
      expect(
        getModelPriceFromConfigsAndMap([dynamicConfig], {}, String(key), {
          duration: 3,
        }),
      ).toEqual({ price: 2, skuCode: "SKU_DYNAMIC", unit: "second" });
    }

    expect(mockConvertPlaygroundParamsToFieldMapping).toHaveBeenCalledWith(
      expect.objectContaining({ duration: 3 }),
      dynamicConfig,
    );
  });

  it("falls back to static calcPrice and category-specific default units", () => {
    mockCalcPrice.mockReturnValueOnce({
      discountPrice: "0.2",
      originalPrice: 0.4,
    });

    expect(
      getModelPriceFromConfigsAndMap([], {}, FUNC_NAME.WAN_T2V, {
        resolution: "720P",
        size: "1280*720",
      }),
    ).toEqual({
      discountPrice: 0.2,
      originalPrice: 0.4,
      unit: "unit:video_gen",
    });
    expect(mockCalcPrice).toHaveBeenCalledWith(
      FUNC_NAME.WAN_T2V,
      expect.objectContaining({
        height: "720",
        resolutionType: "720P",
        width: "1280",
      }),
    );

    mockCalcPrice.mockReturnValueOnce({
      discountPrice: "not-a-number",
      originalPrice: "-",
    });
    expect(
      getModelPriceFromConfigsAndMap([], {}, FUNC_NAME.TXT2IMG, {}),
    ).toBeNull();
  });

  it("returns null for unknown models and caught pricing exceptions", () => {
    expect(
      getModelPriceFromConfigsAndMap([], {}, "unknown-model", {}),
    ).toBeNull();

    mockConvertPlaygroundParamsToFieldMapping.mockImplementationOnce(() => {
      throw new Error("bad mapping");
    });
    expect(
      getModelPriceFromConfigsAndMap([dynamicConfig], {}, "demo-dynamic", {}),
    ).toBeNull();
  });

  it("re-exports playground helpers from table-generator", () => {
    mockCalculatePlaygroundPrice.mockReturnValue("price");
    expect(calculatePlaygroundPrice("params" as any, "config" as any, {})).toBe(
      "price",
    );
    expect(
      convertPlaygroundParamsToFieldMapping({ width: 512 }, dynamicConfig),
    ).toEqual(expect.objectContaining({ mapped: true, width: 512 }));
  });
});
