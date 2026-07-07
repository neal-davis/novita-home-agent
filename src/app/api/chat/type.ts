export type ChatMessageContent =
  | string
  | {
      type: "text" | "image_url";
      text?: string;
      image_url?: {
        url: string;
      };
    }[];

type FileUIPart = {
  type: "file";
  mimeType: string;
  data: string;
};

export type ChatMessage = {
  role: "user" | "assistant" | "system" | string;
  content: ChatMessageContent;
  parts?: Array<FileUIPart>;
};

/**
 * Response format
 * if type is json_schema, the schema is required
 */
export type ResponseFormat = {
  type: "json_object" | "text" | "json_schema" | string;
  schema?: Record<string, any>;
};

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  response_format: ResponseFormat;
  max_tokens: number;
  presence_penalty: number;
  frequency_penalty: number;
  temperature: number;
  min_p: number;
  top_k: number;
  repetition_penalty: number;
  stream: boolean;
  enable_thinking: boolean;
}

export interface ClientChatCompletionRequest extends ChatCompletionRequest {
  key: string;
  // character content is only used for system message
  character_content?: string;
  system_content?: string;
}

export enum LLMHttpStatus {
  SUCCESS = 200,
  INTERNAL_SERVER_ERROR = 500,
  MODEL_NOT_FOUND = 404,
}

export enum LLMErrReason {
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  MODEL_NOT_AVAILABLE = "MODEL_NOT_AVAILABLE",
  NOT_ENOUGH_BALANCE = "NOT_ENOUGH_BALANCE",
  UNKOWN = "UNKOWN",
  FAILED_TO_AUTH = "FAILED_TO_AUTH",
}

export type LLMResponse = {
  reason: string;
  message: string;
};

export interface AIStreamParserOptions {
  event?: string;
}

export interface AIStreamParser {
  (
    data: string,
    options: AIStreamParserOptions,
  ): string | void | { isText: false; content: string };
}

// https://github.com/openai/openai-node/blob/07b3504e1c40fd929f4aae1651b83afc19e3baf8/src/resources/chat/completions.ts#L28-L40
interface ChatCompletionChunk {
  id: string;
  choices: Array<ChatCompletionChunkChoice>;
  created: number;
  model: string;
  object: string;
}

// https://github.com/openai/openai-node/blob/07b3504e1c40fd929f4aae1651b83afc19e3baf8/src/resources/chat/completions.ts#L43-L49
// Updated for https://github.com/openai/openai-node/commit/f10c757d831d90407ba47b4659d9cd34b1a35b1d
// Updated to https://github.com/openai/openai-node/commit/84b43280089eacdf18f171723591856811beddce
interface ChatCompletionChunkChoice {
  delta: ChoiceDelta;
  finish_reason:
    | "stop"
    | "length"
    | "tool_calls"
    | "content_filter"
    | "function_call"
    | null;
  index: number;
}

interface CompletionChoice {
  /**
   * The reason the model stopped generating tokens. This will be `stop` if the model
   * hit a natural stop point or a provided stop sequence, or `length` if the maximum
   * number of tokens specified in the request was reached.
   */
  finish_reason: "stop" | "length" | "content_filter";

  index: number;

  // edited: Removed CompletionChoice.logProbs and replaced with any
  logprobs: any | null;

  text: string;
}

export interface AIStreamCallbacksAndOptions {
  /** `onStart`: Called once when the stream is initialized. */
  onStart?: () => Promise<void> | void;
  /** `onCompletion`: Called for each tokenized message. */
  onCompletion?: (completion: string) => Promise<void> | void;
  /** `onFinal`: Called once when the stream is closed with the final completion message. */
  onFinal?: (completion: string) => Promise<void> | void;
  /** `onToken`: Called for each tokenized message. */
  onToken?: (token: string) => Promise<void> | void;
  /** `onText`: Called for each text chunk. */
  onText?: (text: string) => Promise<void> | void;

  experimental_streamData?: boolean;
}

