/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const route = require("@/app/well-known/agent-card.json/route");

describe("agent-card.json route (more)", () => {
  it("is exported as a force-static route segment", () => {
    expect(route.dynamic).toBe("force-static");
  });

  it("emits the documentation discovery headers and metadata", async () => {
    const res = await route.GET();
    expect(res.headers.get("Content-Type")).toBe(
      "application/json; charset=utf-8",
    );
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=3600");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");

    const body = await res.json();
    expect(body.documentationUrl).toBe("https://novita.ai/docs");
    expect(body.provider.organization).toBe("Novita AI");
    expect(body.capabilities.streaming).toBe(false);
    expect(body.defaultOutputModes).toContain("application/json");
    expect(body.skills[0].examples).toHaveLength(3);
  });
});
