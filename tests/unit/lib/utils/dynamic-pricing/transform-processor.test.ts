import {
  processValueTransforms,
  processValueTransformsBatch,
} from "@/lib/utils/dynamic-pricing/transform-processor";

const baseConfig = {
  fusionConfig: { id: 1 },
  modelConfig: { config: {} },
  pricingConfig: {
    billing: {
      paramConstructors: {
        "body.image_settings":
          "(params) => [{ duration: Number(params.duration || 1) }]",
        "body.invalid": "class Bad {}",
      },
    },
    priceFactors: {
      fast_mode: {
        column: { dataIndex: "mode", title: "Mode" },
        valueTransform: "(value) => value ? 'Fast' : 'Standard'",
      },
      broken: {
        column: { dataIndex: "broken", title: "Broken" },
        valueTransform: "not a function",
      },
    },
    table: {
      columnValueDerivers: {
        mode: "({ row }) => row.fast_mode ? 'Fast' : 'Standard'",
        invalid: "class Bad {}",
      },
    },
  },
} as any;

describe("processValueTransforms", () => {
  it("converts valid function strings and leaves invalid strings untouched", () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    const processed = processValueTransforms(baseConfig) as any;

    expect(processed).not.toBe(baseConfig);
    expect(
      processed.pricingConfig.priceFactors.fast_mode.valueTransform(true),
    ).toBe("Fast");
    expect(processed.pricingConfig.priceFactors.broken.valueTransform).toBe(
      "not a function",
    );
    expect(
      processed.pricingConfig.table.columnValueDerivers.mode({
        params: {},
        row: { fast_mode: false },
      }),
    ).toBe("Standard");
    expect(
      processed.pricingConfig.billing.paramConstructors["body.image_settings"]({
        duration: "5",
      }),
    ).toEqual([{ duration: 5 }]);
    expect(
      processed.pricingConfig.billing.paramConstructors["body.invalid"],
    ).toBe("class Bad {}");

    warn.mockRestore();
  });

  it("returns configs without pricing config unchanged and processes batches", () => {
    const configWithoutPricing = { fusionConfig: { id: 2 } } as any;
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    expect(processValueTransforms(configWithoutPricing)).toBe(
      configWithoutPricing,
    );
    expect(processValueTransformsBatch([baseConfig])).toHaveLength(1);

    warn.mockRestore();
  });
});
