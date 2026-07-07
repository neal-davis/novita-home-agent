import { NextResponse } from "next/server";
import { oauthDiscoveryMetadata } from "@/lib/oauth/discovery";

const openidConfiguration = {
  ...oauthDiscoveryMetadata,
  userinfo_endpoint: "https://api-server.novita.ai/user/info",
  claims_supported: ["sub", "name", "email"],
};

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(openidConfiguration, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
