/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const { GET } = require("@/app/well-known/openapi.json/route");

describe("openapi.json route", () => {
  it("returns an OpenAPI 3.1 document with model api paths", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "application/openapi+json; charset=utf-8",
    );
    const body = await res.json();
    expect(body.openapi).toBe("3.1.0");
    expect(body.info.title).toBe("Novita API");
    expect(Object.keys(body.paths)).toEqual(
      expect.arrayContaining([
        "/openai/v1/models",
        "/openai/v1/chat/completions",
        "/openai/v1/completions",
        "/openai/v1/embeddings",
      ]),
    );
  });
});
