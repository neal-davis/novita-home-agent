/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const route = require("@/app/well-known/oauth-protected-resource/route");

describe("oauth-protected-resource route (more)", () => {
  it("is exported as a force-static route segment", () => {
    expect(route.dynamic).toBe("force-static");
  });

  it("sets the cache header on the GET response", async () => {
    const res = await route.GET();
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=3600");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });
});
