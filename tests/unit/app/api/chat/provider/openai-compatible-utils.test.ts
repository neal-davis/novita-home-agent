jest.mock("@ai-sdk/provider-utils", () => ({
  convertToBase64: (data: Buffer | Uint8Array | string) =>
    Buffer.from(data as any).toString("base64"),
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
  validateTypes: jest.fn(async ({ value }) => value),
  zodSchema: (schema: unknown) => schema,
}));

import { UnsupportedFunctionalityError } from "@ai-sdk/provider";
import { prepareTools } from "@/app/api/chat/provider/chat/openai-compatible-prepare-tools";
import { mapOpenAICompatibleFinishReason as mapChatFinishReason } from "@/app/api/chat/provider/chat/map-openai-compatible-finish-reason";
import { convertToOpenAICompatibleChatMessages } from "@/app/api/chat/provider/chat/convert-to-openai-compatible-chat-messages";
import { convertToOpenAICompatibleCompletionPrompt } from "@/app/api/chat/provider/completion/convert-to-openai-compatible-completion-prompt";
import { mapOpenAICompatibleFinishReason as mapCompletionFinishReason } from "@/app/api/chat/provider/completion/map-openai-compatible-finish-reason";
import { prepareResponsesTools } from "@/app/api/chat/provider/response/openai-compatible-prepare-tools";
import { mapOpenAIResponseFinishReason } from "@/app/api/chat/provider/response/map-openai-compatible-finish-reason";

describe("OpenAI compatible chat provider utilities", () => {
  it("converts function tools and tool choices for chat completions", () => {
    const result = prepareTools({
      tools: [
        {
          description: "Search docs",
          inputSchema: {
            type: "object",
            properties: { q: { type: "string" } },
          },
          name: "search_docs",
          type: "function",
        },
        {
          args: {},
          id: "vendor.tool",
          name: "Vendor Tool",
          type: "provider-defined",
        },
      ] as any,
      toolChoice: { toolName: "search_docs", type: "tool" },
    });

    expect(result.tools).toEqual([
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
    ]);
    expect(result.toolChoice).toEqual({
      function: { name: "search_docs" },
      type: "function",
    });
    expect(result.toolWarnings).toEqual([
      {
        tool: expect.objectContaining({ id: "vendor.tool" }),
        type: "unsupported-tool",
      },
    ]);
  });

  it("handles empty and automatic chat tool choices", () => {
    expect(prepareTools({ tools: [], toolChoice: { type: "auto" } })).toEqual({
      toolChoice: undefined,
      toolWarnings: [],
      tools: undefined,
    });
    expect(
      prepareTools({
        tools: [
          {
            inputSchema: {},
            name: "noop",
            type: "function",
          },
        ] as any,
        toolChoice: { type: "required" },
      }).toolChoice,
    ).toBe("required");
  });

  it.each([
    ["stop", "stop"],
    ["length", "length"],
    ["content_filter", "content-filter"],
    ["function_call", "tool-calls"],
    ["tool_calls", "tool-calls"],
    [undefined, "unknown"],
  ])("maps chat finish reason %s", (input, expected) => {
    expect(mapChatFinishReason(input)).toBe(expected);
    expect(mapCompletionFinishReason(input)).toBe(expected);
  });

  it("converts multimodal chat prompts to OpenAI-compatible messages", () => {
    const messages = convertToOpenAICompatibleChatMessages([
      {
        content: "System text",
        providerOptions: {
          openaiCompatible: { cache_control: { type: "ephemeral" } },
        },
        role: "system",
      },
      {
        content: [{ text: "hello", type: "text" }],
        role: "user",
      },
      {
        content: [
          { text: "look", type: "text" },
          {
            data: new URL("https://assets.example.test/image.png"),
            mediaType: "image/png",
            providerOptions: {
              openaiCompatible: { detail: "high" },
            },
            type: "file",
          },
          {
            data: Buffer.from("video"),
            mediaType: "video/mp4",
            type: "file",
          },
        ],
        role: "user",
      },
      {
        content: [
          { text: "answer", type: "text" },
          {
            input: { q: "gpu" },
            toolCallId: "call-1",
            toolName: "search_docs",
            type: "tool-call",
          },
        ],
        role: "assistant",
      },
      {
        content: [
          {
            output: { type: "text", value: "tool text" },
            toolCallId: "call-1",
            type: "tool-result",
          },
          {
            output: { type: "json", value: { ok: true } },
            toolCallId: "call-2",
            type: "tool-result",
          },
        ],
        role: "tool",
      },
    ] as any);

    expect(messages).toEqual([
      {
        cache_control: { type: "ephemeral" },
        content: "System text",
        role: "system",
      },
      { content: "hello", role: "user" },
      {
        content: [
          { text: "look", type: "text" },
          {
            detail: "high",
            image_url: { url: "https://assets.example.test/image.png" },
            type: "image_url",
          },
          {
            type: "video_url",
            video_url: {
              url: "data:video/mp4;base64,dmlkZW8=",
            },
          },
        ],
        role: "user",
      },
      {
        content: "answer",
        role: "assistant",
        tool_calls: [
          {
            function: {
              arguments: JSON.stringify({ q: "gpu" }),
              name: "search_docs",
            },
            id: "call-1",
            type: "function",
          },
        ],
      },
      { content: "tool text", role: "tool", tool_call_id: "call-1" },
      {
        content: JSON.stringify({ ok: true }),
        role: "tool",
        tool_call_id: "call-2",
      },
    ]);
  });

  it("rejects unsupported chat file media types", () => {
    expect(() =>
      convertToOpenAICompatibleChatMessages([
        {
          content: [
            {
              data: Buffer.from("pdf"),
              mediaType: "application/pdf",
              type: "file",
            },
          ],
          role: "user",
        },
      ] as any),
    ).toThrow(UnsupportedFunctionalityError);
  });
});

