/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

jest.mock("fs", () => ({ writeFileSync: jest.fn(), unlinkSync: jest.fn() }));
jest.mock("@/app/api/chat/import/character-card-parser", () => ({
  parse: jest.fn(),
}));

const fs = require("fs");
const { parse } = require("@/app/api/chat/import/character-card-parser");
const { POST } = require("@/app/api/chat/import/route");

function fileReq(file: any) {
  return {
    formData: jest.fn().mockResolvedValue({ get: () => file }),
  } as any;
}

describe("api/chat/import route", () => {
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleError = jest.spyOn(console, "error").mockImplementation();
  });
  afterEach(() => consoleError.mockRestore());

  it("errors when no file is uploaded", async () => {
    const res = await POST(fileReq(null));
    // NextResponse.error() returns a network-error sentinel (status 0) and not 200
    expect(res.status).not.toBe(200);
  });

  it("parses a json file and unwraps nested data", async () => {
    const file = {
      type: "application/json",
      text: jest
        .fn()
        .mockResolvedValue(JSON.stringify({ data: { name: "Bob" } })),
    };
    const res = await POST(fileReq(file));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      message: "Parsed successfully!",
      data: { name: "Bob" },
    });
  });

  it("parses a png file via the character-card parser", async () => {
    parse.mockResolvedValueOnce(JSON.stringify({ data: { name: "Img" } }));
    const file = {
      type: "image/png",
      name: "card.png",
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(4)),
    };
    const res = await POST(fileReq(file));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      message: "Parsed successfully!",
      data: { name: "Img" },
    });
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(fs.unlinkSync).toHaveBeenCalled();
  });

  it("returns 500 when png parsing throws", async () => {
    parse.mockRejectedValueOnce(new Error("bad png"));
    const file = {
      type: "image/png",
      name: "bad.png",
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(4)),
    };
    const res = await POST(fileReq(file));
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      message: "Failed to parse image",
      error: "bad png",
    });
    expect(fs.unlinkSync).toHaveBeenCalled();
  });

  it("errors on an unsupported file type", async () => {
    const res = await POST(fileReq({ type: "text/plain" }));
    expect(res.status).not.toBe(200);
  });
});
