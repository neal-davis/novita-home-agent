/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const route = require("@/app/well-known/jwks.json/route");

describe("jwks.json route (more)", () => {
  it("is exported as a force-static route segment", () => {
    expect(route.dynamic).toBe("force-static");
  });

  it("returns an empty JWKS key set with cache headers", async () => {
    const res = await route.GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=3600");
    const body = await res.json();
    expect(body).toEqual({ keys: [] });
    expect(Array.isArray(body.keys)).toBe(true);
  });
});
