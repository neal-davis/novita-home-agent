/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const route = require("@/app/well-known/oauth-authorization-server/route");
const { oauthDiscoveryMetadata } = require("@/lib/oauth/discovery");

describe("oauth-authorization-server route (more)", () => {
  it("is exported as a force-static route segment", () => {
    expect(route.dynamic).toBe("force-static");
  });

  it("returns RFC 8414 authorization server metadata", async () => {
    const res = await route.GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "application/json; charset=utf-8",
    );
    const body = await res.json();
    expect(body).toEqual(oauthDiscoveryMetadata);
    expect(body.issuer).toBe("https://novita.ai");
    expect(body.code_challenge_methods_supported).toEqual(["S256"]);
  });
});
