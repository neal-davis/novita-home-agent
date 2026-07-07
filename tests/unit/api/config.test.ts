jest.mock("@/constants/urls", () => ({
  STRAPI_BASE_URL: "https://strapi.example.test",
}));

jest.mock("@/api/api", () => ({
  request: jest.fn(),
}));

import { request } from "@/api/api";
import {
  getActivityConfig,
  getAutopaymentConfigInServerEnv,
  getBannerConfigInServerEnv,
  getBuildWithConfigInServerEnv,
  getCampaignConfigInServerEnv,
  getGPUBannerConfigInServerEnv,
  getLLMApiMarkdown,
  getLLMModelReadMeInServerEnv,
  getLLMVendors,
  getLandingPageTemplatesInServerEnv,
  getNoticeConfigInServerEnv,
  getRegistrationCampaignConfigInServerEnv,
  getServerlessAccess,
  getServerlessAccessEmail,
  reportInternalEvent,
  requestInstanceMarkEffect,
  requestServerlessLimitsizeAccess,
  STRAPI_PROXY_URL,
} from "@/api/config";

const mockRequest = request as jest.Mock;
const mockFetch = global.fetch as jest.Mock;
let mockConsoleError: jest.SpyInstance;
let mockConsoleLog: jest.SpyInstance;

function jsonFetchResponse(body: unknown) {
  return {
    json: jest.fn().mockResolvedValue(body),
  };
}

function textFetchResponse(body: string) {
  return {
    text: jest.fn().mockResolvedValue(body),
  };
}

