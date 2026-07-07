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
    arrayBuffer: jest
      .fn()
      .mockResolvedValue(new ArrayBuffer(Math.min(size, 8))),
  };
}

describe("api/download-media route — additional branches", () => {
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleError = jest.spyOn(console, "error").mockImplementation();
  });
  afterEach(() => consoleError.mockRestore());

  it("rejects oversized files detected after download via blob.size", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "video/mp4" }),
      blob: jest.fn().mockResolvedValue(blob(60 * 1024 * 1024)),
    });
    const res = await GET(
      req(
        "https://novita.ai/api/download-media?url=" +
          encodeURIComponent("https://cdn.example.com/big.mp4"),
      ),
    );
    expect(res.status).toBe(413);
  });

  it("derives a default filename and octet-stream type when the path has no filename", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers(), // no content-type
      blob: jest.fn().mockResolvedValue(blob(10)),
    });
    const res = await GET(
      req(
        "https://novita.ai/api/download-media?url=" +
          encodeURIComponent("https://cdn.example.com/"),
      ),
    );
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/octet-stream");
    expect(res.headers.get("Content-Disposition")).toContain("download-");
    expect(res.headers.get("Content-Disposition")).toContain(".bin");
  });

  it("returns 500 when a non-abort fetch error is thrown", async () => {
    mockFetch.mockRejectedValueOnce(new Error("connection reset"));
    const res = await GET(
      req(
        "https://novita.ai/api/download-media?url=" +
          encodeURIComponent("https://cdn.example.com/x.png"),
      ),
    );
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      error: "Failed to download file",
    });
  });
});
