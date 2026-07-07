/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const route = require("@/app/well-known/openapi.json/route");

describe("openapi.json route (more)", () => {
  it("is exported as a force-static route segment", () => {
    expect(route.dynamic).toBe("force-static");
  });

  it("serves the OpenAPI discovery document with the correct content type", async () => {
    const res = await route.GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "application/openapi+json; charset=utf-8",
    );
    const body = await res.json();
    expect(body.openapi).toBe("3.1.0");
    expect(body.servers[0].url).toBe("https://api.novita.ai");
    expect(Object.keys(body.paths)).toEqual(
      expect.arrayContaining([
        "/openai/v1/models",
        "/openai/v1/chat/completions",
        "/openai/v1/embeddings",
      ]),
    );
    expect(body.paths["/openai/v1/models"].get.summary).toBe("List models");
  });
});