describe("config API helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.mockResolvedValue({ data: [] });
    mockConsoleError = jest.spyOn(console, "error").mockImplementation();
    mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
    mockConsoleLog.mockRestore();
  });

  it("returns the static activity config", async () => {
    await expect(getActivityConfig()).resolves.toEqual({ isOn: true });
  });

  it("maps serverless access records from Strapi attributes", async () => {
    mockRequest.mockResolvedValueOnce({
      data: [{ attributes: { email: "a@example.com" } }, { uuid: "u1" }],
    });

    await expect(
      getServerlessAccessEmail({ email: "a@example.com", uuid: "u1" }),
    ).resolves.toEqual([{ email: "a@example.com" }, { uuid: "u1" }]);
    expect(mockRequest).toHaveBeenCalledWith({
      base_url: "",
      url: `${STRAPI_PROXY_URL}/serverless-accesses?filters[$or][0][uuid][$eq]=u1&filters[$or][1][email][$eq]=a@example.com`,
    });

    mockRequest.mockResolvedValueOnce({
      data: [{ attributes: { mobilePhone: "15500000000" } }],
    });
    await expect(
      getServerlessAccess({ mobilePhone: "15500000000", uuid: "u2" }),
    ).resolves.toEqual([{ mobilePhone: "15500000000" }]);

    mockRequest.mockResolvedValueOnce({
      data: [{ attributes: { maxSize: 10 } }],
    });
    await expect(
      requestServerlessLimitsizeAccess({
        email: "b@example.com",
        uuid: "u3",
      }),
    ).resolves.toEqual([{ maxSize: 10 }]);
  });

  it("returns null for failed request-backed Strapi helpers", async () => {
    mockRequest.mockRejectedValue(new Error("request failed"));

    await expect(
      getServerlessAccessEmail({ email: "a@example.com", uuid: "u1" }),
    ).resolves.toBeNull();
    await expect(requestInstanceMarkEffect()).resolves.toBeNull();
    await expect(getLandingPageTemplatesInServerEnv()).resolves.toBeNull();
  });

  it("maps instance mark effects and landing page templates", async () => {
    mockRequest.mockResolvedValueOnce({
      data: [{ attributes: { mark: "new" } }, { mark: "hot" }],
    });
    await expect(requestInstanceMarkEffect()).resolves.toEqual([
      { mark: "new" },
      { mark: "hot" },
    ]);

    mockRequest.mockResolvedValueOnce({
      data: [{ attributes: { slug: "landing" } }],
    });
    await expect(getLandingPageTemplatesInServerEnv()).resolves.toEqual([
      { slug: "landing" },
    ]);
  });

  it("fetches banner-like Strapi configs and unwraps nested data", async () => {
    mockFetch.mockResolvedValue(
      jsonFetchResponse({ data: { attributes: { data: [1] } } }),
    );

    await expect(getGPUBannerConfigInServerEnv()).resolves.toEqual([1]);
    await expect(getBannerConfigInServerEnv()).resolves.toEqual([1]);
    await expect(getBuildWithConfigInServerEnv()).resolves.toEqual([1]);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://strapi.example.test/gpu-banner-config",
      expect.objectContaining({ next: { revalidate: 10 } }),
    );
  });

  it("returns fallback values when fetch-backed config calls fail", async () => {
    mockFetch.mockRejectedValue(new Error("fetch failed"));

    await expect(getGPUBannerConfigInServerEnv()).resolves.toEqual([]);
    await expect(getBannerConfigInServerEnv()).resolves.toEqual([]);
    await expect(getBuildWithConfigInServerEnv()).resolves.toEqual([]);
    await expect(getCampaignConfigInServerEnv()).resolves.toEqual({});
    await expect(getNoticeConfigInServerEnv(0)).resolves.toEqual({});
    await expect(getLLMModelReadMeInServerEnv("model-a")).resolves.toEqual([]);
    await expect(getLLMVendors()).resolves.toEqual([]);
    await expect(getAutopaymentConfigInServerEnv()).resolves.toEqual({});
  });

  it("fetches campaign, notice and autopayment config payloads", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonFetchResponse({ data: { attributes: { data: { enabled: true } } } }),
    );
    await expect(getCampaignConfigInServerEnv()).resolves.toEqual({
      enabled: true,
    });

    mockFetch.mockResolvedValueOnce(
      jsonFetchResponse({
        data: {
          attributes: {
            content: "notice",
            updatedAt: "2024-01-02T00:00:00.000Z",
          },
        },
      }),
    );
    await expect(getNoticeConfigInServerEnv(0)).resolves.toMatchObject({
      content: "notice",
    });

    mockFetch.mockResolvedValueOnce(
      jsonFetchResponse({
        data: {
          attributes: {
            content: "hidden",
            updatedAt: "2024-01-01T00:00:00.000Z",
          },
        },
      }),
    );
    await expect(
      getNoticeConfigInServerEnv(
        new Date("2024-01-02T00:00:00.000Z").getTime(),
      ),
    ).resolves.toEqual({
      content: "",
      name: "",
      show: false,
      url: "",
    });

    mockFetch.mockResolvedValueOnce(
      jsonFetchResponse({
        data: { attributes: { config: { card: { max_amount: 100 } } } },
      }),
    );
    await expect(getAutopaymentConfigInServerEnv()).resolves.toEqual({
      card: { max_amount: 100 },
    });
  });

  it("fetches readmes, markdown snippets and public vendors", async () => {
    mockFetch.mockResolvedValueOnce(
      jsonFetchResponse({
        data: [{ attributes: { body: "# Model" } }, { body: "fallback" }],
      }),
    );
    await expect(getLLMModelReadMeInServerEnv("model-a")).resolves.toEqual([
      { body: "# Model" },
      { body: "fallback" },
    ]);
    expect(mockFetch).toHaveBeenLastCalledWith(
      "https://strapi.example.test/llm-model-readmes?filters[modelId][$contains]=model-a",
    );

    mockFetch
      .mockResolvedValueOnce(textFetchResponse("http"))
      .mockResolvedValueOnce(textFetchResponse("node"))
      .mockResolvedValueOnce(textFetchResponse("python"));
    await expect(getLLMApiMarkdown()).resolves.toEqual([
      "http",
      "node",
      "python",
    ]);

    mockFetch.mockResolvedValueOnce(
      jsonFetchResponse({
        data: [
          { attributes: { icon: "a.svg", name: "A", value: "a" } },
          { attributes: { internal: true, name: "Internal", value: "i" } },
          { icon: null, name: "B", value: "b" },
        ],
      }),
    );
    await expect(getLLMVendors()).resolves.toEqual([
      { icon: "a.svg", name: "A", value: "a" },
      { icon: null, name: "B", value: "b" },
    ]);
  });

  it("returns registration configs and reports internal events", async () => {
    mockRequest.mockResolvedValueOnce({ configs: [{ percent: 10 }] });
    await expect(getRegistrationCampaignConfigInServerEnv()).resolves.toEqual([
      { percent: 10 },
    ]);

    mockRequest.mockRejectedValueOnce(new Error("request failed"));
    await expect(getRegistrationCampaignConfigInServerEnv()).resolves.toEqual(
      [],
    );

    reportInternalEvent({ action: "LOGIN", uid: "user-1" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      base_url: "",
      data: { action: "LOGIN", uid: "user-1" },
      method: "POST",
      url: "/api/report",
    });
  });
});
