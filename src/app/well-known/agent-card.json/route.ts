import { NextResponse } from "next/server";

const SITE_ORIGIN = "https://novita.ai";
const AGENT_CARD_DESCRIPTION =
  // i18n-disable-next-line
  "Agent-facing discovery card for Novita AI model APIs, GPU Cloud, Agent Sandbox, pricing, authentication, and documentation.";
// i18n-disable-next-line
const API_KEY_DESCRIPTION = "Use `Authorization: Bearer <NOVITA_API_KEY>`.";
// i18n-disable-next-line
const SKILL_NAME = "Novita documentation lookup";
const SKILL_DESCRIPTION =
  // i18n-disable-next-line
  "Find Novita documentation for Model APIs, GPU Cloud, Agent Sandbox, authentication, pricing, and integrations.";
// i18n-disable-next-line
const EXAMPLE_CHAT_COMPLETION =
  "How do I create a chat completion with Novita?";
// i18n-disable-next-line
const EXAMPLE_SANDBOX_QUICKSTART = "Where is the Agent Sandbox quickstart?";
// i18n-disable-next-line
const EXAMPLE_AUTH = "How do I authenticate Novita API requests?";

const agentCard = {
  // i18n-disable-next-line
  protocolVersion: "0.3.0",
  // i18n-disable-next-line
  name: "Novita AI",
  description: AGENT_CARD_DESCRIPTION,
  url: SITE_ORIGIN,
  // i18n-disable-next-line
  version: "1.0.0",
  documentationUrl: `${SITE_ORIGIN}/docs`,
  provider: {
    // i18n-disable-next-line
    organization: "Novita AI",
    url: SITE_ORIGIN,
  },
  capabilities: {
    streaming: false,
    pushNotifications: false,
    stateTransitionHistory: false,
  },
  defaultInputModes: ["text/plain", "text/markdown"],
  defaultOutputModes: ["text/plain", "text/markdown", "application/json"],
  securitySchemes: {
    // i18n-disable-next-line
    apiKey: {
      // i18n-disable-next-line
      type: "apiKey",
      // i18n-disable-next-line
      in: "header",
      // i18n-disable-next-line
      name: "Authorization",
      description: API_KEY_DESCRIPTION,
    },
  },
  security: [{ apiKey: [] }],
  skills: [
    {
      // i18n-disable-next-line
      id: "novita_docs_lookup",
      name: SKILL_NAME,
      description: SKILL_DESCRIPTION,
      tags: ["documentation", "api", "models", "gpu", "sandbox"],
      examples: [
        EXAMPLE_CHAT_COMPLETION,
        EXAMPLE_SANDBOX_QUICKSTART,
        EXAMPLE_AUTH,
      ],
    },
  ],
};

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(agentCard, {
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
