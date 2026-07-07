import { getUrlParams } from "@/app/gpus-console/explore/components/dealUrlParams";

describe("getUrlParams", () => {
  const originalLocation = window.location;

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  function setHref(href: string) {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href },
    });
  }

  it("returns decoded query values from the current URL", () => {
    setHref(
      "https://novita.ai/gpus-console/explore?productId=prod%201&clusterId=cluster-a",
    );

    expect(getUrlParams("productId")).toBe("prod 1");
    expect(getUrlParams("clusterId")).toBe("cluster-a");
  });

  it("returns an empty string when the URL has no matching query value", () => {
    setHref("https://novita.ai/gpus-console/explore?spot=true");

    expect(getUrlParams("productId")).toBe("");
    expect(getUrlParams("spot")).toBe("true");
  });

  it("ignores URLs without a query string", () => {
    setHref("https://novita.ai/gpus-console/explore");

    expect(getUrlParams("productId")).toBe("");
  });
});
