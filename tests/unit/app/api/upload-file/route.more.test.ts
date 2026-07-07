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

describe("api/upload-file route — additional branches", () => {
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

  it("invokes the onUploadCompleted callback which logs the blob url", async () => {
    handleUpload.mockImplementationOnce(async ({ onUploadCompleted }: any) => {
      await onUploadCompleted({ blob: { url: "https://blob.example/x.png" } });
      return { done: true };
    });
    const res = await POST(req({ type: "blob.upload-completed" }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ done: true });
    expect(consoleLog).toHaveBeenCalledWith(
      "Upload completed:",
      "https://blob.example/x.png",
    );
  });
});
