import { NextResponse } from "next/server";
import { oauthDiscoveryMetadata } from "@/lib/oauth/discovery";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(oauthDiscoveryMetadata, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
