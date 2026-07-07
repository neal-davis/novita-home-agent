import {
  formatLongContextTag,
  formatModelDate,
  formatTokenWindow,
} from "@/lib/model-library/display-format";

describe("model-library display formatting", () => {
  it("formats token windows with K and M units", () => {
    expect(formatTokenWindow(512)).toBe("512");
    expect(formatTokenWindow(1024)).toBe("1K");
    expect(formatTokenWindow(131072)).toBe("128K");
    expect(formatTokenWindow(1048576)).toBe("1M");
    expect(formatTokenWindow(1572864)).toBe("1.5M");
  });

  it("formats long-context tags from the actual context size", () => {
    expect(formatLongContextTag(131072)).toBe("128K ctx");
    expect(formatLongContextTag(262144)).toBe("256K ctx");
    expect(formatLongContextTag(1048576)).toBe("1M ctx");
    expect(formatLongContextTag(1572864)).toBe("1.5M ctx");
  });

  it("formats model release dates for display", () => {
    expect(formatModelDate("2026-05-13T00:00:00Z")).toBe("May 13 , 2026");
    expect(formatModelDate(1779418569)).toBe("May 22 , 2026");
    expect(formatModelDate("1779418569")).toBe("May 22 , 2026");
    expect(formatModelDate(0)).toBeNull();
    expect(formatModelDate("0")).toBeNull();
    expect(formatModelDate(undefined)).toBeNull();
  });
});
