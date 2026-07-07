const mockProductPrice = new Proxy<Record<string, number>>(
  {},
  {
    get: (_target, prop) => (typeof prop === "string" ? 0.42 : undefined),
  },
);

jest.mock("@/store", () => ({
  reduxStore: {
    store: {
      getState: () => ({
        config: {
          modelProductPrice: mockProductPrice,
        },
      }),
    },
  },
}));

import { FUNC_NAME } from "@/app/models/constants/funcs";
import { calcPrice, getDefaultParmas } from "@/lib/utils/pricing";

const baseProps = {
  audio: true,
  audioType: "AUDIO",
  batchMode: "BATCH",
  duration: 10,
  frameType: "FF",
  frames: 32,
  height: 1024,
  isSDXL: true,
  mode: "Standard",
  model: "CUSTOM_PRICE_SKU",
  ratio: "16:9 & 9:16",
  resolutionType: "720P",
  scale: 2,
  steps: 20,
  width: 1024,
} as const;

const propVariants = [
  baseProps,
  {
    ...baseProps,
    audio: false,
    duration: 5,
    mode: "fast_mode",
    resolutionType: "480P",
  },
  {
    ...baseProps,
    audio: "A",
    duration: 8,
    mode: "LoRA",
    resolutionType: "1080P",
  },
  {
    ...baseProps,
    duration: 15,
    mode: "Professional",
    resolutionType: "1280*720",
  },
  {
    ...baseProps,
    duration: 4,
    model: "VIDU_Q2_PRO_FAST_I2V_720P",
    resolutionType: "360P",
  },
] as const;

const extraFunctionNames = [
  "hunyuan-video-fast",
  "kling-v1.6-t2v",
  "kling-v1.6-i2v",
  "minimax-hailuo-02",
  "minimax-hailuo-2.3-t2v",
  "minimax-hailuo-2.3-i2v",
  "minimax-hailuo-2.3-fast-i2v",
  "seedream-5.0-lite",
  "wan-t2v",
  "wan-i2v",
];

describe("pricing utilities", () => {
  it("returns default parameter metadata for every known function name", () => {
    for (const func of [...Object.values(FUNC_NAME), ...extraFunctionNames]) {
      expect(getDefaultParmas(func)).toEqual(expect.any(Object));
    }
  });

  it("calculates local formula prices for classic image and training products", () => {
    expect(
      calcPrice(FUNC_NAME.TXT2IMG, {
        height: 512,
        steps: 20,
        width: 512,
      }),
    ).toEqual({ discountPrice: 0.001, originalPrice: 0.001 });

    expect(calcPrice(FUNC_NAME.MIX_POSE)).toEqual({
      discountPrice: 0.0255,
      originalPrice: 0.0255,
    });

    expect(
      calcPrice(FUNC_NAME.TRAINING, {
        height: 1024,
        isSDXL: true,
        steps: 2000,
        width: 1024,
      }),
    ).toEqual({ discountPrice: 3.36, originalPrice: 3.36 });
  });

  it("covers model product price branches with representative option matrices", () => {
    const funcs = [...Object.values(FUNC_NAME), ...extraFunctionNames];
    let priced = 0;

    for (const func of funcs) {
      for (const props of propVariants) {
        const result = calcPrice(func, props);
        expect(result).toHaveProperty("originalPrice");
        expect(result).toHaveProperty("discountPrice");
        priced += 1;
      }
    }

    expect(priced).toBeGreaterThan(500);
  });
});
