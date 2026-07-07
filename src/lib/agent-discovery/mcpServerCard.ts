const SITE_ORIGIN = "https://novita.ai";
// i18n-disable-next-line
const MCP_SERVER_REPOSITORY = "https://github.com/novitalabs/novita-mcp-server";

export const mcpServerCard = {
  // i18n-disable-next-line
  $schema:
    "https://static.modelcontextprotocol.io/schemas/mcp-server-card/v1.json",
  // i18n-disable-next-line
  version: "1.0",
  // i18n-disable-next-line
  protocolVersion: "2025-06-18",
  serverInfo: {
    // i18n-disable-next-line
    name: "Novita MCP Server",
    // i18n-disable-next-line
    title: "Novita MCP Server",
    // i18n-disable-next-line
    version: "1.0.0",
  },
  // i18n-disable-next-line
  description:
    "Agent discovery card for Novita's MCP server. The HTTP endpoint exposes navigation and discovery tools for Novita docs, console, Model API, GPU Cloud, Agent Sandbox, and auth flows.",
  documentationUrl: MCP_SERVER_REPOSITORY,
  transport: {
    // i18n-disable-next-line
    type: "streamable_http",
    // i18n-disable-next-line
    endpoint: `${SITE_ORIGIN}/mcp`,
  },
  capabilities: {
    tools: {
      listChanged: true,
    },
  },
  authentication: {
    required: true,
    // i18n-disable-next-line
    schemes: ["apiKey"],
  },
  securitySchemes: [
    {
      // i18n-disable-next-line
      type: "apiKey",
      // i18n-disable-next-line
      in: "env",
      // i18n-disable-next-line
      name: "NOVITA_API_KEY",
    },
  ],
  _meta: {
    repository: MCP_SERVER_REPOSITORY,
    stdioCommand: "npx -y @novitalabs/novita-mcp-server",
    serverCardUrl: `${SITE_ORIGIN}/.well-known/mcp/server-card.json`,
    // i18n-disable-next-line
    status: "active",
  },
};

export const mcpServerCardHeaders = {
  // i18n-disable-next-line
  "Content-Type": "application/json; charset=utf-8",
  // i18n-disable-next-line
  "Cache-Control": "public, max-age=3600",
  // i18n-disable-next-line
  "Access-Control-Allow-Origin": "*",
  // i18n-disable-next-line
  "X-Content-Type-Options": "nosniff",
};
