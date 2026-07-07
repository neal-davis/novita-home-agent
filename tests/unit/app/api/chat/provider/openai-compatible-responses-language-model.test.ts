const mockPostJsonToApi = jest.fn();
const mockParseProviderOptions = jest.fn(
  async ({ providerOptions, provider }) => providerOptions?.[provider],
);
const mockGenerateId = jest.fn(() => "generated-source-id");

jest.mock("@ai-sdk/provider-utils", () => ({
  combineHeaders: (...headers: Array<Record<string, string | undefined>>) =>
    Object.assign({}, ...headers),
  createEventSourceResponseHandler: jest.fn((schema) => ({
    schema,
    type: "event-source",
  })),
  createJsonResponseHandler: jest.fn((schema) => ({
    schema,
    type: "json",
  })),
  createJsonErrorResponseHandler: jest.fn((structure) => ({
    structure,
    type: "json-error",
  })),
  createProviderDefinedToolFactoryWithOutputSchema:
    (definition: Record<string, any>) =>
    (args: Record<string, any> = {}) => ({
      args,
      id: definition.id,
      inputSchema: definition.inputSchema,
      name: definition.name,
      outputSchema: definition.outputSchema,
      type: "provider-defined",
    }),
  generateId: () => mockGenerateId(),
  parseProviderOptions: (...args: any[]) =>
    (mockParseProviderOptions as (...requestArgs: any[]) => unknown)(...args),
  postJsonToApi: (...args: any[]) =>
    (mockPostJsonToApi as (...requestArgs: any[]) => unknown)(...args),
  validateTypes: jest.fn(async ({ value }) => value),
  zodSchema: (schema: unknown) => schema,
}));

jest.mock(
  "@/app/api/chat/provider/response/convert-to-openai-compatible-responses-input",
  () => ({
    convertToOpenAIResponsesInput: jest.fn(async ({ prompt }) => ({
      input: prompt.map((message: any) => ({
        content: message.content,
        role: message.role,
      })),
      warnings: [{ detail: "input-warning", type: "other" }],
    })),
  }),
);

import { APICallError } from "@ai-sdk/provider";
import { OpenAICompatibleResponsesLanguageModel } from "@/app/api/chat/provider/response/openai-compatible-responses-language-model";
import { ReadableStream, TransformStream } from "stream/web";

