// eslint-disable-next-line no-var
var mockPostJsonToApi: jest.Mock;
// eslint-disable-next-line no-var
var mockParseProviderOptions: jest.Mock;

jest.mock("@ai-sdk/provider-utils", () => ({
  combineHeaders: (...headers: Array<Record<string, string | undefined>>) =>
    Object.assign({}, ...headers),
  convertToBase64: (data: Buffer | Uint8Array | string) =>
    Buffer.from(data as any).toString("base64"),
  createEventSourceResponseHandler: jest.fn((schema) => ({
    type: "event-source",
    schema,
  })),
  createJsonErrorResponseHandler: jest.fn((structure) => ({
    type: "json-error",
    structure,
  })),
  createJsonResponseHandler: jest.fn((schema) => ({
    type: "json",
    schema,
  })),
  generateId: jest.fn(() => "generated-id"),
  isParsableJson: jest.fn((value: string) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  }),
  parseProviderOptions: (...args: any[]) =>
    (mockParseProviderOptions as (...requestArgs: any[]) => unknown)(...args),
  postJsonToApi: (...args: any[]) =>
    (mockPostJsonToApi as (...requestArgs: any[]) => unknown)(...args),
}));

import { OpenAICompatibleChatLanguageModel } from "@/app/api/chat/provider/chat/openai-compatible-chat-language-model";
import { ReadableStream, TransformStream } from "stream/web";

