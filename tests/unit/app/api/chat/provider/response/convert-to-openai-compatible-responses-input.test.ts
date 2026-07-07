/* eslint-disable @typescript-eslint/no-var-requires */
const webStreams = require("stream/web");
const { TextDecoder, TextEncoder } = require("util");

global.ReadableStream = webStreams.ReadableStream;
global.TransformStream = webStreams.TransformStream;
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

const { UnsupportedFunctionalityError } = require("@ai-sdk/provider");
const {
  convertToOpenAIResponsesInput,
} = require("@/app/api/chat/provider/response/convert-to-openai-compatible-responses-input");

describe("convertToOpenAIResponsesInput", () => {
  it("maps system messages according to the configured mode", async () => {
    await expect(
      convertToOpenAIResponsesInput({
        prompt: [{ content: "system prompt", role: "system" }] as any,
        store: false,
        systemMessageMode: "system",
      }),
    ).resolves.toEqual({
      input: [{ content: "system prompt", role: "system" }],
      warnings: [],
    });

    await expect(
      convertToOpenAIResponsesInput({
        prompt: [{ content: "system prompt", role: "system" }] as any,
        store: false,
        systemMessageMode: "developer",
      }),
    ).resolves.toEqual({
      input: [{ content: "system prompt", role: "developer" }],
      warnings: [],
    });

    await expect(
      convertToOpenAIResponsesInput({
        prompt: [{ content: "system prompt", role: "system" }] as any,
        store: false,
        systemMessageMode: "remove",
      }),
    ).resolves.toEqual({
      input: [],
      warnings: [
        {
          message: "system messages are removed for this model",
          type: "other",
        },
      ],
    });
  });

  it("maps user text, image and PDF parts using URLs, file IDs and base64 data", async () => {
    const { input } = await convertToOpenAIResponsesInput({
      fileIdPrefixes: ["file_", "img_"],
      prompt: [
        {
          content: [
            { text: "describe", type: "text" },
            {
              data: new URL("https://cdn.test/image.png"),
              mediaType: "image/png",
              providerOptions: { openai: { imageDetail: "high" } },
              type: "file",
            },
            {
              data: "img_123",
              mediaType: "image/*",
              type: "file",
            },
            {
              data: new Uint8Array([1, 2, 3]),
              mediaType: "image/jpeg",
              type: "file",
            },
            {
              data: new URL("https://cdn.test/doc.pdf"),
              mediaType: "application/pdf",
              type: "file",
            },
            {
              data: "file_pdf",
              filename: "guide.pdf",
              mediaType: "application/pdf",
              type: "file",
            },
          ],
          role: "user",
        },
      ] as any,
      store: false,
      systemMessageMode: "system",
    });

    expect(input).toEqual([
      {
        content: [
          { text: "describe", type: "input_text" },
          {
            detail: "high",
            image_url: "https://cdn.test/image.png",
            type: "input_image",
          },
          {
            detail: undefined,
            file_id: "img_123",
            type: "input_image",
          },
          {
            detail: undefined,
            image_url: "data:image/jpeg;base64,AQID",
            type: "input_image",
          },
          {
            file_url: "https://cdn.test/doc.pdf",
            type: "input_file",
          },
          {
            file_id: "file_pdf",
            type: "input_file",
          },
        ],
        role: "user",
      },
    ]);
  });

  it("maps assistant messages, function calls and warnings for skipped parts", async () => {
    const { input, warnings } = await convertToOpenAIResponsesInput({
      prompt: [
        {
          content: [
            { text: "answer", type: "text" },
            {
              input: { city: "SF" },
              providerExecuted: false,
              toolCallId: "call-1",
              toolName: "weather",
              type: "tool-call",
            },
            {
              input: { ignored: true },
              providerExecuted: true,
              toolCallId: "call-provider",
              toolName: "web_search",
              type: "tool-call",
            },
            {
              output: { type: "text", value: "provider result" },
              toolCallId: "call-provider",
              toolName: "web_search",
              type: "tool-result",
            },
            { text: "hidden thoughts", type: "reasoning" },
          ],
          role: "assistant",
        },
      ] as any,
      store: false,
      systemMessageMode: "system",
    });

    expect(input).toEqual([
      {
        content: [{ text: "answer", type: "output_text" }],
        role: "assistant",
      },
      {
        arguments: '{"city":"SF"}',
        call_id: "call-1",
        name: "weather",
        type: "function_call",
      },
    ]);
    expect(warnings).toEqual([
      {
        message:
          "Results for OpenAI tool web_search are not sent to the API when store is false",
        type: "other",
      },
      {
        message: expect.stringContaining(
          "Non-OpenAI reasoning parts are not supported",
        ),
        type: "other",
      },
    ]);
  });

  it("maps tool outputs including local shell, JSON, content media and unsupported content warnings", async () => {
    const { input, warnings } = await convertToOpenAIResponsesInput({
      hasLocalShellTool: true,
      prompt: [
        {
          content: [
            {
              output: { type: "json", value: { output: "done" } },
              toolCallId: "shell-1",
              toolName: "local_shell",
            },
          ],
          role: "tool",
        },
        {
          content: [
            {
              output: { type: "json", value: { ok: true } },
              toolCallId: "json-1",
              toolName: "regular",
            },
            {
              output: {
                type: "content",
                value: [
                  { text: "content text", type: "text" },
                  { data: "AAA=", mediaType: "image/png", type: "media" },
                  {
                    data: "BBB=",
                    mediaType: "application/octet-stream",
                    type: "media",
                  },
                  { value: "bad", type: "unknown" },
                ],
              },
              toolCallId: "content-1",
              toolName: "regular",
            },
            {
              output: { type: "error-text", value: "failed" },
              toolCallId: "error-1",
              toolName: "regular",
            },
          ],
          role: "tool",
        },
      ] as any,
      store: false,
      systemMessageMode: "system",
    });

    expect(input).toEqual([
      {
        call_id: "shell-1",
        output: "done",
        type: "local_shell_call_output",
      },
      {
        call_id: "json-1",
        output: '{"ok":true}',
        type: "function_call_output",
      },
      {
        call_id: "content-1",
        output: [
          { text: "content text", type: "input_text" },
          {
            image_url: "data:image/png;base64,AAA=",
            type: "input_image",
          },
          {
            file_data: "data:application/octet-stream;base64,BBB=",
            filename: "data",
            type: "input_file",
          },
        ],
        type: "function_call_output",
      },
      {
        call_id: "error-1",
        output: "failed",
        type: "function_call_output",
      },
    ]);
    expect(warnings).toEqual([
      {
        message: "unsupported tool content part type: unknown",
        type: "other",
      },
    ]);
  });

  it("rejects unsupported user file media types", async () => {
    await expect(
      convertToOpenAIResponsesInput({
        prompt: [
          {
            content: [
              {
                data: "hello",
                mediaType: "text/plain",
                type: "file",
              },
            ],
            role: "user",
          },
        ] as any,
        store: false,
        systemMessageMode: "system",
      }),
    ).rejects.toBeInstanceOf(UnsupportedFunctionalityError);
  });
});
