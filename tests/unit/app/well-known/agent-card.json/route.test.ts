/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const { GET } = require("@/app/well-known/agent-card.json/route");

describe("agent-card.json route", () => {
  it("returns the agent discovery card", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    const body = await res.json();
    expect(body.name).toBe("Novita AI");
    expect(body.protocolVersion).toBe("0.3.0");
    expect(body.url).toBe("https://novita.ai");
    expect(body.skills[0].id).toBe("novita_docs_lookup");
    expect(body.security).toEqual([{ apiKey: [] }]);
  });
});
