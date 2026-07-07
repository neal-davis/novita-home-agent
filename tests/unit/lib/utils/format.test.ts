import { formatTokens } from "@/lib/utils/format";

describe("formatTokens", () => {
  it.each([
    [0, "0"],
    [999, "999"],
    [1200, "1,200"],
    [1_000_000, "1M"],
    [1_250_000, "1.3M"],
    [1_000_000_000, "1B"],
    [1_250_000_000, "1.3B"],
    ["2500", "2,500"],
    ["not-a-number", "not-a-number"],
  ])("formats %p as %p", (input, expected) => {
    expect(formatTokens(input)).toBe(expected);
  });
});
