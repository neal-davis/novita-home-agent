import { NextResponse } from "next/server";
import {
  mcpServerCard,
  mcpServerCardHeaders,
} from "@/lib/agent-discovery/mcpServerCard";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(
    {
      servers: [mcpServerCard],
    },
    {
      headers: mcpServerCardHeaders,
    },
  );
}
