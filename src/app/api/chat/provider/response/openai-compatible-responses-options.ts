import { z } from "zod/v4";

export type OpenAIResponsesModelId = string;

export const TOP_LOGPROBS_MAX = 20;

export const openaiResponsesProviderOptionsSchema = z.object({
  /**
   * A unique identifier representing your end-user, which can help the provider to
   * monitor and detect abuse.
   */
  user: z.string().optional(),

  /**
   * Whether to store the response for future reference.
   */
  store: z.boolean().optional(),

  /**
   * Whether to use strict JSON schema validation.
   */
  strictJsonSchema: z.boolean().optional(),

  /**
   * Include options for the response.
   */
  include: z
    .array(
      z.enum([
        "web_search_call.action.sources",
        "code_interpreter_call.outputs",
        "computer_call_output.output.image_url",
        "file_search_call.results",
        "message.input_image.image_url",
        "message.output_text.logprobs",
        "reasoning.encrypted_content",
      ]),
    )
    .optional(),

  /**
   * Whether to include logprobs in the response.
   */
  logprobs: z.union([z.boolean(), z.number()]).optional(),

  /**
   * Text verbosity level.
   */
  textVerbosity: z.string().optional(),

  /**
   * Maximum number of tool calls.
   */
  maxToolCalls: z.number().optional(),

  /**
   * Metadata for the request.
   */
  metadata: z.record(z.string(), z.unknown()).optional(),

  /**
   * Whether to enable parallel tool calls.
   */
  parallelToolCalls: z.boolean().optional(),

  /**
   * Previous response ID for continuation.
   */
  previousResponseId: z.string().optional(),

  /**
   * Instructions for the model.
   */
  instructions: z.string().optional(),

  /**
   * Service tier for the request.
   */
  serviceTier: z.enum(["auto", "default", "flex", "priority"]).optional(),

  /**
   * Prompt cache key.
   */
  promptCacheKey: z.string().optional(),

  /**
   * Safety identifier.
   */
  safetyIdentifier: z.string().optional(),

  /**
   * Truncation settings.
   */
  truncation: z
    .object({
      type: z.string(),
      lastMessages: z.number().optional(),
    })
    .optional(),

  /**
   * Reasoning effort for reasoning models.
   */
  reasoningEffort: z.enum(["low", "medium", "high"]).optional(),

  /**
   * Reasoning summary settings.
   */
  reasoningSummary: z.boolean().optional(),
});

export type OpenAIResponsesProviderOptions = z.infer<
  typeof openaiResponsesProviderOptionsSchema
>;
