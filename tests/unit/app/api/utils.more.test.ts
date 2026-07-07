/* eslint-disable @typescript-eslint/no-var-requires */
const webStreams = require("stream/web");
const { TextDecoder, TextEncoder } = require("util");

global.ReadableStream = webStreams.ReadableStream;
global.TransformStream = webStreams.TransformStream;
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
global.Response = require("undici").Response;

const {
  convertToTool,
  convertToolsToAISDK,
  withKeepAlive,
} = require("@/app/api/utils");

async function readStream(stream: ReadableStream<any>) {
  const reader = stream.getReader();
  const chunks: any[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return chunks;
}

describe("app api utils — additional branches", () => {
  it("forwards source bytes and skips empty chunks through withKeepAlive", async () => {
    const encoder = new TextEncoder();
    const source = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode("alpha"));
        controller.enqueue(new Uint8Array(0)); // empty chunk -> skipped
        controller.enqueue(encoder.encode("beta"));
        controller.close();
      },
    });
    const decoder = new TextDecoder();
    const out = (await readStream(withKeepAlive(source))).map((c) =>
      decoder.decode(c),
    );
    expect(out).toEqual(["alpha", "beta"]);
  });

  it("coerces numeric strings to numbers through convertToTool number schema", () => {
    const t = convertToTool({
      name: "calc",
      description: "calc",
      parameters: {
        properties: {
          ratio: { type: "number", description: "a ratio" },
        },
        required: ["ratio"],
      },
    } as any);
    expect(t.inputSchema.parse({ ratio: "3.5" })).toEqual({ ratio: 3.5 });
    expect(t.inputSchema.parse({ ratio: 2 })).toEqual({ ratio: 2 });
    expect(() => t.inputSchema.parse({ ratio: "not-a-number" })).toThrow();
  });

  it("coerces integer strings and marks non-required fields optional", () => {
    const t = convertToTool({
      name: "page",
      description: "pager",
      parameters: {
        properties: {
          limit: { type: "integer" },
          cursor: { type: "string" },
        },
        required: ["limit"],
      },
    } as any);
    expect(t.inputSchema.parse({ limit: "10" })).toEqual({ limit: 10 });
    // cursor is optional -> can be omitted
    expect(t.inputSchema.parse({ limit: 5 })).toEqual({ limit: 5 });
    expect(() => t.inputSchema.parse({ limit: "x" })).toThrow();
  });

  it("falls back to z.any() for unknown property types and enum strings", () => {
    const t = convertToTool({
      name: "mixed",
      description: "mixed",
      parameters: {
        properties: {
          mode: { type: "string", enum: ["a", "b"] },
          flag: { type: "boolean" },
          payload: { type: "object" },
        },
        required: [],
      },
    } as any);
    const parsed = t.inputSchema.parse({
      mode: "a",
      flag: true,
      payload: { nested: 1 },
    });
    expect(parsed.mode).toBe("a");
    expect(parsed.flag).toBe(true);
    expect(() => t.inputSchema.parse({ mode: "c" })).toThrow();
  });

  it("returns an empty map for a non-array or empty tools list", () => {
    expect(convertToolsToAISDK(undefined as any)).toEqual({});
    expect(convertToolsToAISDK([])).toEqual({});
  });
});
