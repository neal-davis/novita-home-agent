import { NextResponse } from "next/server";
import {
  mcpServerCard,
  mcpServerCardHeaders,
} from "@/lib/agent-discovery/mcpServerCard";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(mcpServerCard, {
    headers: mcpServerCardHeaders,
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      // i18n-disable-next-line
      "Access-Control-Allow-Origin": "*",
      // i18n-disable-next-line
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      // i18n-disable-next-line
      "Access-Control-Allow-Headers": "Content-Type",
      // i18n-disable-next-line
      "Access-Control-Max-Age": "86400",
    },
  });
}
