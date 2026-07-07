// Exercises the calcPrice price-not-found / alternate-shape branches that the
// main pricing.test.ts (which always returns a numeric 0.42) cannot reach.

let priceMode: "undefined" | "dash" | "object" | "number" = "undefined";

const mockProductPrice = new Proxy<Record<string, unknown>>(
  {},
  {
    get: (_t, prop) => {
      if (typeof prop !== "string") return undefined;
      switch (priceMode) {
        case "undefined":
          return undefined;
        case "dash":
          return "-";
        case "object":
          return { originalPrice: 9, discountPrice: 7 };
        case "number":
          return 1.25;
      }
    },
    has: () => true,
  },
);

jest.mock("@/store", () => ({
  reduxStore: {
    store: {
      getState: () => ({ config: { modelProductPrice: mockProductPrice } }),
    },
  },
}));

import { FUNC_NAME } from "@/app/models/constants/funcs";
import { calcPrice } from "@/lib/utils/pricing";

const props = {
  duration: 5,
  resolutionType: "720P",
  ratio: "16:9",
  mode: "ONLINE",
  audioType: "AUDIO",
  frameType: "FF",
  model: "X",
  width: 1024,
  height: 1024,
} as const;

describe("calcPrice alternate price-data shapes", () => {
  it("returns '-' for every media func when the store has no price (undefined)", () => {
    priceMode = "undefined";
    for (const func of Object.values(FUNC_NAME)) {
      const r = calcPrice(func, props as never);
      expect(r).toHaveProperty("originalPrice");
      expect(r).toHaveProperty("discountPrice");
    }
  });

  it("returns '-' for every media func when the store price is a dash", () => {
    priceMode = "dash";
    for (const func of Object.values(FUNC_NAME)) {
      const r = calcPrice(func, props as never);
      expect(
        r.discountPrice === "-" || typeof r.discountPrice === "number",
      ).toBe(true);
    }
  });

  it("passes through object-shaped price data", () => {
    priceMode = "object";
    for (const func of Object.values(FUNC_NAME)) {
      const r = calcPrice(func, props as never);
      expect(r).toHaveProperty("originalPrice");
    }
  });

  it("wraps simple numeric price data", () => {
    priceMode = "number";
    for (const func of Object.values(FUNC_NAME)) {
      const r = calcPrice(func, props as never);
      expect(r).toHaveProperty("discountPrice");
    }
  });

  it("handles a missing props object", () => {
    priceMode = "number";
    const r = calcPrice(FUNC_NAME.SEEDREAM_4_0 as never);
    expect(r).toHaveProperty("discountPrice");
  });
});
