/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const webStreams = require("stream/web");
global.ReadableStream = webStreams.ReadableStream;
global.TransformStream = webStreams.TransformStream;

jest.mock(
  "@/app/api/chat/provider/chat/openai-compatible-chat-language-model",
  () => ({
    OpenAICompatibleChatLanguageModel: jest.fn(function (
      this: any,
      modelId: string,
      config: any,
    ) {
      this.modelId = modelId;
      this.config = config;
      this.kind = "chat";
    }),
  }),
);
jest.mock(
  "@/app/api/chat/provider/completion/openai-compatible-completion-language-model",
  () => ({
    OpenAICompatibleCompletionLanguageModel: jest.fn(function (
      this: any,
      modelId: string,
      config: any,
    ) {
      this.modelId = modelId;
      this.config = config;
      this.kind = "completion";
    }),
  }),
);
jest.mock(
  "@/app/api/chat/provider/response/openai-compatible-responses-language-model",
  () => ({
    OpenAICompatibleResponsesLanguageModel: jest.fn(function (
      this: any,
      modelId: string,
      config: any,
    ) {
      this.modelId = modelId;
      this.config = config;
      this.kind = "responses";
    }),
  }),
);

const { createProvider } = require("@/app/api/chat/provider/provider");
const {
  OpenAICompatibleChatLanguageModel,
} = require("@/app/api/chat/provider/chat/openai-compatible-chat-language-model");
const {
  OpenAICompatibleCompletionLanguageModel,
} = require("@/app/api/chat/provider/completion/openai-compatible-completion-language-model");
const {
  OpenAICompatibleResponsesLanguageModel,
} = require("@/app/api/chat/provider/response/openai-compatible-responses-language-model");
const { NoSuchModelError } = require("@ai-sdk/provider");

describe("chat provider factory", () => {
  beforeEach(() => jest.clearAllMocks());

  it("creates a chat model via the callable provider and strips trailing slash from baseURL", () => {
    const provider = createProvider({
      name: "novita",
      baseURL: "https://api.example.test/v1/",
      apiKey: "secret",
      includeUsage: true,
    });

    const model = provider("gpt-x");
    expect(OpenAICompatibleChatLanguageModel).toHaveBeenCalledTimes(1);
    expect(model.modelId).toBe("gpt-x");
    expect(model.config.provider).toBe("novita.chat");
    expect(model.config.includeUsage).toBe(true);

    // url builder strips the trailing slash from baseURL
    const url = model.config.url({ path: "/chat/completions" });
    expect(url).toBe("https://api.example.test/v1/chat/completions");
  });

  it("builds Authorization header from apiKey and merges custom headers", () => {
    const provider = createProvider({
      name: "novita",
      baseURL: "https://api.example.test",
      apiKey: "secret",
      headers: { "X-Custom": "1" },
    });
    const model = provider.chatModel("m");
    const headers = model.config.headers();
    expect(headers).toEqual({
      Authorization: "Bearer secret",
      "X-Custom": "1",
    });
  });

  it("omits Authorization header when no apiKey is provided", () => {
    const provider = createProvider({
      name: "novita",
      baseURL: "https://api.example.test",
    });
    const model = provider.chatModel("m");
    expect(model.config.headers()).toEqual({});
  });

  it("appends queryParams to the built url", () => {
    const provider = createProvider({
      name: "novita",
      baseURL: "https://api.example.test",
      queryParams: { version: "2" },
    });
    const model = provider.completionModel("c");
    const url = model.config.url({ path: "/completions" });
    expect(url).toContain("https://api.example.test/completions");
    expect(url).toContain("version=2");
  });

  it("creates completion and responses models through their builders", () => {
    const provider = createProvider({
      name: "novita",
      baseURL: "https://api.example.test",
      apiKey: "k",
    });

    const completion = provider.completionModel("c1");
    expect(OpenAICompatibleCompletionLanguageModel).toHaveBeenCalledTimes(1);
    expect(completion.config.provider).toBe("novita.completion");

    const responses = provider.responsesModel("r1");
    expect(OpenAICompatibleResponsesLanguageModel).toHaveBeenCalledTimes(1);
    expect(responses.config.provider).toBe("novita.responses");

    // languageModel delegates to chatModel
    const lang = provider.languageModel("l1");
    expect(lang.kind).toBe("chat");
  });

  it("throws NoSuchModelError for textEmbeddingModel and imageModel", () => {
    const provider = createProvider({
      name: "novita",
      baseURL: "https://api.example.test",
    });
    expect(() => provider.textEmbeddingModel("e")).toThrow(NoSuchModelError);
    expect(() => provider.imageModel("i")).toThrow(NoSuchModelError);
  });
});