describe("OpenAICompatibleChatLanguageModel", () => {
  const metadataExtractor = {
    createStreamExtractor: jest.fn(() => ({
      buildMetadata: jest.fn(() => ({
        openai: { streamRequestId: "stream-req-1" },
      })),
      processChunk: jest.fn(),
    })),
    extractMetadata: jest.fn(async () => ({
      openai: { requestId: "req-1" },
    })),
  };

  function createModel(supportsStructuredOutputs = false) {
    return new OpenAICompatibleChatLanguageModel("gpt-test", {
      fetch: jest.fn(),
      headers: () => ({ Authorization: "Bearer provider-token" }),
      metadataExtractor,
      provider: "openai.chat",
      supportsStructuredOutputs,
      url: ({ modelId, path }) => `https://api.test/${modelId}${path}`,
    });
  }

  beforeEach(() => {
    (global as any).TransformStream = TransformStream;
    mockPostJsonToApi = jest.fn();
    mockParseProviderOptions = jest.fn(
      async ({ providerOptions, provider }) => providerOptions?.[provider],
    );
    jest.clearAllMocks();
    metadataExtractor.extractMetadata.mockResolvedValue({
      openai: { requestId: "req-1" },
    });
    mockPostJsonToApi.mockResolvedValue({
      rawValue: { raw: true },
      responseHeaders: { "x-request-id": "req-1" },
      value: {
        choices: [
          {
            finish_reason: "tool_calls",
            message: {
              content: "final answer",
              reasoning_content: "private reasoning",
              role: "assistant",
              tool_calls: [
                {
                  function: {
                    arguments: '{"q":"gpu"}',
                    name: "search_docs",
                  },
                  id: "call-1",
                },
                {
                  function: {
                    arguments: '{"fallback":true}',
                    name: "fallback_tool",
                  },
                },
              ],
            },
          },
        ],
        created: 1710000000,
        id: "chatcmpl-1",
        model: "gpt-test",
        usage: {
          completion_tokens: 7,
          completion_tokens_details: {
            accepted_prediction_tokens: 3,
            reasoning_tokens: 2,
            rejected_prediction_tokens: 1,
          },
          prompt_tokens: 11,
          prompt_tokens_details: {
            cached_tokens: 5,
          },
          total_tokens: 18,
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

  it("generates chat completions with mapped content, usage and metadata", async () => {
    const model = createModel();

    const result = await model.doGenerate({
      frequencyPenalty: 0.2,
      headers: { "X-Trace": "trace-1" },
      maxOutputTokens: 64,
      presencePenalty: 0.3,
      prompt: [
        { content: "You are concise", role: "system" },
        { content: [{ text: "hello", type: "text" }], role: "user" },
      ] as any,
      providerOptions: {
        openai: {
          custom_flag: "kept",
          reasoningEffort: "medium",
          user: "user-1",
        },
      },
      responseFormat: {
        description: "JSON result",
        name: "answer",
        schema: { type: "object" },
        type: "json",
      } as any,
      seed: 123,
      stopSequences: ["END"],
      temperature: 0.7,
      toolChoice: { toolName: "search_docs", type: "tool" },
      tools: [
        {
          description: "Search docs",
          inputSchema: {
            properties: { q: { type: "string" } },
            type: "object",
          },
          name: "search_docs",
          type: "function",
        },
        {
          id: "provider-tool",
          name: "provider tool",
          type: "provider-defined",
        },
      ] as any,
      topK: 5,
      topP: 0.9,
    } as any);

    expect(mockPostJsonToApi).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          custom_flag: "kept",
          frequency_penalty: 0.2,
          max_tokens: 64,
          messages: [
            { content: "You are concise", role: "system" },
            { content: "hello", role: "user" },
          ],
          model: "gpt-test",
          presence_penalty: 0.3,
          reasoningEffort: "medium",
          reasoning_effort: "medium",
          response_format: { type: "json_object" },
          seed: 123,
          stop: ["END"],
          temperature: 0.7,
          tool_choice: {
            function: { name: "search_docs" },
            type: "function",
          },
          tools: [
            {
              function: {
                description: "Search docs",
                name: "search_docs",
                parameters: {
                  properties: { q: { type: "string" } },
                  type: "object",
                },
              },
              type: "function",
            },
          ],
          user: "user-1",
        }),
        headers: expect.objectContaining({
          Authorization: "Bearer provider-token",
          "X-Trace": "trace-1",
        }),
        url: "https://api.test/gpt-test/chat/completions",
      }),
    );

    expect(result.content).toEqual([
      { text: "final answer", type: "text" },
      { text: "private reasoning", type: "reasoning" },
      {
        input: '{"q":"gpu"}',
        toolCallId: "call-1",
        toolName: "search_docs",
        type: "tool-call",
      },
      {
        input: '{"fallback":true}',
        toolCallId: "generated-id",
        toolName: "fallback_tool",
        type: "tool-call",
      },
    ]);
    expect(result.finishReason).toBe("tool-calls");
    expect(result.usage).toEqual({
      cachedInputTokens: 5,
      inputTokens: 11,
      outputTokens: 7,
      reasoningTokens: 2,
      totalTokens: 18,
    });
    expect(result.providerMetadata).toEqual({
      openai: {
        acceptedPredictionTokens: 3,
        rejectedPredictionTokens: 1,
        requestId: "req-1",
      },
    });
    expect(result.response).toMatchObject({
      body: { raw: true },
      headers: { "x-request-id": "req-1" },
      id: "chatcmpl-1",
      modelId: "gpt-test",
    });
    expect(result.response!.timestamp).toEqual(new Date(1710000000 * 1000));
    expect(result.warnings).toEqual([
      { setting: "topK", type: "unsupported-setting" },
      {
        details:
          "JSON response format schema is only supported with structuredOutputs",
        setting: "responseFormat",
        type: "unsupported-setting",
      },
      {
        tool: expect.objectContaining({ id: "provider-tool" }),
        type: "unsupported-tool",
      },
    ]);
  });

  it("uses structured JSON schema when enabled", async () => {
    const model = createModel(true);

    await model.doGenerate({
      prompt: [
        { content: [{ text: "json", type: "text" }], role: "user" },
      ] as any,
      responseFormat: {
        description: "Structured result",
        name: "structured",
        schema: { properties: { ok: { type: "boolean" } }, type: "object" },
        type: "json",
      } as any,
    } as any);

    expect(mockPostJsonToApi).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          response_format: {
            json_schema: {
              description: "Structured result",
              name: "structured",
              schema: {
                properties: { ok: { type: "boolean" } },
                type: "object",
              },
            },
            type: "json_schema",
          },
        }),
      }),
    );
  });

  it("streams reasoning, text, tool calls, usage and raw chunks", async () => {
    const model = createModel();
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue({
          rawValue: { chunk: 1 },
          success: true,
          value: {
            choices: [
              {
                delta: {
                  reasoning_content: "think",
                  role: "assistant",
                },
              },
            ],
            created: 1710000001,
            id: "stream-1",
            model: "gpt-test",
          },
        });
        controller.enqueue({
          rawValue: { chunk: 2 },
          success: true,
          value: {
            choices: [
              {
                delta: {
                  content: "hello",
                  tool_calls: [
                    {
                      function: {
                        arguments: '{"q":',
                        name: "search_docs",
                      },
                      id: "call-1",
                      index: 0,
                    },
                  ],
                },
              },
            ],
          },
        });
        controller.enqueue({
          rawValue: { chunk: 3 },
          success: true,
          value: {
            choices: [
              {
                delta: {
                  content: " world",
                  tool_calls: [
                    {
                      function: {
                        arguments: '"gpu"}',
                      },
                      index: 0,
                    },
                  ],
                },
                finish_reason: "stop",
              },
            ],
            usage: {
              completion_tokens: 4,
              completion_tokens_details: {
                accepted_prediction_tokens: 2,
                reasoning_tokens: 1,
                rejected_prediction_tokens: 1,
              },
              prompt_tokens: 6,
              prompt_tokens_details: { cached_tokens: 3 },
              total_tokens: 10,
            },
          },
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
      prompt: [
        { content: [{ text: "stream", type: "text" }], role: "user" },
      ] as any,
      tools: [
        {
          inputSchema: { type: "object" },
          name: "search_docs",
          type: "function",
        },
      ] as any,
    } as any);

    expect(mockPostJsonToApi).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          messages: [{ content: "stream", role: "user" }],
          stream: true,
          stream_options: undefined,
        }),
      }),
    );

    const chunks = await collectStream(result.stream as any);

    expect(chunks).toEqual([
      { type: "stream-start", warnings: [] },
      { rawValue: { chunk: 1 }, type: "raw" },
      {
        id: "stream-1",
        modelId: "gpt-test",
        timestamp: new Date(1710000001 * 1000),
        type: "response-metadata",
      },
      { id: "reasoning-0", type: "reasoning-start" },
      { delta: "think", id: "reasoning-0", type: "reasoning-delta" },
      { rawValue: { chunk: 2 }, type: "raw" },
      { id: "txt-0", type: "text-start" },
      { delta: "hello", id: "txt-0", type: "text-delta" },
      {
        id: "call-1",
        toolName: "search_docs",
        type: "tool-input-start",
      },
      { delta: '{"q":', id: "call-1", type: "tool-input-delta" },
      { rawValue: { chunk: 3 }, type: "raw" },
      { delta: " world", id: "txt-0", type: "text-delta" },
      { delta: '"gpu"}', id: "call-1", type: "tool-input-delta" },
      { id: "call-1", type: "tool-input-end" },
      {
        input: '{"q":"gpu"}',
        toolCallId: "call-1",
        toolName: "search_docs",
        type: "tool-call",
      },
      { id: "reasoning-0", type: "reasoning-end" },
      { id: "txt-0", type: "text-end" },
      {
        finishReason: "stop",
        providerMetadata: {
          openai: {
            acceptedPredictionTokens: 2,
            rejectedPredictionTokens: 1,
            streamRequestId: "stream-req-1",
          },
        },
        type: "finish",
        usage: {
          cachedInputTokens: 3,
          inputTokens: 6,
          outputTokens: 4,
          reasoningTokens: 1,
          totalTokens: 10,
        },
      },
    ]);
    expect(result.request!.body).toMatchObject({ stream: true });
    expect(result.response!.headers).toEqual({ "x-stream": "1" });
  });

  it("exposes provider and default supported urls", () => {
    const model = createModel();

    expect(model.provider).toBe("openai.chat");
    expect(
      (model.supportedUrls as Record<string, RegExp[]>)["image/png"][0].test(
        "https://cdn.test/a.png",
      ),
    ).toBe(true);
    expect(
      (model.supportedUrls as Record<string, RegExp[]>)["image/png"][0].test(
        "http://cdn.test/a.png",
      ),
    ).toBe(false);
  });
});
