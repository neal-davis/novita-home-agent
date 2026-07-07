/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const route = require("@/app/well-known/mcp/server-cards.json/route");
const { mcpServerCard } = require("@/lib/agent-discovery/mcpServerCard");

describe("mcp/server-cards.json route (more)", () => {
  it("is exported as a force-static route segment", () => {
    expect(route.dynamic).toBe("force-static");
  });

  it("wraps the server card in a servers array", async () => {
    const res = await route.GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.servers)).toBe(true);
    expect(body.servers).toHaveLength(1);
    expect(body.servers[0]).toEqual(mcpServerCard);
  });
});
