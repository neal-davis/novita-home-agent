import { NextResponse } from "next/server";
import {
  mcpServerCard,
  mcpServerCardHeaders,
} from "@/lib/agent-discovery/mcpServerCard";
import { handleMcpRequest } from "@/lib/agent-discovery/mcpProtocol";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(mcpServerCard, {
    headers: mcpServerCardHeaders,
  });
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: "Parse error",
        },
      },
      { status: 400 },
    );
  }

  const response = handleMcpRequest(
    payload as Parameters<typeof handleMcpRequest>[0],
  );

  if (response instanceof Response) {
    return response;
  }

  return NextResponse.json(response, {
    headers: {
      // i18n-disable-next-line
      "Content-Type": "application/json; charset=utf-8",
      // i18n-disable-next-line
      "Access-Control-Allow-Origin": "*",
      // i18n-disable-next-line
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      // i18n-disable-next-line
      "Access-Control-Allow-Origin": "*",
      // i18n-disable-next-line
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      // i18n-disable-next-line
      "Access-Control-Allow-Headers": "Content-Type, MCP-Protocol-Version",
      // i18n-disable-next-line
      "Access-Control-Max-Age": "86400",
    },
  });
}
