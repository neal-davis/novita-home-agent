import {
  getSearchParam,
  isMainEnvironmentOrigin,
  isTestEnvironmentOrigin,
  isUnifiedAuthRelayOrigin,
  isWhitelistedRedirectUrl,
  makeDocsHref,
  pathFormat,
} from "@/lib/utils/url";

describe("url utilities", () => {
  it("formats paths and reads query params", () => {
    window.history.pushState({}, "", "/?token=abc&empty=");

    expect(pathFormat("/models/image/edit")).toBe("-models-image-edit");
    expect(getSearchParam("token")).toBe("abc");
    expect(getSearchParam("missing")).toBeNull();
  });

  it.each([
    ["/docs/sandbox", "https://novita.ai/docs/sandbox"],
    ["docs/sandbox", "https://novita.ai/docs/sandbox"],
    ["https://docs.example.com/page", "https://docs.example.com/page"],
  ])("builds docs href for %p", (input, expected) => {
    expect(makeDocsHref(input)).toBe(expected);
  });

  it.each([
    ["https://dev.novita.ai", true],
    ["https://novita-home-git-feature-novita-ai.vercel.app", true],
    ["not a url", false],
  ])("detects unified auth relay origin %p", (origin, expected) => {
    expect(isUnifiedAuthRelayOrigin(origin)).toBe(expected);
  });

  it.each([
    ["https://novita.ai", true],
    ["https://novita-home-git-stage-novita-ai.vercel.app", true],
    ["https://dev.novita.ai", false],
    ["bad", false],
  ])("detects main environment origin %p", (origin, expected) => {
    expect(isMainEnvironmentOrigin(origin)).toBe(expected);
  });

  it.each([
    ["https://dev.novita.ai", true],
    ["https://novita-home-git-feature-novita-ai.vercel.app", true],
    ["https://novita.ai", false],
    ["bad", false],
  ])("detects test environment origin %p", (origin, expected) => {
    expect(isTestEnvironmentOrigin(origin)).toBe(expected);
  });

  it.each([
    ["https://novita.ai/oauth/callback", true],
    ["https://sub.novita.ai/path", true],
    ["https://evil.example/path", false],
    ["bad", false],
  ])("checks redirect whitelist for %p", (url, expected) => {
    expect(isWhitelistedRedirectUrl(url)).toBe(expected);
  });
});
