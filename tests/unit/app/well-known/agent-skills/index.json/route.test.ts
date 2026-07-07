/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const {
  GET,
  OPTIONS,
} = require("@/app/well-known/agent-skills/index.json/route");

describe("agent-skills/index.json route", () => {
  it("returns the agent skills discovery index", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.skills[0].name).toBe("novita-docs");
    expect(body.skills[0].type).toBe("codex-skill");
    expect(body.skills[0].url).toContain("SKILL.md");
  });

  it("answers CORS preflight with 204", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
  });
});