describe("OpenAI compatible responses provider utilities", () => {
  it("converts response function and provider-defined tools", async () => {
    const result = await prepareResponsesTools({
      strictJsonSchema: true,
      toolChoice: { toolName: "web_search", type: "tool" },
      tools: [
        {
          description: "Lookup",
          inputSchema: { type: "object" },
          name: "lookup",
          type: "function",
        },
        {
          args: {
            filters: { allowedDomains: ["example.com"] },
            searchContextSize: "high",
            userLocation: { country: "US", type: "approximate" },
          },
          id: "openai.web_search",
          name: "web_search",
          type: "provider-defined",
        },
        {
          args: {
            maxNumResults: 5,
            ranking: { ranker: "auto", scoreThreshold: 0.5 },
            vectorStoreIds: ["vs-1"],
          },
          id: "openai.file_search",
          name: "file_search",
          type: "provider-defined",
        },
        {
          args: { container: { fileIds: ["file-1"] } },
          id: "openai.code_interpreter",
          name: "code_interpreter",
          type: "provider-defined",
        },
        {
          args: {
            background: "transparent",
            inputImageMask: {
              fileId: "mask-1",
              imageUrl: "data:image/png;base64,a",
            },
            model: "gpt-image-1",
            outputCompression: 80,
            outputFormat: "png",
            partialImages: 2,
            quality: "high",
            size: "1024x1024",
          },
          id: "openai.image_generation",
          name: "image_generation",
          type: "provider-defined",
        },
        {
          args: {},
          id: "openai.local_shell",
          name: "local_shell",
          type: "provider-defined",
        },
      ] as any,
    });

    expect(result.toolChoice).toEqual({ type: "web_search" });
    expect(result.toolWarnings).toEqual([]);
    expect(result.tools).toEqual([
      {
        description: "Lookup",
        name: "lookup",
        parameters: { type: "object" },
        strict: true,
        type: "function",
      },
      {
        filters: { allowed_domains: ["example.com"] },
        search_context_size: "high",
        type: "web_search",
        user_location: { country: "US", type: "approximate" },
      },
      {
        filters: undefined,
        max_num_results: 5,
        ranking_options: { ranker: "auto", score_threshold: 0.5 },
        type: "file_search",
        vector_store_ids: ["vs-1"],
      },
      {
        container: { file_ids: ["file-1"], type: "auto" },
        type: "code_interpreter",
      },
      {
        background: "transparent",
        input_fidelity: undefined,
        input_image_mask: {
          file_id: "mask-1",
          image_url: "data:image/png;base64,a",
        },
        model: "gpt-image-1",
        moderation: undefined,
        output_compression: 80,
        output_format: "png",
        partial_images: 2,
        quality: "high",
        size: "1024x1024",
        type: "image_generation",
      },
      { type: "local_shell" },
    ]);
  });

  it("warns on unsupported response tools and maps generic tool choices", async () => {
    const result = await prepareResponsesTools({
      strictJsonSchema: false,
      toolChoice: { toolName: "lookup", type: "tool" },
      tools: [
        {
          inputSchema: {},
          name: "lookup",
          type: "function",
        },
        {
          type: "unknown",
        },
      ] as any,
    });

    expect(result.toolChoice).toEqual({ name: "lookup", type: "function" });
    expect(result.toolWarnings).toEqual([
      { tool: { type: "unknown" }, type: "unsupported-tool" },
    ]);
  });

  it.each([
    [undefined, false, "stop"],
    [null, true, "tool-calls"],
    ["max_output_tokens", false, "length"],
    ["content_filter", false, "content-filter"],
    ["other", true, "tool-calls"],
    ["other", false, "unknown"],
  ])(
    "maps response finish reason %s with tool calls %s",
    (finishReason, hasFunctionCall, expected) => {
      expect(
        mapOpenAIResponseFinishReason({ finishReason, hasFunctionCall }),
      ).toBe(expected);
    },
  );
});

describe("OpenAI compatible completion provider utilities", () => {
  it("converts chat prompts to a completion prompt with custom role labels", () => {
    expect(
      convertToOpenAICompatibleCompletionPrompt({
        assistant: "bot",
        prompt: [
          { content: "Follow instructions", role: "system" },
          {
            content: [{ text: "Hello", type: "text" }],
            role: "user",
          },
          {
            content: [{ text: "Hi", type: "text" }],
            role: "assistant",
          },
        ] as any,
        user: "human",
      }),
    ).toEqual({
      prompt: "Follow instructions\n\nhuman:\nHello\n\nbot:\nHi\n\nbot:\n",
      stopSequences: ["\nhuman:"],
    });
  });

  it("rejects unsupported completion prompt shapes", () => {
    expect(() =>
      convertToOpenAICompatibleCompletionPrompt({
        prompt: [
          { content: "one", role: "system" },
          { content: "two", role: "system" },
        ] as any,
      }),
    ).toThrow("Unexpected system message");

    expect(() =>
      convertToOpenAICompatibleCompletionPrompt({
        prompt: [
          {
            content: [
              {
                input: {},
                toolCallId: "call-1",
                toolName: "lookup",
                type: "tool-call",
              },
            ],
            role: "assistant",
          },
        ] as any,
      }),
    ).toThrow(UnsupportedFunctionalityError);
  });
});
