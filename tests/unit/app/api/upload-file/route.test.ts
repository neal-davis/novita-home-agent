/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

jest.mock("@vercel/blob/client", () => ({ handleUpload: jest.fn() }));

const { POST } = require("@/app/api/upload-file/route");
const { handleUpload } = require("@vercel/blob/client");

function req(body: any) {
  return { json: jest.fn().mockResolvedValue(body) } as any;
}

describe("api/upload-file route", () => {
  let consoleLog: jest.SpyInstance;
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleLog = jest.spyOn(console, "log").mockImplementation();
    consoleError = jest.spyOn(console, "error").mockImplementation();
  });
  afterEach(() => {
    consoleLog.mockRestore();
    consoleError.mockRestore();
  });

  it("returns the handleUpload result on success", async () => {
    handleUpload.mockResolvedValueOnce({ type: "blob.generate-client-token" });
    const res = await POST(req({ type: "blob.generate-client-token" }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      type: "blob.generate-client-token",
    });
    expect(handleUpload).toHaveBeenCalled();
  });

  it("restricts allowed content types via onBeforeGenerateToken", async () => {
    handleUpload.mockImplementationOnce(
      async ({ onBeforeGenerateToken }: any) => {
        const cfg = await onBeforeGenerateToken();
        return cfg;
      },
    );
    const res = await POST(req({}));
    const cfg = await res.json();
    expect(cfg.allowedContentTypes).toEqual(
      expect.arrayContaining(["image/png", "video/mp4", "audio/wav"]),
    );
  });

  it("returns 400 with the error message on failure", async () => {
    handleUpload.mockRejectedValueOnce(new Error("bad token"));
    const res = await POST(req({}));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "bad token" });
  });
});
