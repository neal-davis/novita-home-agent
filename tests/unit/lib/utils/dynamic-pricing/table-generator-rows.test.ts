jest.mock(
  "@marcbachmann/cel-js",
  () => ({
    Environment: class {
      addFunctions() {
        return this;
      }
      evaluate(expr: string, context: Record<string, any>) {
        const body = context.body || context;
        if (expr.includes("body.throw_expr")) {
          throw new Error("forced CEL failure");
        }
        if (expr.includes("body.audio.settings.duration")) {
          return (
            Number(context.sku) * Number(body.audio?.settings?.duration || 0)
          );
        }
        if (expr.includes('body.resolution == "720p"')) {
          return body.resolution === "720p"
            ? Number(context.sku) * Number(body.duration)
            : 0;
        }
        if (expr.includes("body.image_settings.duration")) {
          return (
            Number(context.sku) * Number(body.image_settings?.duration || 0)
          );
        }
        if (expr.includes("body.duration * 100")) {
          return Number(body.duration) * 100;
        }
        if (expr.includes("sku * int(body.duration)")) {
          return Number(context.sku) * Number(body.duration);
        }
        if (expr.includes('body.size == "1280*720"')) {
          return body.size === "1280*720" && body.fast_mode === true;
        }
        if (expr.includes('body.size == "832*480"')) {
          return body.size === "832*480" && body.fast_mode !== true;
        }
        if (expr.includes('body.size == "960*960"')) {
          return body.size === "960*960";
        }
        if (expr.includes("sku * body.duration")) {
          return Number(context.sku) * Number(body.duration);
        }
        return true;
      }
    },
    evaluate: jest.fn((expr: string, context: Record<string, any>) => {
      const body = context.body || context;
      if (expr.includes("body.throw_expr")) {
        throw new Error("forced CEL failure");
      }
      if (expr.includes("body.audio.settings.duration")) {
        return (
          Number(context.sku) * Number(body.audio?.settings?.duration || 0)
        );
      }
      if (expr.includes('body.resolution == "720p"')) {
        return body.resolution === "720p"
          ? Number(context.sku) * Number(body.duration)
          : 0;
      }
      if (expr.includes("body.image_settings.duration")) {
        return Number(context.sku) * Number(body.image_settings?.duration || 0);
      }
      if (expr.includes("body.duration * 100")) {
        return Number(body.duration) * 100;
      }
      if (expr.includes("sku * int(body.duration)")) {
        return Number(context.sku) * Number(body.duration);
      }
      if (expr.includes("sku * body.duration")) {
        return Number(context.sku) * Number(body.duration);
      }
      return true;
    }),
    parse: jest.fn(() => ({ ast: null })),
  }),
  { virtual: true },
);

import {
  calculatePlaygroundPrice,
  calculatePriceForSingleParams,
  convertPlaygroundParamsToFieldMapping,
  generatePriceFactorCombinations,
  generateTableRows,
  getTableColumns,
} from "@/lib/utils/dynamic-pricing/table-generator";

const pricingConfig = {
  billing: {
    multiplier: "duration",
    paramDefaults: {
      "body.duration": "5",
    },
  },
  fieldMapping: {
    duration: "body.duration",
    fast_mode: "body.fast_mode",
    size: "body.size",
  },
  priceFactors: {
    duration: {
      column: {
        dataIndex: "durationLabel",
        order: 2,
        render: "duration",
        title: "Duration",
      },
      valueTransform: (value: number) => `${value}s`,
    },
    fast_mode: {
      column: {
        dataIndex: "mode",
        order: 1,
        render: "mode",
        title: "Mode",
      },
      valueTransform: (enabled: boolean) => (enabled ? "Fast" : "Standard"),
    },
    resolution: {
      column: {
        dataIndex: "resolution",
        order: 3,
        render: "resolution",
        title: "Resolution",
      },
    },
  },
  table: {
    columnCombiners: {
      summary: {
        fields: ["mode", "durationLabel", "resolution"],
        separator: " | ",
      },
    },
    columnValueDerivers: {
      skuLabel: ({ skuCode }: { skuCode: string }) => `SKU:${skuCode}`,
    },
    priceUnit: "sec",
    rowMode: "per-sku",
  },
} as any;

const modelConfig = {
  pricingConfig,
  modelConfig: {
    config: {
      billingExpr: "sku * body.duration",
      category: "video_gen",
      openapiSchema: "{}",
    },
    skuMappings: [
      {
        celExpr:
          'body.size == "1280*720" && has(body.fast_mode) && body.fast_mode == true',
        skuCode: "SKU_FAST",
      },
      {
        celExpr:
          'body.size == "832*480" && (!has(body.fast_mode) || body.fast_mode == false)',
        skuCode: "SKU_STANDARD",
      },
      {
        celExpr: 'body.size == "960*960"',
        skuCode: "SKU_MISSING_PRICE",
      },
    ],
  },
} as any;

