/* eslint-disable @typescript-eslint/no-var-requires */
const { TextDecoder, TextEncoder } = require("util");
Object.assign(global, { TextDecoder, TextEncoder });
const { Headers, Request, Response } = require("undici");
Object.assign(global, { Headers, Request, Response });

const { POST } = require("@/app/api/report/route");

const mockFetch = global.fetch as jest.Mock;

function jsonReq(body: any) {
  return { json: jest.fn().mockResolvedValue(body) } as unknown as Request;
}

describe("api/report route", () => {
  beforeEach(() => jest.clearAllMocks());

  it("forwards uid+action to the reporter endpoint", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    const res = await POST(jsonReq({ uid: "42", action: "click" }));
    expect(res.status).toBe(200);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://nestjs-service.vercel.app/reporter",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toEqual({ uid: 42, action: "click" });
  });

  it("skips reporting when uid or action missing", async () => {
    const res = await POST(jsonReq({ uid: "", action: "" }));
    expect(res.status).toBe(200);
    expect(mockFetch).not.toHaveBeenCalled();
    await expect(res.json()).resolves.toEqual({});
  });

  it("swallows fetch errors and still returns ok", async () => {
    mockFetch.mockRejectedValueOnce(new Error("boom"));
    const res = await POST(jsonReq({ uid: "1", action: "view" }));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({});
  });
});
