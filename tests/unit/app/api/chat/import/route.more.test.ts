/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

jest.mock("fs", () => ({ writeFileSync: jest.fn(), unlinkSync: jest.fn() }));
jest.mock("@/app/api/chat/import/character-card-parser", () => ({
  parse: jest.fn(),
}));

const { parse } = require("@/app/api/chat/import/character-card-parser");
const { POST } = require("@/app/api/chat/import/route");

function fileReq(file: any) {
  return {
    formData: jest.fn().mockResolvedValue({ get: () => file }),
  } as any;
}

describe("api/chat/import route — additional branches", () => {
  let consoleError: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    consoleError = jest.spyOn(console, "error").mockImplementation();
  });
  afterEach(() => consoleError.mockRestore());

  it("unwraps a double-nested data field for png cards", async () => {
    parse.mockResolvedValueOnce(
      JSON.stringify({ data: { data: { name: "Deep" } } }),
    );
    const file = {
      type: "image/png",
      name: "deep.png",
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(4)),
    };
    const res = await POST(fileReq(file));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      message: "Parsed successfully!",
      data: { name: "Deep" },
    });
  });

  it("returns a flat json object unchanged when there is no nested data field", async () => {
    const file = {
      type: "application/json",
      text: jest.fn().mockResolvedValue(JSON.stringify({ name: "Flat" })),
    };
    const res = await POST(fileReq(file));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      message: "Parsed successfully!",
      data: { name: "Flat" },
    });
  });
});
