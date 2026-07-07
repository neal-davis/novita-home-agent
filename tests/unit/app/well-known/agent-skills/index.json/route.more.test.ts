/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const route = require("@/app/well-known/agent-skills/index.json/route");

describe("agent-skills/index.json route (more)", () => {
  it("is exported as a force-static route segment", () => {
    expect(route.dynamic).toBe("force-static");
  });

  it("emits discovery headers and a digest-pinned skill entry", async () => {
    const res = await route.GET();
    expect(res.headers.get("Content-Type")).toBe(
      "application/json; charset=utf-8",
    );
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");

    const body = await res.json();
    expect(body.$schema).toContain("agentskills.io");
    expect(body.skills).toHaveLength(1);
    expect(body.skills[0].digest).toMatch(/^sha256:/);
  });

  it("answers preflight with the allowed methods header", async () => {
    const res = await route.OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe(
      "GET, OPTIONS",
    );
  });
});
