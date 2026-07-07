/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const { GET } = require("@/app/well-known/openid-configuration/route");
const { oauthDiscoveryMetadata } = require("@/lib/oauth/discovery");

describe("openid-configuration route", () => {
  it("extends discovery metadata with userinfo and claims", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=3600");
    const body = await res.json();
    expect(body.issuer).toBe(oauthDiscoveryMetadata.issuer);
    expect(body.userinfo_endpoint).toBe(
      "https://api-server.novita.ai/user/info",
    );
    expect(body.claims_supported).toEqual(["sub", "name", "email"]);
  });
});
