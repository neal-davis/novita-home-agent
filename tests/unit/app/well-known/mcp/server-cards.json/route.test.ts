/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const { GET } = require("@/app/well-known/mcp/server-cards.json/route");
const { mcpServerCard } = require("@/lib/agent-discovery/mcpServerCard");

describe("mcp/server-cards.json route", () => {
  it("returns the mcp server card wrapped in a servers array", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ servers: [mcpServerCard] });
  });
});
