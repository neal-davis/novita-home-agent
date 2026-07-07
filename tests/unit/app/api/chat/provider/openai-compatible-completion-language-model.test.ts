// eslint-disable-next-line no-var
var mockPostJsonToApi: jest.Mock;
// eslint-disable-next-line no-var
var mockParseProviderOptions: jest.Mock;

jest.mock("@ai-sdk/provider-utils", () => ({
  combineHeaders: (...headers: Array<Record<string, string | undefined>>) =>
    Object.assign({}, ...headers),
  createEventSourceResponseHandler: jest.fn((schema) => ({
    schema,
    type: "event-source",
  })),
  createJsonErrorResponseHandler: jest.fn((structure) => ({
    structure,
    type: "json-error",
  })),
  createJsonResponseHandler: jest.fn((schema) => ({
    schema,
    type: "json",
  })),
  parseProviderOptions: (...args: any[]) =>
    (mockParseProviderOptions as (...requestArgs: any[]) => unknown)(...args),
  postJsonToApi: (...args: any[]) =>
    (mockPostJsonToApi as (...requestArgs: any[]) => unknown)(...args),
}));

jest.mock(
  "@/app/api/chat/provider/completion/convert-to-openai-compatible-completion-prompt",
  () => ({
    convertToOpenAICompatibleCompletionPrompt: jest.fn(() => ({
      prompt: "converted prompt",
      stopSequences: ["PROMPT_STOP"],
    })),
  }),
);

import { OpenAICompatibleCompletionLanguageModel } from "@/app/api/chat/provider/completion/openai-compatible-completion-language-model";
import { ReadableStream, TransformStream } from "stream/web";