describe("OpenAICompatibleResponsesLanguageModel", () => {
  function createModel(modelId = "gpt-4.1") {
    return new OpenAICompatibleResponsesLanguageModel(modelId, {
      fetch: jest.fn(),
      generateId: () => "config-source-id",
      headers: () => ({ Authorization: "Bearer provider-token" }),
      provider: "openai.responses",
      url: ({ modelId, path }) => `https://api.test/${modelId}${path}`,
    });
  }

  beforeEach(() => {
    (global as any).TransformStream = TransformStream;
    jest.clearAllMocks();
    mockGenerateId.mockReturnValue("generated-source-id");
    mockParseProviderOptions.mockImplementation(
      async ({ providerOptions, provider }) => providerOptions?.[provider],
    );
    mockPostJsonToApi.mockResolvedValue({
      rawValue: { raw: true },
      responseHeaders: { "x-request-id": "resp-req-1" },
      value: {
        created_at: 1710000002,
        id: "resp-1",
        incomplete_details: { reason: "max_output_tokens" },
        model: "gpt-4.1",
        output: [
          {
            encrypted_content: "encrypted",
            id: "reasoning-1",
            summary: [],
            type: "reasoning",
          },
          {
            content: [
              {
                annotations: [
                  {
                    title: "Docs",
                    type: "url_citation",
                    url: "https://docs.example.test",
                  },
                  {
                    file_id: "file-1",
                    filename: "guide.txt",
                    quote: "Guide quote",
                    type: "file_citation",
                  },
                ],
                logprobs: { tokens: ["hello"] },
                text: "hello",
              },
            ],
            id: "message-1",
            type: "message",
          },
          {
            arguments: '{"city":"SF"}',
            call_id: "function-call-1",
            id: "function-1",
            name: "get_weather",
            type: "function_call",
          },
          {
            action: {
              query: "novita",
              sources: [
                {
                  title: "Source",
                  url: "https://source.example.test",
                },
              ],
              type: "search",
            },
            id: "web-1",
            type: "web_search_call",
          },
          {
            id: "image-1",
            result: "image-b64",
            type: "image_generation_call",
          },
          {
            attributes: {},
            id: "file-search-1",
            queries: ["q"],
            results: [
              {
                attributes: { page: 1 },
                file_id: "file-2",
                filename: "result.txt",
                score: 0.9,
                text: "result text",
              },
            ],
            type: "file_search_call",
          },
          {
            code: "print(1)",
            container_id: "container-1",
            id: "code-1",
            outputs: [{ logs: "1", type: "logs" }],
            type: "code_interpreter_call",
          },
          {
            action: { command: "pwd" },
            call_id: "shell-call-1",
            id: "shell-1",
            type: "local_shell_call",
          },
          {
            id: "computer-1",
            status: "in_progress",
            type: "computer_call",
          },
        ],
        service_tier: "default",
        usage: {
          input_tokens: 12,
          input_tokens_details: { cached_tokens: 4 },
          output_tokens: 8,
          output_tokens_details: { reasoning_tokens: 3 },
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

  it("maps responses output parts, usage, metadata and request args", async () => {
    const model = createModel();

    const result = await model.doGenerate({
      headers: { "X-Trace": "trace-1" },
      maxOutputTokens: 32,
      prompt: [{ content: "hello", role: "user" }] as any,
      providerOptions: {
        openai: {
          include: ["existing.include"],
          logprobs: true,
          metadata: { team: "core" },
          serviceTier: "flex",
          strictJsonSchema: true,
          textVerbosity: "low",
          user: "user-1",
        },
      },
      responseFormat: {
        description: "JSON response",
        name: "response_name",
        schema: { type: "object" },
        type: "json",
      } as any,
      toolChoice: { type: "auto" },
      tools: [
        {
          args: {},
          id: "openai.web_search",
          name: "web_search_tool",
          type: "provider-defined",
        },
        {
          args: {},
          id: "openai.code_interpreter",
          name: "code_interpreter",
          type: "provider-defined",
        },
        {
          inputSchema: { type: "object" },
          name: "get_weather",
          type: "function",
        },
      ] as any,
      topK: 1,
    } as any);

    expect(mockPostJsonToApi).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          include: [
            "existing.include",
            "message.output_text.logprobs",
            "web_search_call.action.sources",
            "code_interpreter_call.outputs",
          ],
          input: [{ content: "hello", role: "user" }],
          max_output_tokens: 32,
          metadata: { team: "core" },
          model: "gpt-4.1",
          text: {
            format: {
              description: "JSON response",
              name: "response_name",
              schema: { type: "object" },
              strict: true,
              type: "json_schema",
            },
            verbosity: "low",
          },
          top_logprobs: 20,
          user: "user-1",
        }),
        headers: expect.objectContaining({
          Authorization: "Bearer provider-token",
          "X-Trace": "trace-1",
        }),
        url: "https://api.test/gpt-4.1/responses",
      }),
    );

    expect(result.content).toEqual([
      {
        providerMetadata: {
          provider: {
            itemId: "reasoning-1",
            reasoningEncryptedContent: "encrypted",
          },
        },
        text: "",
        type: "reasoning",
      },
      {
        providerMetadata: { provider: { itemId: "message-1" } },
        text: "hello",
        type: "text",
      },
      {
        id: "config-source-id",
        sourceType: "url",
        title: "Docs",
        type: "source",
        url: "https://docs.example.test",
      },
      {
        filename: "guide.txt",
        id: "config-source-id",
        mediaType: "text/plain",
        sourceType: "document",
        title: "Guide quote",
        type: "source",
      },
      {
        input: '{"city":"SF"}',
        providerMetadata: { provider: { itemId: "function-1" } },
        toolCallId: "function-call-1",
        toolName: "get_weather",
        type: "tool-call",
      },
      {
        input: "{}",
        providerExecuted: true,
        toolCallId: "web-1",
        toolName: "web_search_tool",
        type: "tool-call",
      },
      {
        providerExecuted: true,
        result: {
          action: {
            query: "novita",
            type: "search",
          },
        },
        toolCallId: "web-1",
        toolName: "web_search_tool",
        type: "tool-result",
      },
      {
        input: "{}",
        providerExecuted: true,
        toolCallId: "image-1",
        toolName: "image_generation",
        type: "tool-call",
      },
      {
        providerExecuted: true,
        result: { result: "image-b64" },
        toolCallId: "image-1",
        toolName: "image_generation",
        type: "tool-result",
      },
      {
        input: "{}",
        providerExecuted: true,
        toolCallId: "file-search-1",
        toolName: "file_search",
        type: "tool-call",
      },
      {
        providerExecuted: true,
        result: {
          queries: ["q"],
          results: [
            {
              attributes: { page: 1 },
              fileId: "file-2",
              filename: "result.txt",
              score: 0.9,
              text: "result text",
            },
          ],
        },
        toolCallId: "file-search-1",
        toolName: "file_search",
        type: "tool-result",
      },
      {
        input: '{"code":"print(1)","containerId":"container-1"}',
        providerExecuted: true,
        toolCallId: "code-1",
        toolName: "code_interpreter",
        type: "tool-call",
      },
      {
        providerExecuted: true,
        result: { outputs: [{ logs: "1", type: "logs" }] },
        toolCallId: "code-1",
        toolName: "code_interpreter",
        type: "tool-result",
      },
      {
        input: '{"action":{"command":"pwd"}}',
        providerMetadata: { provider: { itemId: "shell-1" } },
        toolCallId: "shell-call-1",
        toolName: "local_shell",
        type: "tool-call",
      },
      {
        input: "",
        providerExecuted: true,
        toolCallId: "computer-1",
        toolName: "computer_use",
        type: "tool-call",
      },
      {
        providerExecuted: true,
        result: {
          status: "in_progress",
          type: "computer_use_tool_result",
        },
        toolCallId: "computer-1",
        toolName: "computer_use",
        type: "tool-result",
      },
    ]);
    expect(result.finishReason).toBe("length");
    expect(result.usage).toEqual({
      cachedInputTokens: 4,
      inputTokens: 12,
      outputTokens: 8,
      reasoningTokens: 3,
      totalTokens: 20,
    });
    expect(result.providerMetadata).toEqual({
      provider: {
        logprobs: [{ tokens: ["hello"] }],
        responseId: "resp-1",
        serviceTier: "default",
      },
    });
    expect(result.response).toMatchObject({
      body: { raw: true },
      headers: { "x-request-id": "resp-req-1" },
      id: "resp-1",
      modelId: "gpt-4.1",
      timestamp: new Date(1710000002 * 1000),
    });
    expect(result.warnings).toEqual([
      { setting: "topK", type: "unsupported-setting" },
      { detail: "input-warning", type: "other" },
      {
        details:
          "flex processing is only available for o3, o4-mini, and gpt-5 models",
        setting: "serviceTier",
        type: "unsupported-setting",
      },
    ]);
  });

  it("throws APICallError for responses API error payloads", async () => {
    const model = createModel();
    mockPostJsonToApi.mockResolvedValueOnce({
      rawValue: "raw error",
      responseHeaders: { "x-request-id": "error-1" },
      value: {
        error: { message: "Bad request" },
      },
    });

    await expect(
      model.doGenerate({
        prompt: [{ content: "hello", role: "user" }] as any,
      } as any),
    ).rejects.toBeInstanceOf(APICallError);
  });

  it("streams metadata, reasoning, text, tool calls, sources and finish usage", async () => {
    const model = createModel();
    const source = new ReadableStream({
      start(controller) {
        controller.enqueue({
          rawValue: { chunk: 1 },
          success: true,
          value: {
            response: {
              created_at: 1710000003,
              id: "stream-resp-1",
              model: "gpt-4.1",
            },
            type: "response.created",
          },
        });
        controller.enqueue({
          rawValue: { chunk: 2 },
          success: true,
          value: {
            item: {
              encrypted_content: "encrypted-stream",
              id: "reasoning-1",
              type: "reasoning",
            },
            output_index: 0,
            type: "response.output_item.added",
          },
        });
        controller.enqueue({
          rawValue: { chunk: 3 },
          success: true,
          value: {
            delta: "thinking",
            item_id: "reasoning-1",
            summary_index: 0,
            type: "response.reasoning_summary_text.delta",
          },
        });
        controller.enqueue({
          rawValue: { chunk: 4 },
          success: true,
          value: {
            item: { id: "message-1", type: "message" },
            output_index: 1,
            type: "response.output_item.added",
          },
        });
        controller.enqueue({
          rawValue: { chunk: 5 },
          success: true,
          value: {
            delta: "hello",
            item_id: "message-1",
            logprobs: { tokens: ["hello"] },
            type: "response.output_text.delta",
          },
        });
        controller.enqueue({
          rawValue: { chunk: 6 },
          success: true,
          value: {
            annotation: {
              title: "Docs",
              type: "url_citation",
              url: "https://docs.example.test",
            },
            type: "response.output_text.annotation.added",
          },
        });
        controller.enqueue({
          rawValue: { chunk: 7 },
          success: true,
          value: {
            item: {
              call_id: "call-1",
              id: "function-1",
              name: "get_weather",
              type: "function_call",
            },
            output_index: 2,
            type: "response.output_item.added",
          },
        });
        controller.enqueue({
          rawValue: { chunk: 8 },
          success: true,
          value: {
            delta: '{"city":"',
            output_index: 2,
            type: "response.function_call_arguments.delta",
          },
        });
        controller.enqueue({
          rawValue: { chunk: 9 },
          success: true,
          value: {
            item: {
              arguments: '{"city":"SF"}',
              call_id: "call-1",
              id: "function-1",
              name: "get_weather",
              type: "function_call",
            },
            output_index: 2,
            type: "response.output_item.done",
          },
        });
        controller.enqueue({
          rawValue: { chunk: 10 },
          success: true,
          value: {
            item: { id: "message-1", type: "message" },
            output_index: 1,
            type: "response.output_item.done",
          },
        });
        controller.enqueue({
          rawValue: { chunk: 11 },
          success: true,
          value: {
            item: {
              encrypted_content: "encrypted-stream",
              id: "reasoning-1",
              type: "reasoning",
            },
            output_index: 0,
            type: "response.output_item.done",
          },
        });
        controller.enqueue({
          rawValue: { chunk: 12 },
          success: true,
          value: {
            response: {
              incomplete_details: undefined,
              service_tier: "default",
              usage: {
                input_tokens: 7,
                input_tokens_details: { cached_tokens: 2 },
                output_tokens: 5,
                output_tokens_details: { reasoning_tokens: 1 },
              },
            },
            type: "response.completed",
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
      prompt: [{ content: "hello", role: "user" }] as any,
      providerOptions: {
        openai: {
          logprobs: true,
          store: false,
        },
      },
      tools: [
        {
          inputSchema: { type: "object" },
          name: "get_weather",
          type: "function",
        },
      ] as any,
    } as any);

    expect(mockPostJsonToApi).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          input: [{ content: "hello", role: "user" }],
          stream: true,
          top_logprobs: 20,
        }),
      }),
    );

    const chunks = await collectStream(result.stream as any);

    expect(chunks).toEqual([
      {
        type: "stream-start",
        warnings: [{ detail: "input-warning", type: "other" }],
      },
      { rawValue: { chunk: 1 }, type: "raw" },
      {
        id: "stream-resp-1",
        modelId: "gpt-4.1",
        timestamp: new Date(1710000003 * 1000),
        type: "response-metadata",
      },
      { rawValue: { chunk: 2 }, type: "raw" },
      {
        id: "reasoning-1:0",
        providerMetadata: {
          provider: {
            itemId: "reasoning-1",
            reasoningEncryptedContent: "encrypted-stream",
          },
        },
        type: "reasoning-start",
      },
      { rawValue: { chunk: 3 }, type: "raw" },
      {
        delta: "thinking",
        id: "reasoning-1:0",
        providerMetadata: { provider: { itemId: "reasoning-1" } },
        type: "reasoning-delta",
      },
      { rawValue: { chunk: 4 }, type: "raw" },
      {
        id: "message-1",
        providerMetadata: { provider: { itemId: "message-1" } },
        type: "text-start",
      },
      { rawValue: { chunk: 5 }, type: "raw" },
      { delta: "hello", id: "message-1", type: "text-delta" },
      { rawValue: { chunk: 6 }, type: "raw" },
      {
        id: "config-source-id",
        sourceType: "url",
        title: "Docs",
        type: "source",
        url: "https://docs.example.test",
      },
      { rawValue: { chunk: 7 }, type: "raw" },
      { id: "call-1", toolName: "get_weather", type: "tool-input-start" },
      { rawValue: { chunk: 8 }, type: "raw" },
      { delta: '{"city":"', id: "call-1", type: "tool-input-delta" },
      { rawValue: { chunk: 9 }, type: "raw" },
      { id: "call-1", type: "tool-input-end" },
      {
        input: '{"city":"SF"}',
        providerMetadata: { provider: { itemId: "function-1" } },
        toolCallId: "call-1",
        toolName: "get_weather",
        type: "tool-call",
      },
      { rawValue: { chunk: 10 }, type: "raw" },
      { id: "message-1", type: "text-end" },
      { rawValue: { chunk: 11 }, type: "raw" },
      {
        id: "reasoning-1:0",
        providerMetadata: {
          provider: {
            itemId: "reasoning-1",
            reasoningEncryptedContent: "encrypted-stream",
          },
        },
        type: "reasoning-end",
      },
      { rawValue: { chunk: 12 }, type: "raw" },
      {
        finishReason: "tool-calls",
        providerMetadata: {
          provider: {
            logprobs: [{ tokens: ["hello"] }],
            responseId: "stream-resp-1",
            serviceTier: "default",
          },
        },
        type: "finish",
        usage: {
          cachedInputTokens: 2,
          inputTokens: 7,
          outputTokens: 5,
          reasoningTokens: 1,
          totalTokens: 12,
        },
      },
    ]);
    expect(result.response!.headers).toEqual({ "x-stream": "1" });
  });

  it("exposes provider and supported urls", () => {
    const model = createModel();

    expect(model.provider).toBe("openai.responses");
    expect(
      model.supportedUrls["image/*"][0].test("http://assets.test/a.png"),
    ).toBe(true);
    expect(
      model.supportedUrls["application/pdf"][0].test("ftp://assets.test/a.pdf"),
    ).toBe(false);
  });
});
