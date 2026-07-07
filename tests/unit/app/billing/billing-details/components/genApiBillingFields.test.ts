import {
  displayOrDash,
  exportMoneyOrDash,
  formatGenApiApiKeyOriginalAmount,
  formatGenApiApiKeyUsage,
  formatGenApiApiKeyUsageUnit,
  getGenApiApiKeyExportValues,
  moneyOrDash,
} from "@/app/billing/billing-details/components/genApiBillingFields";

describe("gen api billing fields", () => {
  it.each([0, "0", "", "  ", null, undefined])(
    "renders empty or zero-like value %p as dash",
    (value) => {
      expect(displayOrDash(value)).toBe("-");
      expect(moneyOrDash(value)).toBe("-");
      expect(exportMoneyOrDash(value)).toBe("-");
    },
  );

  it("keeps non-empty usage values and formats amounts", () => {
    expect(displayOrDash(12)).toBe("12");
    expect(displayOrDash("unit")).toBe("unit");
    expect(moneyOrDash("12.500000000001")).toBe("$12.500000000001");
    expect(exportMoneyOrDash("12.500000000001")).toBe("12.500000000001");
  });

  it("renders API Key summary fields whenever values are present", () => {
    expect(formatGenApiApiKeyUsage({ category: "gen_api", billNum: 12 })).toBe(
      "12",
    );
    expect(
      formatGenApiApiKeyUsageUnit({
        category: "gen_api",
        billNumUnit: "unit",
      }),
    ).toBe("unit");
    expect(
      formatGenApiApiKeyOriginalAmount({
        category: "gen_api",
        originAmountDecimal: "12.500000000001",
      }),
    ).toBe("$12.500000000001");
    expect(formatGenApiApiKeyUsage({ category: "llm", billNum: 12 })).toBe(
      "12",
    );
    expect(
      formatGenApiApiKeyUsageUnit({
        category: "llm",
        billNumUnit: "tokens",
      }),
    ).toBe("tokens");
    expect(
      formatGenApiApiKeyOriginalAmount({
        category: "llm",
        originAmountDecimal: "12.500000000001",
      }),
    ).toBe("$12.500000000001");
  });

  it("builds API Key export values whenever values are present", () => {
    expect(
      getGenApiApiKeyExportValues({
        category: "gen_api",
        billNum: 12,
        billNumUnit: "unit",
        originAmountDecimal: "12.500000000001",
      }),
    ).toEqual({
      usage: "12",
      usageUnit: "unit",
      originAmount: "12.500000000001",
    });
    expect(
      getGenApiApiKeyExportValues({
        category: "llm",
        billNum: 12,
        billNumUnit: "tokens",
        originAmountDecimal: "12.500000000001",
      }),
    ).toEqual({
      usage: "12",
      usageUnit: "tokens",
      originAmount: "12.500000000001",
    });
  });
});
