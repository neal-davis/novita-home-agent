import {
  ensureDefaultPricingConfig,
  generateDefaultPricingConfig,
  getDefaultPriceUnit,
} from "@/lib/utils/dynamic-pricing/default-config";

describe("dynamic pricing default config", () => {
  it("returns category-specific default price units", () => {
    expect(getDefaultPriceUnit("video_gen")).toBe("video");
    expect(getDefaultPriceUnit("image_gen")).toBe("image");
    expect(getDefaultPriceUnit("audio_gen")).toBe("10k chars");
    expect(getDefaultPriceUnit("unknown")).toBe("call");
  });

  it("generates table factors from field mapping and preserves explicit config", () => {
    const generated = generateDefaultPricingConfig(
      {
        duration: "body.duration",
        fast_mode: "body.fast_mode",
        images: "body.images",
        resolution: "body.resolution",
        scale: "body.scale",
      },
      "video_gen",
      {
        billing: { multiplier: "duration" } as any,
        table: { priceNote: "intro", priceUnit: "second" } as any,
      },
    );

    expect(generated.table).toEqual({
      priceNote: "intro",
      priceUnit: "second",
    });
    expect(generated.billing).toEqual({ multiplier: "duration" });
    expect(generated.priceFactors).toEqual(
      expect.objectContaining({
        duration: expect.objectContaining({
          column: expect.objectContaining({
            dataIndex: "duration",
            order: 1,
            render: "duration",
            title: "Duration",
          }),
        }),
        fast_mode: expect.objectContaining({
          column: expect.objectContaining({
            dataIndex: "mode",
            order: 2,
            render: "mode",
            title: "Mode",
          }),
          valueTransform: expect.any(Function),
        }),
        resolution: expect.objectContaining({
          column: expect.objectContaining({ order: 3, render: "resolution" }),
        }),
        scale: expect.objectContaining({
          column: expect.objectContaining({ order: 4, render: "default" }),
        }),
      }),
    );
    expect(generated.priceFactors?.images).toBeUndefined();
    expect(generated.priceFactors?.fast_mode.valueTransform?.(true)).toBe(
      "Fast mode",
    );
    expect(generated.priceFactors?.fast_mode.valueTransform?.(false)).toBe(
      "Standard mode",
    );

    const explicit = { custom: { column: { dataIndex: "x" } } } as any;
    expect(
      generateDefaultPricingConfig({ duration: "body.duration" }, "video_gen", {
        priceFactors: explicit,
      }).priceFactors,
    ).toBe(explicit);
  });

  it("ensures explicit pricing config is completed with generated factors", () => {
    expect(
      ensureDefaultPricingConfig({
        modelConfig: {
          config: { category: "audio_gen" },
          skuMappings: [],
        },
        pricingConfig: {
          fieldMapping: {
            mode: "body.mode",
          },
        },
      } as any),
    ).toEqual(
      expect.objectContaining({
        fieldMapping: { mode: "body.mode" },
        table: { priceUnit: "10k chars" },
      }),
    );
  });

  it("derives field mapping from SKU CEL and OpenAPI schema fallbacks", () => {
    const config = ensureDefaultPricingConfig({
      modelConfig: {
        config: {
          category: "image_gen",
          openapiSchema: JSON.stringify({
            components: {
              schemas: {
                ImageRequest: {
                  properties: {
                    parameters: {
                      properties: {
                        duration: { type: "integer" },
                        quality: { type: "string" },
                        size: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
            paths: {
              "/v3/image": {
                post: {
                  requestBody: {
                    content: {
                      "application/json": {
                        schema: { $ref: "#/components/schemas/ImageRequest" },
                      },
                    },
                  },
                },
              },
            },
          }),
        },
        skuMappings: [
          {
            celExpr: 'body.resolution == "720p" && body.fast_mode == true',
            skuCode: "IMG_5S_FAST",
          },
        ],
      },
    } as any);

    expect(config?.fieldMapping).toEqual(
      expect.objectContaining({
        duration: "object.parameters.duration",
        fast_mode: "body.fast_mode",
        quality: "object.parameters.quality",
        resolution: "body.resolution",
        size: "object.parameters.size",
      }),
    );
    expect(config?.table.priceUnit).toBe("image");
  });

  it("falls back for missing SKU mappings, unparseable schemas and empty extracted mappings", () => {
    expect(
      ensureDefaultPricingConfig({
        modelConfig: {
          config: { category: "video_gen" },
          skuMappings: [],
        },
      } as any),
    ).toBeNull();

    expect(
      ensureDefaultPricingConfig({
        modelConfig: {
          config: {
            category: "video_gen",
            openapiSchema: "{bad json",
          },
          skuMappings: [{ celExpr: "true", skuCode: "VIDEO_STATIC" }],
        },
      } as any),
    ).toEqual({
      billing: {},
      fieldMapping: {},
      priceFactors: {},
      table: { priceUnit: "video" },
    });
  });
});
