/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const { GET, OPTIONS } = require("@/app/well-known/mcp/server-card.json/route");
const { mcpServerCard } = require("@/lib/agent-discovery/mcpServerCard");

describe("mcp/server-card.json route", () => {
  it("returns the mcp server card", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(mcpServerCard);
  });

  it("answers CORS preflight with 204", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe(
      "GET, OPTIONS",
    );
  });
});
