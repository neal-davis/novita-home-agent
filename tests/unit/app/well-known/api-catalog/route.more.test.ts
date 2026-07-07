/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const route = require("@/app/well-known/api-catalog/route");

describe("api-catalog route (more)", () => {
  it("is exported as a force-static route segment", () => {
    expect(route.dynamic).toBe("force-static");
  });

  it("serves an RFC 9727 linkset document with service descriptors", async () => {
    const res = await route.GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "application/linkset+json; charset=utf-8",
    );

    const body = await res.json();
    expect(body.linkset).toHaveLength(1);
    const entry = body.linkset[0];
    expect(entry.anchor).toBe("https://api.novita.ai");
    expect(entry["service-desc"][0].href).toBe(
      "https://novita.ai/.well-known/openapi.json",
    );
    expect(entry.status[0].href).toBe("https://novita.ai/api/health");
  });
});
