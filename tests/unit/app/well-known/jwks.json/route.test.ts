/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const { GET } = require("@/app/well-known/jwks.json/route");

describe("jwks.json route", () => {
  it("returns empty keys with cache header", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=3600");
    await expect(res.json()).resolves.toEqual({ keys: [] });
  });
});
