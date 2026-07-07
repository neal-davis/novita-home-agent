jest.mock("@/constants/urls", () => ({
  STRAPI_BASE_URL: "https://strapi.example.test",
}));

const mockRequest = jest.fn();
jest.mock("@/api/api", () => ({
  request: (...a: unknown[]) => mockRequest(...a),
}));

import {
  getGPUBannerConfigInServerEnv,
  getNoticeConfigInServerEnv,
  getServerlessAccess,
  getServerlessAccessEmail,
  requestInstanceMarkEffect,
  requestServerlessLimitsizeAccess,
} from "@/api/config";

describe("config Strapi proxy helpers (request-backed)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("maps serverless-access attributes and falls back to the item", async () => {
    mockRequest.mockResolvedValue({
      data: [{ attributes: { a: 1 } }, { b: 2 }],
    });
    const res = await getServerlessAccessEmail({ email: "e", uuid: "u" });
    expect(res).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it("returns null when serverless-access request fails", async () => {
    mockRequest.mockRejectedValue(new Error("x"));
    await expect(
      getServerlessAccessEmail({ email: "e", uuid: "u" }),
    ).resolves.toBeNull();
  });

  it("maps instance-mark-effects and limitsize/access helpers", async () => {
    mockRequest.mockResolvedValue({ data: [{ attributes: { ok: true } }] });
    await expect(requestInstanceMarkEffect()).resolves.toEqual([{ ok: true }]);
    await expect(
      requestServerlessLimitsizeAccess({ email: "e", uuid: "u" }),
    ).resolves.toEqual([{ ok: true }]);
    await expect(
      getServerlessAccess({ mobilePhone: "m", uuid: "u" }),
    ).resolves.toBeDefined();
  });

  it("returns null on instance-mark-effects failure", async () => {
    mockRequest.mockRejectedValue(new Error("x"));
    await expect(requestInstanceMarkEffect()).resolves.toBeNull();
  });
});

describe("config fetch-backed helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  it("getGPUBannerConfigInServerEnv unwraps nested data", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ data: { attributes: { data: [1, 2] } } }),
    });
    await expect(getGPUBannerConfigInServerEnv()).resolves.toEqual([1, 2]);
  });

  it("getGPUBannerConfigInServerEnv returns [] on error", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("net"));
    await expect(getGPUBannerConfigInServerEnv()).resolves.toEqual([]);
  });

  it("hides the notice when its updatedAt is at or before the hide time", async () => {
    const updatedAt = "2020-01-01T00:00:00Z";
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ data: { attributes: { updatedAt, show: true } } }),
    });
    const hideTime = new Date("2021-01-01T00:00:00Z").getTime();
    await expect(getNoticeConfigInServerEnv(hideTime)).resolves.toEqual({
      show: false,
      name: "",
      content: "",
      url: "",
    });
  });

  it("returns the notice when its updatedAt is after the hide time", async () => {
    const updatedAt = "2022-01-01T00:00:00Z";
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => ({ data: { attributes: { updatedAt, show: true } } }),
    });
    const hideTime = new Date("2021-01-01T00:00:00Z").getTime();
    const res = await getNoticeConfigInServerEnv(hideTime);
    expect(res.show).toBe(true);
  });
});
