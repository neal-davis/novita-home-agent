import { streamText } from "ai";
import { createModelProvider } from "../chat/model-provider";
import { slaTransform } from "../chat/stream-transform";
import { withKeepAlive } from "../utils";

export const maxDuration = 300;

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: Request) {
  const {
    prompt,
    max_tokens,
    model: modelName,
    presence_penalty,
    temperature,
    top_p,
    apiKey,
    response_format,
    frequency_penalty,
    repetition_penalty,
    min_p,
    top_k,
  } = await req.json();

  const endpoint = new URL(req.url).searchParams.get("endpoint");

  const modelProvider = createModelProvider({
    apiKey,
    baseURL: endpoint
      ? `${BASE_URL}/dedicated/v1/openai`
      : `${BASE_URL}/openai/v1`,
  });

  const model = modelProvider.completionModel(modelName);

  const providerOptions: Record<string, any> = {
    repetition_penalty,
    min_p,
    response_format,
  };

  try {
    const result = await streamText({
      model,
      prompt,
      temperature,
      topP: top_p,
      topK: top_k,
      presencePenalty: presence_penalty,
      frequencyPenalty: frequency_penalty,
      maxOutputTokens: max_tokens,
      maxRetries: 0,
      providerOptions: {
        provider: providerOptions,
      },
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
