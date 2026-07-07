/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const route = require("@/app/well-known/mcp.json/route");
const { mcpServerCard } = require("@/lib/agent-discovery/mcpServerCard");

describe("mcp.json route (more)", () => {
  it("is exported as a force-static route segment", () => {
    expect(route.dynamic).toBe("force-static");
  });

  it("returns the canonical mcp server card payload", async () => {
    const res = await route.GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mcpServerCard);
    expect(body.transport.type).toBe("streamable_http");
    expect(body.authentication.required).toBe(true);
  });
});
