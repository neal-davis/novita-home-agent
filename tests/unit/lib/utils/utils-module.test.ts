jest.mock("js-cookie", () => ({
  get: jest.fn(),
}));

jest.mock("@/components/ui/standard/notify", () => ({
  message: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

import Cookies from "js-cookie";
import { message } from "@/components/ui/standard/notify";
import {
  checkEnvs,
  checkHttpTcpPortSame,
  checkPorts,
  copyText,
  dealParamsText,
  extractDomain,
  generateRandomString,
  getStorageWithExpiry,
  getUserCollect,
  matchLogoForTemplate,
  mobileCheck,
  setStorageWithExpiry,
  useSourceCollect,
} from "@/lib/utils/utils";

const mockCookieGet = Cookies.get as jest.Mock;
const mockMessage = message as unknown as {
  error: jest.Mock;
  success: jest.Mock;
};

describe("utils module validation helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("detects mobile devices from viewport width and user agent", () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 390,
    });
    expect(mobileCheck()).toBe(true);

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1280,
    });
    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    });
    expect(mobileCheck()).toBe(true);

    Object.defineProperty(window.navigator, "userAgent", {
      configurable: true,
      value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    });
    expect(mobileCheck()).toBe(false);
  });

  it("validates exposed ports and env keys", () => {
    expect(checkPorts(["", "  ", "80", "443"])).toEqual(["", [80, 443]]);
    expect(checkPorts(["abc"])).toEqual([
      "Please enter valid port, split with [,] port can be 1 to 65535",
    ]);
    expect(checkPorts(["0"])).toEqual([
      "Please enter valid port, split with [,] port can be 1 to 65535",
    ]);
    expect(checkPorts(["2222"])).toEqual(["Port can not be 2222, 2223, 2224"]);
    expect(checkPorts(["8080", "8080"])).toEqual([
      "Exposed ports cannot be same.",
    ]);

    expect(checkEnvs([{ key: "TOKEN" }])).toBe("");
    expect(checkEnvs([{ key: " " }])).toBe("Key can not be empty");
    expect(checkHttpTcpPortSame([], ["80"])).toBe("");
    expect(checkHttpTcpPortSame(["80"], ["80"])).toBe("");
    expect(
      checkHttpTcpPortSame(
        Array.from({ length: 13 }, (_, index) => `${index + 1000}`),
        Array.from({ length: 13 }, (_, index) => `${index + 2000}`),
      ),
    ).toBe("Exposed http ports and tcp ports cannot be more than 25.");
  });

  it("generates strings and extracts domains", () => {
    expect(generateRandomString(16)).toMatch(/^[A-Za-z0-9]{16}$/);
    expect(extractDomain("https://www.example.com/path?q=1")).toBe(
      "example.com",
    );
    expect(extractDomain("api.example.com/v1")).toBe("api.example.com");
  });

  it("collects attribution data from localStorage and cookies", () => {
    localStorage.setItem("utm_id", "campaign-1");
    localStorage.setItem("utm_campaign", "spring");
    localStorage.setItem("utm_medium", "email");
    localStorage.setItem("ref", "affiliate");
    localStorage.setItem("source", "newsletter");
    mockCookieGet.mockImplementation(
      (key: string) =>
        ({
          share_sharer_uuid: "sharer-1",
          share_template_id: "template-1",
        })[key],
    );

    expect(getUserCollect()).toMatchObject({
      campaignId: "campaign-1",
      campaignName: "spring",
      medium: "email",
      ref: "affiliate",
      source: "newsletter",
      sharer: "sharer-1",
      templateId: "template-1",
    });

    useSourceCollect({
      source: "paid",
      tags: ["gpu", "llm"],
    });

    expect(localStorage.getItem("source")).toBe("paid");
    expect(localStorage.getItem("tags")).toBe("gpu,llm");
    expect(JSON.parse(localStorage.getItem("collect") || "{}")).toEqual({
      source: "paid",
      tags: ["gpu", "llm"],
    });
  });

  it("stores values with expiry and drops expired or malformed entries", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    setStorageWithExpiry("token", { value: "abc" }, 1000);

    expect(getStorageWithExpiry("token")).toEqual({ value: "abc" });

    jest.setSystemTime(new Date("2026-01-01T00:00:02Z"));
    expect(getStorageWithExpiry("token")).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();

    localStorage.setItem("bad-json", "{");
    expect(getStorageWithExpiry("bad-json")).toBeNull();
    jest.useRealTimers();
  });

  it("formats metadata placeholders and maps template logos", () => {
    expect(dealParamsText("GPU ${0} in ${1}; ${2}", { 0: 8, 1: "us" })).toBe(
      "GPU 8 in us; ",
    );
    expect(dealParamsText("plain")).toBe("plain");

    expect(matchLogoForTemplate("https://cdn.test/logo.svg", "image")).toBe(
      "https://cdn.test/logo.svg",
    );
    expect(matchLogoForTemplate("docker", "ubuntu")).toBe(
      "/gpu-instance/imageMarks/docker.svg",
    );
    expect(matchLogoForTemplate("", "my-pytorch-image")).toBe(
      "/gpu-instance/imageMarks/pytorch.svg",
    );
    expect(matchLogoForTemplate("", "custom-image")).toBe(
      "/gpu-instance/imageMarks/novita.svg",
    );
  });

  it("reports copy success and failures", async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText,
      },
    });

    copyText("hello");
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledWith("hello");
    expect(mockMessage.success).toHaveBeenCalledWith("Copy success");

    writeText.mockRejectedValueOnce(new Error("denied"));
    copyText("blocked");
    await Promise.resolve();
    await Promise.resolve();
    expect(mockMessage.error).toHaveBeenCalledWith("Copy failed");

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      get() {
        throw new Error("missing");
      },
    });
    copyText("throws");
    expect(mockMessage.error).toHaveBeenCalledWith("Copy failed");
  });
});
