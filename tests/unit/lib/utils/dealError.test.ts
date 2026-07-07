import { dealErrorByObj, dealErrorText } from "@/lib/utils/dealError";

describe("dealErrorText", () => {
  it("returns the text unchanged when no metadata placeholders", () => {
    expect(dealErrorText("plain text")).toBe("plain text");
  });

  it("substitutes a numbered placeholder from metadata", () => {
    expect(dealErrorText("The user ${0} not exists", { 0: "bob" })).toBe(
      "The user bob not exists",
    );
  });

  it("substitutes a 0 value rather than blanking it", () => {
    expect(dealErrorText("Count ${0}", { 0: 0 })).toBe("Count 0");
  });

  it("blanks a placeholder when metadata value is missing", () => {
    expect(dealErrorText("Value ${1}", { 0: "x" })).toBe("Value ");
  });

  it("returns empty string default when nothing passed", () => {
    expect(dealErrorText()).toBe("");
  });
});

describe("dealErrorByObj", () => {
  it("maps a known reason code to its message", () => {
    expect(dealErrorByObj({ reason: "FORBIDDEN" })).toBe("No permissions");
  });

  it("interpolates metadata into a mapped message", () => {
    expect(
      dealErrorByObj({ reason: "USER_NOT_FOUND", metadata: { 0: "alice" } }),
    ).toBe("The user alice not exists");
  });

  it("falls back to obj.message when reason is unknown", () => {
    expect(dealErrorByObj({ reason: "NOT_A_CODE", message: "custom" })).toBe(
      "custom",
    );
  });

  it("falls back to UNKNOWN_ERROR when neither reason nor message resolve", () => {
    expect(dealErrorByObj({})).toBe("Unknown error");
  });
});
