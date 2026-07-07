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

const mockFetch = global.fetch as jest.Mock;

function req(urlStr: string) {
  return { url: urlStr } as any;
}

describe("api/markdown route — additional branches", () => {
  beforeEach(() => jest.clearAllMocks());

  it("defaults the source path to '/' when no path param is given", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue("<p>home</p>"),
      headers: new Headers(),
    });
    const res = await GET(req("https://novita.ai/api/markdown"));
    expect(res.status).toBe(200);
    const fetchedUrl = mockFetch.mock.calls[0][0];
    expect(String(fetchedUrl)).toBe("https://novita.ai/");
  });

  it("appends the search param to the fetched source url", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue("<p>x</p>"),
      headers: new Headers(),
    });
    await GET(
      req(
        "https://novita.ai/api/markdown?path=/docs&search=" +
          encodeURIComponent("?q=1"),
      ),
    );
    expect(String(mockFetch.mock.calls[0][0])).toBe(
      "https://novita.ai/docs?q=1",
    );
  });

  it("omits the Link header when the upstream response has none", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: jest.fn().mockResolvedValue("<p>x</p>"),
      headers: new Headers(),
    });
    const res = await GET(req("https://novita.ai/api/markdown?path=/docs"));
    expect(res.headers.get("Link")).toBeNull();
  });
});