/**
 * https://github.com/openai/openai-node/blob/3ec43ee790a2eb6a0ccdd5f25faa23251b0f9b8e/src/resources/completions.ts#L28C1-L64C1
 * Completions API. Streamed and non-streamed responses are the same.
 */
interface Completion {
  /**
   * A unique identifier for the completion.
   */
  id: string;

  /**
   * The list of completion choices the model generated for the input prompt.
   */
  choices: Array<CompletionChoice>;

  /**
   * The Unix timestamp of when the completion was created.
   */
  created: number;

  /**
   * The model used for completion.
   */
  model: string;

  /**
   * The object type, which is always "text_completion"
   */
  object: string;

  /**
   * Usage statistics for the completion request.
   */
  usage?: CompletionUsage;
}

export interface CompletionUsage {
  /**
   * Usage statistics for the completion request.
   */

  /**
   * Number of tokens in the generated completion.
   */
  completion_tokens: number;

  /**
   * Number of tokens in the prompt.
   */
  prompt_tokens: number;

  /**
   * Total number of tokens used in the request (prompt + completion).
   */
  total_tokens: number;
}

// From https://github.com/openai/openai-node/blob/master/src/resources/chat/completions.ts
// Updated to https://github.com/openai/openai-node/commit/84b43280089eacdf18f171723591856811beddce
interface DeltaToolCall {
  index: number;

  /**
   * The ID of the tool call.
   */
  id?: string;

  /**
   * The function that the model called.
   */
  function?: ToolCallFunction;

  /**
   * The type of the tool. Currently, only `function` is supported.
   */
  type?: "function";
}

// https://github.com/openai/openai-node/blob/07b3504e1c40fd929f4aae1651b83afc19e3baf8/src/resources/chat/completions.ts#L123-L139
// Updated to https://github.com/openai/openai-node/commit/84b43280089eacdf18f171723591856811beddce
interface ChoiceDelta {
  /**
   * The contents of the chunk message.
   */
  content?: string | null;

  /**
   * The reasoning content of the chunk message (thinking process).
   */
  reasoning_content?: string | null;

  /**
   * The name and arguments of a function that should be called, as generated by the
   * model.
   */
  function_call?: FunctionCall;

  /**
   * The role of the author of this message.
   */
  role?: "system" | "user" | "assistant" | "tool";

  tool_calls?: Array<DeltaToolCall>;
}

export interface FunctionCall {
  /**
   * The arguments to call the function with, as generated by the model in JSON
   * format. Note that the model does not always generate valid JSON, and may
   * hallucinate parameters not defined by your function schema. Validate the
   * arguments in your code before calling your function.
   */
  arguments?: string;

  /**
   * The name of the function to call.
   */
  name?: string;
}

interface ToolCallFunction {
  /**
   * The arguments to call the function with, as generated by the model in JSON
   * format. Note that the model does not always generate valid JSON, and may
   * hallucinate parameters not defined by your function schema. Validate the
   * arguments in your code before calling your function.
   */
  arguments?: string;

  /**
   * The name of the function to call.
   */
  name?: string;
}

export type AsyncIterableOpenAIStreamReturnTypes =
  | AsyncIterable<ChatCompletionChunk>
  | AsyncIterable<Completion>
  | AsyncIterable<any>;

type ExtractType<T> = T extends AsyncIterable<infer U> ? U : never;

export type OpenAIStreamReturnTypes =
  ExtractType<AsyncIterableOpenAIStreamReturnTypes>;

/**
 * Custom parser for AIStream data.
 * @interface
 * @param {string} data - The data to be parsed.
 * @param {AIStreamParserOptions} options - The options for the parser.
 * @returns {string | void} The parsed data or void.
 */
export interface AIStreamParser {
  (
    data: string,
    options: AIStreamParserOptions,
  ): string | void | { isText: false; content: string };
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<
      string,
      {
        type: string;
        description: string;
        enum?: string[];
      }
    >;
    required: string[];
  };
}
