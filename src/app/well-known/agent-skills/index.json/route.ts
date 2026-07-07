import { NextResponse } from "next/server";

const SKILL_URL =
  "https://raw.githubusercontent.com/novitalabs/novita-skills/main/skills/novita-docs/SKILL.md";

const agentSkillsIndex = {
  // i18n-disable-next-line
  $schema: "https://schemas.agentskills.io/discovery/0.2.0/schema.json",
  skills: [
    {
      // i18n-disable-next-line
      name: "novita-docs",
      // i18n-disable-next-line
      type: "codex-skill",
      // i18n-disable-next-line
      description:
        "Novita AI platform reference for LLM APIs, Agent Sandbox, GPU products, integrations, authentication, billing, pricing, rate limits, and troubleshooting.",
      url: SKILL_URL,
      // i18n-disable-next-line
      digest:
        "sha256:12637b0e295c63391170be3caacde7d0f92d5fdf64799d15fe3005b5940bc89e",
    },
  ],
};

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(agentSkillsIndex, {
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
