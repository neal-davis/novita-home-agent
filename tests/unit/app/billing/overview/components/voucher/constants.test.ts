import {
  formatUnix,
  daysLeftFromUnix,
  isExpiredUnix,
  formatBusinessTypes,
  ProductMap,
} from "@/app/billing/overview/components/voucher/constants";

describe("formatUnix", () => {
  it("formats a unix timestamp in UTC", () => {
    expect(formatUnix("1700000000")).toBe("2023/11/14 22:13:20");
  });

  it("returns '-' for empty input", () => {
    expect(formatUnix("")).toBe("-");
  });
});

describe("daysLeftFromUnix", () => {
  it("returns 0 for empty input", () => {
    expect(daysLeftFromUnix("")).toBe(0);
  });

  it("returns a positive number for a future expiry", () => {
    const future = String(Math.floor(Date.now() / 1000) + 5 * 86400);
    expect(daysLeftFromUnix(future)).toBeGreaterThan(0);
  });

  it("returns <= 0 for a past expiry", () => {
    const past = String(Math.floor(Date.now() / 1000) - 5 * 86400);
    expect(daysLeftFromUnix(past)).toBeLessThanOrEqual(0);
  });
});

describe("isExpiredUnix", () => {
  it("treats empty input as expired", () => {
    expect(isExpiredUnix("")).toBe(true);
  });

  it("returns true for past timestamps", () => {
    const past = String(Math.floor(Date.now() / 1000) - 86400);
    expect(isExpiredUnix(past)).toBe(true);
  });

  it("returns false for future timestamps", () => {
    const future = String(Math.floor(Date.now() / 1000) + 86400);
    expect(isExpiredUnix(future)).toBe(false);
  });
});

describe("formatBusinessTypes", () => {
  it("maps known types to product labels", () => {
    expect(formatBusinessTypes(["model_api", "all"])).toBe(
      `${ProductMap.model_api}, ${ProductMap.all}`,
    );
  });

  it("falls back to the raw type for unknown types", () => {
    expect(formatBusinessTypes(["unknown_type"])).toBe("unknown_type");
  });

  it("returns an empty string for an empty list", () => {
    expect(formatBusinessTypes([])).toBe("");
  });
});
