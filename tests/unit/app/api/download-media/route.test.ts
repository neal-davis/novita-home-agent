/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const { GET } = require("@/app/api/download-media/route");

const mockFetch = global.fetch as jest.Mock;

function req(urlStr: string) {
  const u = new URL(urlStr);
  return { nextUrl: { searchParams: u.searchParams } } as any;
}

function blob(size: number) {
  return {
    size,
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(size)),
  };
}

describe("api/download-media route", () => {
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleError = jest.spyOn(console, "error").mockImplementation();
  });
  afterEach(() => consoleError.mockRestore());

  it("returns 400 when url param is missing", async () => {
    const res = await GET(req("https://novita.ai/api/download-media"));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Missing url parameter",
    });
  });

  it("returns 400 for an invalid url", async () => {
    const res = await GET(
      req("https://novita.ai/api/download-media?url=not-a-url"),
    );
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "Invalid URL" });
  });

  it("returns 400 for a disallowed protocol", async () => {
    const res = await GET(
      req(
        "https://novita.ai/api/download-media?url=" +
          encodeURIComponent("ftp://example.com/file.bin"),
      ),
    );
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Invalid URL protocol",
    });
  });

  it("proxies a successful download with attachment headers", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        "content-type": "image/png",
        "content-length": "100",
      }),
      blob: jest.fn().mockResolvedValue(blob(100)),
    });
    const res = await GET(
      req(
        "https://novita.ai/api/download-media?url=" +
          encodeURIComponent("https://cdn.example.com/pic.png"),
      ),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/png");
    expect(res.headers.get("Content-Disposition")).toBe(
      'attachment; filename="pic.png"',
    );
  });

  it("returns upstream status when fetch is not ok", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: new Headers(),
    });
    const res = await GET(
      req(
        "https://novita.ai/api/download-media?url=" +
          encodeURIComponent("https://cdn.example.com/missing.png"),
      ),
    );
    expect(res.status).toBe(404);
  });

  it("rejects files exceeding the max size via content-length", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({
        "content-type": "video/mp4",
        "content-length": String(60 * 1024 * 1024),
      }),
      blob: jest.fn(),
    });
    const res = await GET(
      req(
        "https://novita.ai/api/download-media?url=" +
          encodeURIComponent("https://cdn.example.com/big.mp4"),
      ),
    );
    expect(res.status).toBe(413);
  });

  it("returns 504 on fetch abort/timeout", async () => {
    const abortErr = new Error("aborted");
    abortErr.name = "AbortError";
    mockFetch.mockRejectedValueOnce(abortErr);
    const res = await GET(
      req(
        "https://novita.ai/api/download-media?url=" +
          encodeURIComponent("https://cdn.example.com/slow.png"),
      ),
    );
    expect(res.status).toBe(504);
  });
});
