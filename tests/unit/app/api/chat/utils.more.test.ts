/* eslint-disable @typescript-eslint/no-var-requires */
const webStreams = require("stream/web");
const { TextDecoder, TextEncoder } = require("util");

global.ReadableStream = webStreams.ReadableStream;
global.TransformStream = webStreams.TransformStream;
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
global.Response = require("undici").Response;

const { convertToTool, convertToolsToAISDK } = require("@/app/api/chat/utils");

describe("app api chat utils — convertToTool branches", () => {
  it("coerces numeric strings and rejects non-numeric strings", () => {
    const t = convertToTool({
      name: "n",
      description: "n",
      parameters: {
        properties: { score: { type: "number" } },
        required: ["score"],
      },
    } as any);
    expect(t.inputSchema.parse({ score: "1.25" })).toEqual({ score: 1.25 });
    expect(t.inputSchema.parse({ score: 4 })).toEqual({ score: 4 });
    expect(() => t.inputSchema.parse({ score: "nope" })).toThrow();
  });

  it("coerces integer strings and treats non-required props as optional", () => {
    const t = convertToTool({
      name: "i",
      description: "i",
      parameters: {
        properties: {
          count: { type: "integer", description: "how many" },
          note: { type: "string" },
        },
        required: ["count"],
      },
    } as any);
    expect(t.inputSchema.parse({ count: "42" })).toEqual({ count: 42 });
    expect(t.inputSchema.parse({ count: 7 })).toEqual({ count: 7 });
    expect(() => t.inputSchema.parse({ count: "x" })).toThrow();
  });

  it("supports enum strings, booleans and unknown (z.any) types", () => {
    const t = convertToTool({
      name: "m",
      description: "m",
      parameters: {
        properties: {
          mode: { type: "string", enum: ["fast", "slow"] },
          on: { type: "boolean" },
          extra: { type: "array" },
        },
        required: [],
      },
    } as any);
    const out = t.inputSchema.parse({ mode: "fast", on: false, extra: [1, 2] });
    expect(out.mode).toBe("fast");
    expect(out.on).toBe(false);
    expect(out.extra).toEqual([1, 2]);
    expect(() => t.inputSchema.parse({ mode: "invalid" })).toThrow();
  });

  it("returns an empty map for non-array / empty tool lists", () => {
    expect(convertToolsToAISDK(null as any)).toEqual({});
    expect(convertToolsToAISDK([])).toEqual({});
  });
});
