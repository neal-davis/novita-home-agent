import { NextResponse } from "next/server";
import { discoveryHeaders, oauthProtectedResourceMetadata } from "./metadata";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(oauthProtectedResourceMetadata, {
    headers: discoveryHeaders,
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
