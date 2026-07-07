jest.mock(
  "@marcbachmann/cel-js",
  () => ({
    Environment: class {
      addFunctions() {
        return this;
      }
      evaluate(expr: string, context: Record<string, unknown>) {
        if (expr.includes("int(duration) * 2"))
          return BigInt(Number(context.duration) * 2);
        if (expr.includes("720P")) return context.resolution === "720P";
        if (expr.includes("480P"))
          return context.resolution === "480P" && context.duration === 5;
        if (expr.includes("duration * 1000"))
          return BigInt(Number(context.duration || 0) * 1000);
        return true;
      }
    },
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
import {
  evaluateExtended,
  needsExtendedEvaluation,
} from "@/lib/utils/dynamic-pricing/cel-evaluator";
import { calcPrice, getDefaultParmas } from "@/lib/utils/pricing";

const modelConfig = {
  pricingConfig: {
    fieldMapping: {
      duration: "body.duration",
      resolution: "body.resolution",
      size: "body.size",
    },
    table: { priceUnit: "sec", rowMode: "per-sku" },
  },
  modelConfig: {
    skuMappings: [
      {
        skuCode: "sku-480",
        celExpr: 'body.resolution == "480P" && body.duration == 5',
      },
      { skuCode: "sku-720", celExpr: 'body.resolution == "720P"' },
    ],
    config: {
      category: "video_gen",
      billingExpr: "duration * 1000",
      openapiSchema: JSON.stringify({}),
    },
  },
} as any;

const copy = {
  pricing_table: {
    video: { second: "s" },
  },
};

describe("dynamic pricing large helpers", () => {
  it("generates factor combinations and table columns", () => {
    const combinations = generatePriceFactorCombinations([
      { name: "duration", values: [5, 10] },
      { name: "resolution", values: ["480P", "720P"] },
    ] as any);
    expect(combinations).toHaveLength(4);

    const columns = getTableColumns(
      [
        {
          name: "duration",
          values: [5],
          displayConfig: {
            column: {
              title: "Duration",
              dataIndex: "duration",
              render: "duration",
              order: 2,
            },
          },
        },
        {
          name: "resolution",
          values: ["480P"],
          displayConfig: {
            column: {
              title: "Resolution",
              dataIndex: "resolution",
              render: "resolution",
              order: 1,
            },
          },
        },
      ] as any,
      modelConfig.pricingConfig,
      copy,
    );
    expect(columns.map((column) => column.dataIndex)).toEqual([
      "resolution",
      "duration",
      "price",
    ]);
    expect(columns[1].render?.(5, {})).toBe("5s");
    expect(columns[2].render?.(0.25, {})).toBe("$0.25 /sec");
  });

  it("maps playground params and calculates prices", () => {
    expect(
      convertPlaygroundParamsToFieldMapping(
        { width: 720, height: 1280, duration: 5 },
        modelConfig,
      ),
    ).toMatchObject({ duration: 5, resolution: "720P", size: "720*1280" });

    expect(
      calculatePriceForSingleParams(
        { resolution: "720P", duration: 5 },
        modelConfig,
        { "sku-720": { originalPrice: 0.5, discountPrice: 0.25 } },
      ),
    ).toMatchObject({ skuCode: "sku-720" });

    expect(
      calculatePlaygroundPrice(
        { resolution: "720P", duration: 5 },
        modelConfig,
        { "sku-720": 0.25 },
      ),
    ).toMatchObject({ skuCode: "sku-720" });
  });

  it("generates rows and handles CEL evaluator fallbacks", () => {
    const rows = generateTableRows(modelConfig, {
      "sku-480": 0.12,
      "sku-720": 0.25,
    });
    expect(rows.length).toBeGreaterThan(0);

    expect(needsExtendedEvaluation("items.map(x, x.price).sum()")).toBe(true);
    expect(needsExtendedEvaluation("duration * 2")).toBe(false);
    expect(evaluateExtended("int(duration) * 2", { duration: 5 })).toBe(
      BigInt(10),
    );
  });

  it("covers legacy pricing utility branches", () => {
    expect(getDefaultParmas("txt2img")).toBeTruthy();
    expect(
      calcPrice("txt2img", { steps: 20, width: 512, height: 512 } as any),
    ).toBeTruthy();
    expect(calcPrice("unknown", {} as any)).toEqual({
      originalPrice: "-",
      discountPrice: "-",
    });
  });
});
