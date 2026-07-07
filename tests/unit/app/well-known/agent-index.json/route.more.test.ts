/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const route = require("@/app/well-known/agent-index.json/route");

describe("agent-index.json route (more)", () => {
  it("is exported as a force-static route segment", () => {
    expect(route.dynamic).toBe("force-static");
  });

  it("publishes DNS-based agent discovery records and document links", async () => {
    const res = await route.GET();
    const body = await res.json();
    expect(body.dnsAid.indexOwner).toBe("_index._agents.novita.ai");
    expect(body.dnsAid.records).toHaveLength(3);
    expect(body.dnsAid.records.map((r: any) => r.wellKnown)).toEqual([
      "agent-index.json",
      "agent-card.json",
      "mcp.json",
    ]);
    expect(body.discoveryDocuments.mcpServerCard).toBe(
      "https://novita.ai/.well-known/mcp.json",
    );
    expect(body.discoveryDocuments.openapi).toBe(
      "https://novita.ai/.well-known/openapi.json",
    );
  });

  it("sets the CORS max-age and allowed headers on preflight", async () => {
    const res = await route.OPTIONS();
    expect(res.headers.get("Access-Control-Allow-Headers")).toBe(
      "Content-Type",
    );
    expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
  });
});
