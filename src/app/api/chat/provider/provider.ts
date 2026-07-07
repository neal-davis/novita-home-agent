import {
  LanguageModelV2,
  NoSuchModelError,
  ProviderV2,
} from "@ai-sdk/provider";
import { FetchFunction, withoutTrailingSlash } from "@ai-sdk/provider-utils";
import { OpenAICompatibleChatLanguageModel } from "./chat/openai-compatible-chat-language-model";
import { OpenAICompatibleCompletionLanguageModel } from "./completion/openai-compatible-completion-language-model";
import { OpenAICompatibleResponsesLanguageModel } from "./response/openai-compatible-responses-language-model";

export interface Provider extends ProviderV2 {
  (modelId: string): LanguageModelV2;

  languageModel(modelId: string): LanguageModelV2;
  chatModel(modelId: string): LanguageModelV2;
  completionModel(modelId: string): LanguageModelV2;
  responsesModel(modelId: string): LanguageModelV2;
}

export interface ProviderSettings {
  baseURL: string;
  name: string;
  apiKey?: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  fetch?: FetchFunction;
  includeUsage?: boolean;
}

export function createProvider(options: ProviderSettings): Provider {
  const baseURL = withoutTrailingSlash(options.baseURL);
  const providerName = options.name;

  interface CommonModelConfig {
    provider: string;
    url: ({ path }: { path: string }) => string;
    headers: () => Record<string, string>;
    fetch?: FetchFunction;
  }

  const getHeaders = () => ({
    ...(options.apiKey && { Authorization: `Bearer ${options.apiKey}` }),
    ...options.headers,
  });

  const getCommonModelConfig = (modelType: string): CommonModelConfig => ({
    provider: `${providerName}.${modelType}`,
    url: ({ path }) => {
      const url = new URL(`${baseURL}${path}`);
      if (options.queryParams) {
        url.search = new URLSearchParams(options.queryParams).toString();
      }
      return url.toString();
    },
    headers: getHeaders,
    fetch: options.fetch,
  });

  const createLanguageModel = (modelId: string) => createChatModel(modelId);

  const createChatModel = (modelId: string) =>
    new OpenAICompatibleChatLanguageModel(modelId, {
      ...getCommonModelConfig("chat"),
      includeUsage: options.includeUsage,
    });

  const createCompletionModel = (modelId: string) =>
    new OpenAICompatibleCompletionLanguageModel(modelId, {
      ...getCommonModelConfig("completion"),
      includeUsage: options.includeUsage,
    });

  const createResponsesModel = (modelId: string) =>
    new OpenAICompatibleResponsesLanguageModel(modelId, {
      ...getCommonModelConfig("responses"),
    });

  const provider = (modelId: string) => createLanguageModel(modelId);

  provider.languageModel = createLanguageModel;
  provider.chatModel = createChatModel;
  provider.completionModel = createCompletionModel;
  provider.responsesModel = createResponsesModel;
  provider.textEmbeddingModel = (modelId: string) => {
    throw new NoSuchModelError({ modelId, modelType: "textEmbeddingModel" });
  };
  provider.imageModel = (modelId: string) => {
    throw new NoSuchModelError({ modelId, modelType: "imageModel" });
  };

  return provider;
}
