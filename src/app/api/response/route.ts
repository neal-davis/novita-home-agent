import { convertToModelMessages, streamText } from "ai";
import { createModelProvider } from "../chat/model-provider";
import { convertToolsToAISDK } from "../chat/utils";
import { withKeepAlive } from "../utils";

export const maxDuration = 300;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const MAX_MESSAGES = 8;

export async function POST(req: Request) {
  const {
    messages,
    apiKey,
    max_output_tokens,
    temperature,
    top_logprobs,
    max_tool_calls,
    top_p,
    model: modelName,
    tools,
  } = await req.json();

  const modelProvider = createModelProvider({
    apiKey,
    baseURL: `${BASE_URL}/openai/v1`,
  });

  const model = modelProvider.responsesModel(modelName);

  const llm_tools = convertToolsToAISDK(tools);

  const providerOptions: Record<string, any> = {
    max_tool_calls,
    top_logprobs,
  };

  const prompt = convertToModelMessages(messages.slice(-1 * MAX_MESSAGES));

  try {
    const result = await streamText({
      model,
      prompt,
      maxOutputTokens: max_output_tokens,
      maxRetries: 0,
      topP: top_p,
      temperature: temperature,
      providerOptions: {
        provider: providerOptions,
      },
      tools: llm_tools,
      includeRawChunks: true,
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
