/* eslint-disable @typescript-eslint/no-var-requires */
const webStreams = require("stream/web");
const { TextDecoder, TextEncoder } = require("util");

global.ReadableStream = webStreams.ReadableStream;
global.TransformStream = webStreams.TransformStream;
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
global.Response = require("undici").Response;

const {
  LLMResponseError,
  StreamingTextResponse,
  convertToolsToAISDK,
  createEventStreamTransformer,
  createStreamDataTransformer,
  isChatCompletionChunk,
  isCompletion,
  trimStartOfStreamHelper,
  withKeepAlive,
} = require("@/app/api/utils");
const { LLMErrReason } = require("@/app/api/type");

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

describe("app api stream utilities", () => {
  it("emits a single heartbeat when no source stream is available", async () => {
    const chunks = await readStream(withKeepAlive(null, { heartbeat: "pong" }));
    expect(new TextDecoder().decode(chunks[0])).toBe("pong");
  });

  it("passes source chunks through the keep-alive and identity transformers", async () => {
    const encoder = new TextEncoder();
    const forwarded = await readStream(
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode("data"));
          controller.close();
        },
      }).pipeThrough(createStreamDataTransformer()),
    );
    expect(new TextDecoder().decode(forwarded[0])).toBe("data");
  });

  it("parses SSE data, applies custom parsers and terminates on done events", async () => {
    const encoder = new TextEncoder();
    const source = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            "event: message\ndata: first\n\nevent: done\ndata: ignored\n\n",
          ),
        );
        controller.close();
      },
    });
    const parsed = await readStream(
      source.pipeThrough(
        createEventStreamTransformer(
          (data, options) => `${options.event}:${data.toUpperCase()}`,
        ),
      ),
    );

    expect(parsed).toEqual(["message:FIRST"]);
  });

  it("converts valid function definitions to AI SDK tools and skips malformed definitions", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const tools = convertToolsToAISDK([
      {
        description: "Search models",
        name: "search",
        parameters: {
          properties: {
            enabled: { type: "boolean" },
            limit: { description: "Max rows", type: "integer" },
            mode: { enum: ["fast", "quality"], type: "string" },
            score: { type: "number" },
            unknown: { type: "object" },
          },
          required: ["mode", "limit"],
        },
      } as any,
      { name: "", description: "bad", parameters: {} } as any,
    ]);

    expect(Object.keys(tools)).toEqual(["search"]);
    expect(warnSpy).toHaveBeenCalledWith("Tool missing params:", {
      description: "bad",
      name: "",
      parameters: {},
    });
    warnSpy.mockRestore();
  });

  it("checks OpenAI response shapes, trims only stream prefixes and creates error responses", async () => {
    expect(
      isChatCompletionChunk({
        choices: [{ delta: { content: "hello" } }],
      } as any),
    ).toBe(true);
    expect(isChatCompletionChunk({ choices: [{ text: "hello" }] } as any)).toBe(
      false,
    );
    expect(isCompletion({ choices: [{ text: "hello" }] })).toBe(true);
    expect(isCompletion({ choices: [{ delta: {} }] })).toBe(false);

    const trim = trimStartOfStreamHelper();
    expect(trim("   ")).toBe("");
    expect(trim("  first")).toBe("first");
    expect(trim("  second")).toBe("  second");

    const response = LLMResponseError(
      {
        message: "failed",
        reason: LLMErrReason.INTERNAL_SERVER_ERROR,
      },
      500,
    );
    expect(response.status).toBe(500);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    await expect(response.json()).resolves.toEqual({
      message: "failed",
      reason: LLMErrReason.INTERNAL_SERVER_ERROR,
    });

    const streaming = new StreamingTextResponse(new ReadableStream());
    expect(streaming.status).toBe(200);
    expect(streaming.headers.get("Content-Type")).toBe(
      "text/plain; charset=utf-8",
    );
  });
});