describe("OpenAICompatibleCompletionLanguageModel", () => {
  function createModel(includeUsage = false) {
    return new OpenAICompatibleCompletionLanguageModel("text-test", {
      fetch: jest.fn(),
      headers: () => ({ Authorization: "Bearer provider-token" }),
      includeUsage,
      provider: "openai.completion",
      supportedUrls: () => ({ "text/plain": [/^https:\/\/files\.test\//] }),
      url: ({ modelId, path }) => `https://api.test/${modelId}${path}`,
    });
  }

  beforeEach(() => {
    (global as any).TransformStream = TransformStream;
    jest.clearAllMocks();
    mockPostJsonToApi = jest.fn();
    mockParseProviderOptions = jest.fn(
      async ({ providerOptions, provider }) => providerOptions?.[provider],
    );
    mockPostJsonToApi.mockResolvedValue({
      rawValue: { raw: true },
      responseHeaders: { "x-request-id": "completion-req-1" },
      value: {
        choices: [{ finish_reason: "stop", text: "completion text" }],
        created: 1710000200,
        id: "cmpl-1",
        model: "text-test",
        usage: {
          completion_tokens: 7,
          prompt_tokens: 5,
          total_tokens: 12,
        },
      },
    });
  });

  async function collectStream<T>(stream: ReadableStream<T>) {
    const reader = stream.getReader();
    const chunks: T[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    return chunks;
  }

  it("generates completions with mapped request args, usage and warnings", async () => {
    const model = createModel();

    const result = await model.doGenerate({
      frequencyPenalty: 0.2,
      headers: { "X-Trace": "trace-1" },
      maxOutputTokens: 32,
      presencePenalty: 0.3,
      prompt: [{ content: "hello", role: "user" }] as any,
      providerOptions: {
        openai: {
          echo: true,
          logitBias: { "42": -1 },
          suffix: "suffix text",
          user: "user-1",
        },
      },
      responseFormat: { type: "json" } as any,
      seed: 123,
      stopSequences: ["USER_STOP"],
      temperature: 0.7,
      toolChoice: { type: "auto" },
      tools: [{ name: "unused", type: "function" }] as any,
      topK: 3,
      topP: 0.9,
    } as any);

    expect(mockPostJsonToApi).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          echo: true,
          frequency_penalty: 0.2,
          logit_bias: { "42": -1 },
          max_tokens: 32,
          model: "text-test",
          presence_penalty: 0.3,
          prompt: "converted prompt",
          seed: 123,
          stop: ["PROMPT_STOP", "USER_STOP"],
          suffix: "suffix text",
          temperature: 0.7,
          top_p: 0.9,
          user: "user-1",
        }),
        headers: expect.objectContaining({
          Authorization: "Bearer provider-token",
          "X-Trace": "trace-1",
        }),
        url: "https://api.test/text-test/completions",
      }),
    );
    expect(result.content).toEqual([{ text: "completion text", type: "text" }]);
    expect(result.finishReason).toBe("stop");
    expect(result.usage).toEqual({
      inputTokens: 5,
      outputTokens: 7,
      totalTokens: 12,
    });
    expect(result.response).toMatchObject({
      body: { raw: true },
      headers: { "x-request-id": "completion-req-1" },
      id: "cmpl-1",
      modelId: "text-test",
    });
    expect(result.response!.timestamp).toEqual(new Date(1710000200 * 1000));
    expect(result.warnings).toEqual([
      { setting: "topK", type: "unsupported-setting" },
      { setting: "tools", type: "unsupported-setting" },
      { setting: "toolChoice", type: "unsupported-setting" },
      {
        details: "JSON response format is not supported.",
        setting: "responseFormat",
        type: "unsupported-setting",
      },
    ]);
  });

  it("streams text, usage, raw chunks and parse errors", async () => {
    const model = createModel(true);
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue({
          rawValue: { chunk: 1 },
          success: true,
          value: {
            choices: [{ text: "hello" }],
            created: 1710000300,
            id: "cmpl-stream-1",
            model: "text-test",
          },
        });
        controller.enqueue({
          rawValue: { chunk: 2 },
          success: true,
          value: {
            choices: [{ finish_reason: "length", text: " world" }],
            usage: {
              completion_tokens: 4,
              prompt_tokens: 6,
              total_tokens: 10,
            },
          },
        });
        controller.enqueue({
          error: new Error("bad event"),
          rawValue: { chunk: 3 },
          success: false,
        });
        controller.close();
      },
    });

    mockPostJsonToApi.mockResolvedValueOnce({
      responseHeaders: { "x-stream": "1" },
      value: source,
    });

    const result = await model.doStream({
      includeRawChunks: true,
      prompt: [{ content: "stream", role: "user" }] as any,
    } as any);

    expect(mockPostJsonToApi).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          prompt: "converted prompt",
          stream: true,
          stream_options: { include_usage: true },
        }),
      }),
    );

    const chunks = await collectStream(result.stream as any);

    expect(chunks).toEqual([
      { type: "stream-start", warnings: [] },
      { rawValue: { chunk: 1 }, type: "raw" },
      {
        id: "cmpl-stream-1",
        modelId: "text-test",
        timestamp: new Date(1710000300 * 1000),
        type: "response-metadata",
      },
      { id: "0", type: "text-start" },
      { delta: "hello", id: "0", type: "text-delta" },
      { rawValue: { chunk: 2 }, type: "raw" },
      { delta: " world", id: "0", type: "text-delta" },
      { rawValue: { chunk: 3 }, type: "raw" },
      { error: expect.any(Error), type: "error" },
      { id: "0", type: "text-end" },
      {
        finishReason: "error",
        type: "finish",
        usage: {
          inputTokens: 6,
          outputTokens: 4,
          totalTokens: 10,
        },
      },
    ]);
    expect(result.request!.body).toMatchObject({ stream: true });
    expect(result.response!.headers).toEqual({ "x-stream": "1" });
  });

  it("exposes provider and configured supported urls", () => {
    const model = createModel();

    expect(model.provider).toBe("openai.completion");
    expect(
      (model.supportedUrls as Record<string, RegExp[]>)["text/plain"][0].test(
        "https://files.test/a.txt",
      ),
    ).toBe(true);
  });
});