describe("dynamic pricing table row generation", () => {
  it("generates empty and cartesian price factor combinations", () => {
    expect(generatePriceFactorCombinations([])).toEqual([{}]);
    expect(
      generatePriceFactorCombinations([
        { name: "duration", values: [5, 10] },
        { name: "resolution", values: ["480P", "720P"] },
      ] as any),
    ).toEqual([
      { duration: 5, resolution: "480P" },
      { duration: 5, resolution: "720P" },
      { duration: 10, resolution: "480P" },
      { duration: 10, resolution: "720P" },
    ]);
  });

  it("generates per-SKU rows with transformed fields, defaults and derived columns", () => {
    const rows = generateTableRows(modelConfig, {
      SKU_FAST: { discountPrice: 0.2, originalPrice: 0.4 },
      SKU_STANDARD: 0.1,
    });

    expect(rows).toEqual([
      expect.objectContaining({
        discountPrice: 1,
        duration: 5,
        fast_mode: "Fast",
        mode: "Fast",
        originalPrice: 2,
        price: 1,
        resolution: "720P",
        size: "1280*720",
        skuCode: "SKU_FAST",
        skuLabel: "SKU:SKU_FAST",
        summary: "Fast | 720P",
      }),
      expect.objectContaining({
        discountPrice: 0.5,
        duration: 5,
        fast_mode: "Standard",
        mode: "Standard",
        originalPrice: 0.5,
        price: 0.5,
        resolution: "480P",
        size: "832*480",
        skuCode: "SKU_STANDARD",
        skuLabel: "SKU:SKU_STANDARD",
        summary: "Standard | 480P",
      }),
      expect.objectContaining({
        duration: 5,
        price: "-",
        resolution: "720P",
        size: "960*960",
        skuCode: "SKU_MISSING_PRICE",
      }),
    ]);
  });

  it("calculates single params and playground prices with field mapping", () => {
    expect(
      convertPlaygroundParamsToFieldMapping(
        { fast_mode: true, height: 720, width: 1280 },
        modelConfig,
      ),
    ).toEqual({ fast_mode: true, size: "1280*720" });

    expect(
      calculatePriceForSingleParams(
        { duration: 3, fast_mode: true, size: "1280*720" },
        modelConfig,
        { SKU_FAST: 0.2 },
      ),
    ).toMatchObject({
      discountPrice: 0.6,
      originalPrice: 0.6,
      price: 0.6,
      skuCode: "SKU_FAST",
    });

    expect(
      calculatePlaygroundPrice(
        { fast_mode: true, height: 720, width: 1280 },
        modelConfig,
        { SKU_FAST: 0.2 },
      ),
    ).toEqual({
      formattedPrice: "$0.2 /sec",
      price: 0.2,
      skuCode: "SKU_FAST",
    });
  });

  it("preserves zero prices as valid free pricing", () => {
    expect(
      calculatePriceForSingleParams(
        { fast_mode: true, size: "1280*720" },
        modelConfig,
        { SKU_FAST: 0 },
      ),
    ).toMatchObject({
      discountPrice: 0,
      originalPrice: 0,
      price: 0,
      skuCode: "SKU_FAST",
    });

    expect(
      generateTableRows(modelConfig, {
        SKU_FAST: 0,
      })[0],
    ).toEqual(
      expect.objectContaining({
        discountPrice: 0,
        originalPrice: 0,
        price: 0,
        skuCode: "SKU_FAST",
      }),
    );
  });

  it("renders table columns for invalid values and prices", () => {
    const columns = getTableColumns(
      [
        {
          displayConfig: {
            column: {
              dataIndex: "duration",
              order: 2,
              render: "duration",
              title: "Duration",
            },
          },
          name: "duration",
          values: [5],
        },
        {
          displayConfig: {
            column: {
              dataIndex: "mode",
              order: 1,
              render: "mode",
              title: "Mode",
            },
          },
          name: "mode",
          values: ["fast"],
        },
        {
          name: "fallback",
          values: ["value"],
        },
      ] as any,
      pricingConfig,
      { pricing_table: { video: { second: " seconds" } } },
    );

    expect(columns.map((column) => column.dataIndex)).toEqual([
      "mode",
      "duration",
      "fallback",
      "price",
    ]);
    expect(columns[0].render?.("", {})).toBe("-");
    expect(columns[1].render?.("0", {})).toBe("-");
    expect(columns[1].render?.(5, {})).toBe("5 seconds");
    expect(columns[3].render?.("-", {})).toBe("-");
    expect(columns[3].render?.(1.25, {})).toBe("$1.25 /sec");
  });

  it("applies param defaults, constructor output and case normalization in billing expressions", () => {
    const resolutionModel = {
      pricingConfig: {
        billing: {
          paramDefaults: {
            "body.duration": "4",
          },
        },
        fieldMapping: {
          resolution: "body.resolution",
        },
        table: {
          priceUnit: "sec",
          rowMode: "per-sku",
        },
      },
      modelConfig: {
        config: {
          billingExpr: 'body.resolution == "720p" ? sku * body.duration : 0',
          openapiSchema: "{}",
        },
        skuMappings: [
          {
            celExpr: 'body.resolution == "720P"',
            skuCode: "SKU_RESOLUTION",
          },
        ],
      },
    } as any;

    expect(
      calculatePriceForSingleParams({ resolution: "720P" }, resolutionModel, {
        SKU_RESOLUTION: {
          discountPrice: 0.25,
          originalPrice: 0.5,
        },
      }),
    ).toEqual({
      discountPrice: 1,
      originalPrice: 2,
      price: 1,
      skuCode: "SKU_RESOLUTION",
    });

    const constructedModel = {
      pricingConfig: {
        billing: {
          paramConstructors: {
            "body.image_settings": (params: Record<string, number>) => ({
              duration: params.duration,
            }),
          },
        },
        fieldMapping: {
          mode: "body.mode",
        },
      },
      modelConfig: {
        config: {
          billingExpr: "sku * body.image_settings.duration",
          openapiSchema: "{}",
        },
        skuMappings: [
          {
            celExpr: 'body.mode == "standard"',
            skuCode: "SKU_CONSTRUCTED",
          },
        ],
      },
    } as any;

    expect(
      calculatePriceForSingleParams(
        { duration: 3, mode: "STANDARD" },
        constructedModel,
        { SKU_CONSTRUCTED: 0.2 },
      ),
    ).toMatchObject({
      discountPrice: 0.6,
      originalPrice: 0.6,
      price: 0.6,
      skuCode: "SKU_CONSTRUCTED",
    });
  });

  it("keeps source price for simple sku expressions and returns dash for missing matches or prices", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation();
    const simpleModel = {
      pricingConfig: {
        fieldMapping: {
          mode: "body.mode",
        },
      },
      modelConfig: {
        config: {
          billingExpr: "sku",
          openapiSchema: "{}",
        },
        skuMappings: [
          {
            celExpr: 'body.mode == "fast"',
            skuCode: "SKU_FAST_SIMPLE",
          },
        ],
      },
    } as any;

    expect(
      calculatePriceForSingleParams({ mode: "fast" }, simpleModel, {
        SKU_FAST_SIMPLE: "Contact us",
      }),
    ).toEqual({
      discountPrice: "Contact us",
      originalPrice: "Contact us",
      price: "Contact us",
      skuCode: "SKU_FAST_SIMPLE",
    });

    expect(
      calculatePriceForSingleParams({ mode: "slow" }, simpleModel, {
        SKU_FAST_SIMPLE: 0.4,
      }),
    ).toEqual({
      price: "-",
      skuCode: null,
    });
    expect(warnSpy).toHaveBeenCalledWith(
      "[Playground price] Match failure reason:",
      expect.stringContaining("SKU_FAST_SIMPLE"),
    );

    expect(
      calculatePriceForSingleParams({ mode: "fast" }, simpleModel, {
        SKU_FAST_SIMPLE: 0,
      }),
    ).toEqual({
      discountPrice: 0,
      originalPrice: 0,
      price: 0,
      skuCode: "SKU_FAST_SIMPLE",
    });

    warnSpy.mockRestore();
  });

  it("generates rows from SKUs with duration fallbacks, mode derivation and absolute billing output", () => {
    const rows = generateTableRows(
      {
        pricingConfig: {
          billing: {
            paramDefaults: {
              "body.duration": "6",
            },
          },
          fieldMapping: {
            images: "body.images",
            mode: "body.mode",
            size: "body.size",
          },
          priceFactors: {
            mode: {
              column: {
                dataIndex: "mode",
                title: "Mode",
              },
            },
            resolution: {
              column: {
                dataIndex: "resolution",
                title: "Resolution",
              },
            },
          },
          table: {
            columnValueDerivers: {
              skuLabel: ({ celExpr, row, skuCode }: any) =>
                `${skuCode}:${row.resolution}:${celExpr.includes("size")}`,
            },
            rowMode: "per-sku",
          },
        },
        modelConfig: {
          config: {
            billingExpr: "body.duration * 100",
            openapiSchema: "{}",
          },
          skuMappings: [
            {
              celExpr: 'body.size == "1920*1080"',
              skuCode: "TXT_TO_IMG_STANDARD",
            },
            {
              celExpr: "size(body.images) > 0",
              skuCode: "IMG_TO_IMG_LORA",
            },
          ],
        },
      } as any,
      {
        IMG_TO_IMG_LORA: {
          discountPrice: 0.5,
          originalPrice: 1,
        },
        TXT_TO_IMG_STANDARD: 0.4,
      },
    );

    expect(rows).toEqual([
      expect.objectContaining({
        discountPrice: 0.06,
        duration: 6,
        mode: "Text-to-Image",
        originalPrice: 0.06,
        price: 0.06,
        resolution: "1080P",
        skuCode: "TXT_TO_IMG_STANDARD",
        skuLabel: "TXT_TO_IMG_STANDARD:1080P:true",
      }),
      expect.objectContaining({
        duration: 6,
        mode: "Image-to-Image (LoRA)",
        price: 0.06,
        skuCode: "IMG_TO_IMG_LORA",
      }),
    ]);
  });

  it("returns no rows when pricing config and SKU mappings cannot infer factors", () => {
    expect(
      generateTableRows(
        {
          modelConfig: {
            config: {
              billingExpr: "",
              category: "video_gen",
              openapiSchema: "{}",
            },
            skuMappings: [],
          },
        } as any,
        {},
      ),
    ).toEqual([]);
  });

  it("uses fallback column labels and omits empty price units", () => {
    const columns = getTableColumns(
      [
        {
          name: "quality",
          values: ["standard"],
        },
      ] as any,
      {
        fieldMapping: {
          quality: "body.quality",
        },
      } as any,
      {},
    );

    expect(columns).toHaveLength(2);
    expect(columns[0]).toMatchObject({
      dataIndex: "quality",
      order: 999,
      title: "quality",
    });
    expect(columns[0].render).toBeUndefined();
    expect(columns[1].render?.(2.5, {})).toBe("$2.5");
  });

  it("uses duration factor defaults and skips response body billing expressions", () => {
    const rows = generateTableRows(
      {
        pricingConfig: {
          fieldMapping: {
            mode: "body.mode",
          },
          priceFactors: {
            duration: {
              column: {
                dataIndex: "duration",
                title: "Duration",
              },
              values: [7],
            },
            mode: {
              column: {
                dataIndex: "mode",
                title: "Mode",
              },
            },
          },
          table: {
            rowMode: "per-sku",
          },
        },
        modelConfig: {
          config: {
            billingExpr: "response_body.usage * sku",
            openapiSchema: "{}",
          },
          skuMappings: [
            {
              celExpr: 'body.mode == "fast"',
              skuCode: "SKU_RESPONSE_BODY",
            },
          ],
        },
      } as any,
      {
        SKU_RESPONSE_BODY: 0.3,
      },
    );

    expect(rows).toEqual([
      expect.objectContaining({
        discountPrice: 0.3,
        duration: 7,
        mode: "fast",
        originalPrice: 0.3,
        price: 0.3,
        skuCode: "SKU_RESPONSE_BODY",
      }),
    ]);
  });

  it("applies nested billing constructor output in per-SKU rows", () => {
    const rows = generateTableRows(
      {
        pricingConfig: {
          billing: {
            paramConstructors: {
              "body.audio.settings": () => ({ duration: 2 }),
            },
          },
          fieldMapping: {
            tier: "body.tier",
          },
          table: {
            rowMode: "per-sku",
          },
        },
        modelConfig: {
          config: {
            billingExpr: "sku * body.audio.settings.duration",
            openapiSchema: "{}",
          },
          skuMappings: [
            {
              celExpr: 'body.tier == "pro"',
              skuCode: "SKU_AUDIO_PRO",
            },
          ],
        },
      } as any,
      {
        SKU_AUDIO_PRO: {
          discountPrice: 0.25,
          originalPrice: 0.5,
        },
      },
    );

    expect(rows).toEqual([
      expect.objectContaining({
        discountPrice: 0.5,
        originalPrice: 1,
        price: 0.5,
        skuCode: "SKU_AUDIO_PRO",
        tier: "pro",
      }),
    ]);
  });

  it("keeps base row prices when billing constructors or CEL evaluation fail", () => {
    const rows = generateTableRows(
      {
        pricingConfig: {
          billing: {
            paramConstructors: {
              "body.throw_expr": () => {
                throw new Error("constructor failed");
              },
            },
          },
          fieldMapping: {
            tier: "body.tier",
          },
          table: {
            rowMode: "per-sku",
          },
        },
        modelConfig: {
          config: {
            billingExpr: "sku * body.throw_expr.duration",
            openapiSchema: "{}",
          },
          skuMappings: [
            {
              celExpr: 'body.tier == "basic"',
              skuCode: "SKU_THROW",
            },
          ],
        },
      } as any,
      {
        SKU_THROW: 0.4,
      },
    );

    expect(rows).toEqual([
      expect.objectContaining({
        discountPrice: 0.4,
        originalPrice: 0.4,
        price: 0.4,
        skuCode: "SKU_THROW",
        tier: "basic",
      }),
    ]);
  });
});
