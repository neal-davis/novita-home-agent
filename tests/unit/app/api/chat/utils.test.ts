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
} = require("@/app/api/chat/utils");
const { LLMErrReason } = require("@/app/api/chat/type");

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

describe("app api chat stream utilities", () => {
  it("passes chunks through the identity transformer", async () => {
    const encoder = new TextEncoder();
    const chunks = await readStream(
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode("chunk"));
          controller.close();
        },
      }).pipeThrough(createStreamDataTransformer()),
    );

    expect(new TextDecoder().decode(chunks[0])).toBe("chunk");
  });

  it("parses SSE data with default and custom parsers", async () => {
    const encoder = new TextEncoder();
    const raw = await readStream(
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(encoder.encode("data: hello\n\ndata: [DONE]\n\n"));
          controller.close();
        },
      }).pipeThrough(createEventStreamTransformer()),
    );
    expect(raw).toEqual(["hello"]);

    const transformed = await readStream(
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(
            encoder.encode(
              "event: delta\ndata: world\n\nevent: done\ndata: end\n\n",
            ),
          );
          controller.close();
        },
      }).pipeThrough(
        createEventStreamTransformer((data, options) => ({
          content: `${options.event}:${data}`,
          isText: false,
        })),
      ),
    );
    expect(transformed).toEqual([{ content: "delta:world", isText: false }]);
  });

  it("converts tool definitions and skips malformed entries", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const tools = convertToolsToAISDK([
      {
        description: "Create job",
        name: "create_job",
        parameters: {
          properties: {
            count: { type: "integer" },
            enabled: { type: "boolean" },
            mode: { enum: ["fast", "slow"], type: "string" },
            weight: { type: "number" },
          },
          required: ["mode"],
        },
      } as any,
      { description: "", name: "bad", parameters: null } as any,
    ]);

    expect(Object.keys(tools)).toEqual(["create_job"]);
    expect(warnSpy).toHaveBeenCalledWith("Tool missing params:", {
      description: "",
      name: "bad",
      parameters: null,
    });
    warnSpy.mockRestore();
  });

  it("checks response shapes, trims stream prefixes and creates responses", async () => {
    expect(
      isChatCompletionChunk({
        choices: [{ delta: { content: "hello" } }],
      } as any),
    ).toBe(true);
    expect(isChatCompletionChunk({ choices: [{ text: "hello" }] } as any)).toBe(
      false,
    );
    expect(isCompletion({ choices: [{ text: "hello" }] })).toBe(true);
    expect(isCompletion({ choices: [] })).toBeFalsy();

    const trim = trimStartOfStreamHelper();
    expect(trim("\n\nhello")).toBe("hello");
    expect(trim("  next")).toBe("  next");

    const response = LLMResponseError(
      { message: "auth failed", reason: LLMErrReason.FAILED_TO_AUTH },
      401,
    );
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      message: "auth failed",
      reason: LLMErrReason.FAILED_TO_AUTH,
    });

    expect(
      new StreamingTextResponse(new ReadableStream()).headers.get(
        "Content-Type",
      ),
    ).toBe("text/plain; charset=utf-8");
  });
});
