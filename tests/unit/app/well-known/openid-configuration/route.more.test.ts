/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const route = require("@/app/well-known/openid-configuration/route");
const { oauthDiscoveryMetadata } = require("@/lib/oauth/discovery");

describe("openid-configuration route (more)", () => {
  it("is exported as a force-static route segment", () => {
    expect(route.dynamic).toBe("force-static");
  });

  it("extends the oauth metadata with OIDC userinfo and claims", async () => {
    const res = await route.GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "application/json; charset=utf-8",
    );
    const body = await res.json();
    expect(body.userinfo_endpoint).toBe(
      "https://api-server.novita.ai/user/info",
    );
    expect(body.claims_supported).toEqual(["sub", "name", "email"]);
    // inherits the base oauth issuer
    expect(body.issuer).toBe(oauthDiscoveryMetadata.issuer);
  });
});
