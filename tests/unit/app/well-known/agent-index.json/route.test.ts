/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const { GET, OPTIONS } = require("@/app/well-known/agent-index.json/route");

describe("agent-index.json route", () => {
  it("returns the org agent discovery index", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    const body = await res.json();
    expect(body.domain).toBe("novita.ai");
    expect(body.agents.map((a: any) => a.id)).toEqual([
      "novita-a2a",
      "novita-mcp",
    ]);
    expect(body.discoveryDocuments.agentCard).toBe(
      "https://novita.ai/.well-known/agent-card.json",
    );
  });

  it("answers CORS preflight with 204", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe(
      "GET, OPTIONS",
    );
  });
});
