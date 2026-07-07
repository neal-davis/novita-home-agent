import {
  createParser,
  EventSourceParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import {
  AIStreamParser,
  FunctionDefinition,
  LLMErrReason,
  OpenAIStreamReturnTypes,
} from "./type";

import z from "zod";
import { Tool, tool } from "ai";

export function convertToTool(def: FunctionDefinition) {
  const { name, description, parameters } = def;

  const shape: Record<string, any> = {};
  const requiredSet = new Set(parameters.required);

  for (const [key, prop] of Object.entries(parameters.properties)) {
    let schema: any;

    switch (prop.type) {
      case "string":
        schema = prop.enum
          ? z.enum(prop.enum as [string, ...string[]])
          : z.string();
        break;
      case "number":
        schema = z.union([
          z.number(),
          z.string().transform((val) => {
            const num = parseFloat(val);
            if (isNaN(num)) throw new Error(`Invalid number: ${val}`);
            return num;
          }),
        ]);
        break;
      case "boolean":
        schema = z.boolean();
        break;
      case "integer":
        schema = z.union([
          z.number().int(),
          z.string().transform((val) => {
            const num = parseInt(val, 10);
            if (isNaN(num)) throw new Error(`Invalid integer: ${val}`);
            return num;
          }),
        ]);
        break;
      default:
        schema = z.any();
    }

    if (prop.description) {
      schema = schema.describe(prop.description);
    }

    // 如果不是 required 就标记为 optional
    if (!requiredSet.has(key)) {
      schema = schema.optional();
    }

    shape[key] = schema;
  }

  return tool({
    description,
    inputSchema: z.object(shape),
  });
}

export function convertToolsToAISDK(tools: FunctionDefinition[]) {
  if (!Array.isArray(tools) || tools.length === 0) {
    return {};
  }

  const toolsMap: Record<string, Tool> = {};

  for (const tool of tools) {
    const { name, description, parameters } = tool;

    if (!name || !description || !parameters) {
      console.warn("Tool missing params:", tool);
      continue;
    }

    toolsMap[name] = convertToTool(tool);
  }

  return toolsMap;
}

export class StreamingTextResponse extends Response {
  constructor(res: ReadableStream) {
    super(res as any, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }
}

export function isChatCompletionChunk(data: OpenAIStreamReturnTypes) {
  return (
    "choices" in data &&
    data.choices &&
    data.choices[0] &&
    "delta" in data.choices[0]
  );
}

export function isCompletion(data: any) {
  return (
    "choices" in data &&
    data.choices &&
    data.choices[0] &&
    "text" in data.choices[0]
  );
}

export function trimStartOfStreamHelper(): (text: string) => string {
  let isStreamStart = true;

  return (text: string): string => {
    if (isStreamStart) {
      text = text.trimStart();
      if (text) isStreamStart = false;
    }
    return text;
  };
}

export function createStreamDataTransformer() {
  return new TransformStream({
    transform: async (chunk, controller) => {
      controller.enqueue(chunk);
    },
  });
}

/**
 * Creates a TransformStream that parses events from an EventSource stream using a custom parser.
 * @param {AIStreamParser} customParser - Function to handle event data.
 * @returns {TransformStream<Uint8Array, string>} TransformStream parsing events.
 */
export function createEventStreamTransformer(
  customParser?: AIStreamParser,
): TransformStream<Uint8Array, string | { isText: false; content: string }> {
  const textDecoder = new TextDecoder();
  let eventSourceParser: EventSourceParser;

  return new TransformStream({
    async start(controller): Promise<void> {
      eventSourceParser = createParser(
        (event: ParsedEvent | ReconnectInterval) => {
          if (
            ("data" in event &&
              event.type === "event" &&
              event.data === "[DONE]") ||
            // Replicate doesn't send [DONE] but does send a 'done' event
            // @see https://replicate.com/docs/streaming
            (event as any).event === "done"
          ) {
            controller.terminate();
            return;
          }

          if ("data" in event) {
            const parsedMessage = customParser
              ? customParser(event.data, {
                  event: event.event,
                })
              : event.data;
            if (parsedMessage) controller.enqueue(parsedMessage);
          }
        },
      );
    },

    transform(chunk) {
      eventSourceParser.feed(textDecoder.decode(chunk));
    },
  });
}

type LLMResponseError = {
  reason: LLMErrReason;
  message: string;
  metadata?: any;
};

export function LLMResponseError(resp: LLMResponseError, status: number) {
  return new Response(JSON.stringify(resp), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
