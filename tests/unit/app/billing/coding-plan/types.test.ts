import {
  getUsageStatus,
  formatDate,
  formatTokens,
} from "@/app/billing/coding-plan/types";

describe("getUsageStatus", () => {
  it("returns warning at 90% and above", () => {
    expect(getUsageStatus(90)).toBe("warning");
    expect(getUsageStatus(100)).toBe("warning");
  });

  it("returns notice between 70% and 90%", () => {
    expect(getUsageStatus(70)).toBe("notice");
    expect(getUsageStatus(89.9)).toBe("notice");
  });

  it("returns safe below 70%", () => {
    expect(getUsageStatus(0)).toBe("safe");
    expect(getUsageStatus(69.9)).toBe("safe");
  });
});

describe("formatDate", () => {
  it("formats a unix timestamp to MM-DD in UTC", () => {
    // 2023-11-14 22:13:20 UTC
    expect(formatDate(1700000000)).toBe("11-14");
  });

  it("zero-pads single-digit months and days", () => {
    // 2021-01-05 UTC
    const ts = Math.floor(Date.UTC(2021, 0, 5) / 1000);
    expect(formatDate(ts)).toBe("01-05");
  });
});

describe("formatTokens", () => {
  it("formats billions with a B suffix", () => {
    expect(formatTokens(2_500_000_000)).toBe("2.5B");
  });

  it("formats millions with an M suffix", () => {
    expect(formatTokens(1_500_000)).toBe("1.5M");
  });

  it("formats thousands with a K suffix", () => {
    expect(formatTokens(1_200)).toBe("1.2K");
  });

  it("returns the raw number string below 1000", () => {
    expect(formatTokens(999)).toBe("999");
    expect(formatTokens(0)).toBe("0");
  });
});
