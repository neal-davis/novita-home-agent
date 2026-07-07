/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const route = require("@/app/well-known/mcp/server-card.json/route");

describe("mcp/server-card.json route (more)", () => {
  it("is exported as a force-static route segment", () => {
    expect(route.dynamic).toBe("force-static");
  });

  it("sets the CORS max-age and allowed headers on preflight", async () => {
    const res = await route.OPTIONS();
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Headers")).toBe(
      "Content-Type",
    );
    expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
  });
});
