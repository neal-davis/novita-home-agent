/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

import { oauthDiscoveryMetadata } from "@/lib/oauth/discovery";
import {
  discoveryHeaders,
  oauthProtectedResourceMetadata,
} from "@/app/well-known/oauth-protected-resource/metadata";
const {
  GET,
  OPTIONS,
} = require("@/app/well-known/oauth-protected-resource/route");

describe("OAuth protected resource metadata", () => {
  it("publishes RFC 9728 protected resource metadata", () => {
    expect(oauthProtectedResourceMetadata).toEqual({
      resource: "https://novita.ai",
      authorization_servers: ["https://novita.ai"],
      scopes_supported: oauthDiscoveryMetadata.scopes_supported,
      bearer_methods_supported: ["header"],
      resource_name: "Novita AI",
      resource_documentation: "https://novita.ai/docs/guides/introduction",
      resource_tos_uri: "https://novita.ai/legal/terms-of-service",
      resource_policy_uri: "https://novita.ai/legal/privacy-policy",
    });
  });

  it("returns discovery response headers", () => {
    expect(discoveryHeaders).toEqual({
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
      "X-Content-Type-Options": "nosniff",
    });
  });
});

describe("oauth-protected-resource route", () => {
  it("returns metadata with discovery headers", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    await expect(res.json()).resolves.toEqual(oauthProtectedResourceMetadata);
  });

  it("answers CORS preflight with 204 and method headers", async () => {
    const res = await OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe(
      "GET, OPTIONS",
    );
    expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
  });
});
