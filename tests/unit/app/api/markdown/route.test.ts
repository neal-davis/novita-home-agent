/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

jest.mock("@/lib/markdown/htmlToMarkdown", () => ({
  htmlToMarkdown: jest.fn(() => "# Title\n\nbody"),
  countApproxMarkdownTokens: jest.fn(() => 7),
}));

const { GET } = require("@/app/api/markdown/route");
const {
  htmlToMarkdown,
  countApproxMarkdownTokens,
} = require("@/lib/markdown/htmlToMarkdown");

const mockFetch = global.fetch as jest.Mock;

function req(urlStr: string) {
  return { url: urlStr } as any;
}

describe("api/markdown route", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 for api paths", async () => {
    const res = await GET(
      req("https://novita.ai/api/markdown?path=/api/secret"),
    );
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Invalid markdown source",
    });
  });

  it("returns 400 for non-absolute paths", async () => {
    const res = await GET(req("https://novita.ai/api/markdown?path=relative"));
    expect(res.status).toBe(400);
  });

  it("converts fetched html to markdown with token header", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue("<h1>Title</h1>"),
      headers: new Headers(),
    });
    const res = await GET(
      req("https://novita.ai/api/markdown?path=/docs/intro"),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(res.headers.get("x-markdown-tokens")).toBe("7");
    expect(htmlToMarkdown).toHaveBeenCalledWith(
      "<h1>Title</h1>",
      "/docs/intro",
    );
    expect(countApproxMarkdownTokens).toHaveBeenCalled();
    await expect(res.text()).resolves.toContain("# Title");
  });

  it("forwards a Link header from the upstream response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue("<p>x</p>"),
      headers: new Headers({ Link: "<https://novita.ai/next>; rel=next" }),
    });
    const res = await GET(
      req("https://novita.ai/api/markdown?path=/docs/page"),
    );
    expect(res.headers.get("Link")).toBe("<https://novita.ai/next>; rel=next");
  });

  it("propagates a non-ok upstream status", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: jest.fn().mockResolvedValue("upstream down"),
      headers: new Headers({ "Content-Type": "text/plain" }),
    });
    const res = await GET(
      req("https://novita.ai/api/markdown?path=/docs/down"),
    );
    expect(res.status).toBe(503);
    await expect(res.text()).resolves.toBe("upstream down");
  });
});
