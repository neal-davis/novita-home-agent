import { NextResponse } from "next/server";
import { getLlmsTxt, llmsTxtHeaders } from "@/lib/agent-discovery/llmsTxt";

export const dynamic = "force-dynamic";

export async function GET() {
  return new NextResponse(await getLlmsTxt(), {
    headers: llmsTxtHeaders,
  });
}
