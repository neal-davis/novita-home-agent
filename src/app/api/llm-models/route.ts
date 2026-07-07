import { NextResponse } from "next/server";
import { getFullLLMModels } from "@/api/model";
import { reportError } from "@/lib/utils/reporter";
import { headers } from "next/headers";

export const revalidate = 300;

/**
 * GET /api/llm-models
 * Get LLM model list with server-side caching
 *
 * Query Parameters:
 * - filter: comma-separated model types, e.g. "chat,embedding,reranker", default "chat"
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const filterParam = url.searchParams.get("filter") || "chat";
    const filter = filterParam.split(",").filter(Boolean) as Array<
      "chat" | "embedding" | "reranker"
    >;

    const headersList = headers();
    const authHeader = headersList.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    console.log("[LLM Models API] Fetching models with filter:", filter);

    const models = await getFullLLMModels(filter, token);

    return NextResponse.json(
      {
        data: models,
        cached_at: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  } catch (error: any) {
    console.error("[LLM Models API] Error fetching models:", error);

    reportError({
      errorNo: "api_llm-models_fetch_failed",
      errorInfo: error?.message || String(error),
      level: 0,
      type: "request",
    });

    return NextResponse.json(
      {
        error: "Failed to fetch LLM models",
        message: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
