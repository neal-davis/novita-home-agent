import { convertToModelMessages, streamText } from "ai";
import { createModelProvider } from "./model-provider";
import { slaTransform } from "./stream-transform";
import { convertToolsToAISDK } from "./utils";
import { withKeepAlive } from "../utils";

export const maxDuration = 300;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const MAX_MESSAGES = 8;

export async function POST(req: Request) {
  const {
    messages,
    max_tokens,
    isReasoningModel,
    model: modelName,
    presence_penalty,
    system_content,
    temperature,
    apiKey,
    character_content,
    response_format,
    frequency_penalty,
    min_p,
    top_k,
    enable_thinking,
    tools,
  } = await req.json();

  const endpoint = new URL(req.url).searchParams.get("endpoint");

  const modelProvider = createModelProvider({
    apiKey,
    baseURL: endpoint ? `${endpoint}` : `${BASE_URL}/openai/v1`,
  });

  const model = modelProvider.chatModel(modelName);

  const llm_tools = convertToolsToAISDK(tools);

  const providerOptions: Record<string, any> = {
    min_p,
    response_format,
  };

  if (isReasoningModel) {
    providerOptions.enable_thinking = enable_thinking;
  }

  try {
    const result = await streamText({
      model,
      messages: convertToModelMessages(messages.slice(-1 * MAX_MESSAGES)),
      system: character_content ? character_content : system_content,
      temperature,
      topK: top_k,
      presencePenalty: presence_penalty,
      frequencyPenalty: frequency_penalty,
      maxOutputTokens: max_tokens,
      maxRetries: 0,
      providerOptions: {
        provider: providerOptions,
      },
      tools: llm_tools,
      includeRawChunks: true,
      experimental_transform: [slaTransform()],
    });

    const uiResp = result.toUIMessageStreamResponse({
      sendSources: true,
      sendReasoning: true,
      onError: (error: any) => {
        console.log("onError", error);
        const response = error?.responseBody;
        return response || "Something went wrong";
      },
    });

    const keepAliveBody = withKeepAlive(uiResp.body, {
      intervalMs: 10000,
      heartbeat: "ping\n\n",
      signal: (req as any).signal,
    });

    const headers = new Headers(uiResp.headers);
    headers.set("Content-Type", "text/event-stream; charset=utf-8");
    headers.set("Cache-Control", "no-cache, no-transform");
    headers.set("Connection", "keep-alive");

    return new Response(keepAliveBody, {
      status: uiResp.status,
      statusText: uiResp.statusText,
      headers,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
