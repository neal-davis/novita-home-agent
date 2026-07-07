import { NextResponse } from "next/server";

const SITE_ORIGIN = "https://novita.ai";

const agentIndex = {
  // i18n-disable-next-line
  $schema: "https://novita.ai/.well-known/schemas/agent-index.schema.json",
  // i18n-disable-next-line
  name: "Novita AI agent discovery index",
  // i18n-disable-next-line
  description:
    "Organization-level index for agents and agent-facing discovery documents published by Novita AI.",
  domain: "novita.ai",
  dnsAid: {
    indexOwner: "_index._agents.novita.ai",
    records: [
      {
        owner: "_index._agents.novita.ai",
        type: "SVCB",
        target: "novita.ai",
        endpoint: `${SITE_ORIGIN}/.well-known/agent-index.json`,
        wellKnown: "agent-index.json",
      },
      {
        owner: "_a2a._agents.novita.ai",
        type: "SVCB",
        target: "novita.ai",
        endpoint: `${SITE_ORIGIN}/.well-known/agent-card.json`,
        wellKnown: "agent-card.json",
      },
      {
        owner: "_mcp._agents.novita.ai",
        type: "SVCB",
        target: "novita.ai",
        endpoint: `${SITE_ORIGIN}/.well-known/mcp.json`,
        wellKnown: "mcp.json",
      },
    ],
  },
  agents: [
    {
      id: "novita-a2a",
      name: "Novita AI",
      protocol: "a2a",
      ownerName: "_a2a._agents.novita.ai",
      endpoint: SITE_ORIGIN,
      wellKnownUrl: `${SITE_ORIGIN}/.well-known/agent-card.json`,
      capabilities: [
        "model-api",
        "gpu-cloud",
        "agent-sandbox",
        "documentation",
        "pricing",
        "authentication",
      ],
    },
    {
      id: "novita-mcp",
      name: "Novita MCP Server",
      protocol: "mcp",
      ownerName: "_mcp._agents.novita.ai",
      endpoint: SITE_ORIGIN,
      wellKnownUrl: `${SITE_ORIGIN}/.well-known/mcp.json`,
      capabilities: ["tools", "documentation", "api-reference"],
    },
  ],
  discoveryDocuments: {
    agentCard: `${SITE_ORIGIN}/.well-known/agent-card.json`,
    agentSkills: `${SITE_ORIGIN}/.well-known/agent-skills/index.json`,
    apiCatalog: `${SITE_ORIGIN}/.well-known/api-catalog`,
    mcpServerCard: `${SITE_ORIGIN}/.well-known/mcp.json`,
    openapi: `${SITE_ORIGIN}/.well-known/openapi.json`,
    oauthAuthorizationServer: `${SITE_ORIGIN}/.well-known/oauth-authorization-server`,
    oauthProtectedResource: `${SITE_ORIGIN}/.well-known/oauth-protected-resource`,
  },
};

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(agentIndex, {
    headers: {
      // i18n-disable-next-line
      "Content-Type": "application/json; charset=utf-8",
      // i18n-disable-next-line
      "Cache-Control": "public, max-age=3600",
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
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      // i18n-disable-next-line
      "Access-Control-Allow-Headers": "Content-Type",
      // i18n-disable-next-line
      "Access-Control-Max-Age": "86400",
    },
  });
}
