/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const { GET } = require("@/app/well-known/oauth-authorization-server/route");
const { oauthDiscoveryMetadata } = require("@/lib/oauth/discovery");

describe("oauth-authorization-server route", () => {
  it("returns the oauth discovery metadata", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "application/json; charset=utf-8",
    );
    await expect(res.json()).resolves.toEqual(oauthDiscoveryMetadata);
  });
});
