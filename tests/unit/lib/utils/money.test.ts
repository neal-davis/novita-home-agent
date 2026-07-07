jest.mock("../../../../src/lib/utils/reporter", () => ({
  reportError: jest.fn(),
}));

import {
  balanceFormat,
  balanceFormatReal,
  dealGPUMoney,
  dealMoney,
  dealMoneyWithPrecision,
  formatMoneyDisplay,
  formatBillingPrice,
  formatDecimalAmount,
  formatLegacyBillingAmount,
  formatMonthlyBillAmount,
} from "../../../../src/lib/utils/money";
import { reportError } from "../../../../src/lib/utils/reporter";

const mockReportError = reportError as jest.Mock;

describe("money utilities", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("formats raw model and GPU prices using expected precision rules", () => {
    expect(dealMoney(123456, 2)).toBe(1.23);
    expect(dealMoney(123451, 2, "ceil")).toBe(1.24);
    expect(dealMoney(1, 5)).toBe(0.00001);
    expect(dealGPUMoney(123456)).toBe(1.23);
  });

  it("formats balances from point values", () => {
    expect(balanceFormat(0)).toBe(0);
    expect(balanceFormat("12345")).toBe("1.2345");
    expect(balanceFormatReal("25000")).toBe(2.5);
    expect(balanceFormatReal("")).toBe(0);
  });

  it("formats monthly bill amounts", () => {
    expect(formatMonthlyBillAmount(11000)).toBe("1.10");
    expect(formatMonthlyBillAmount(10000)).toBe("1.00");
    expect(formatMonthlyBillAmount(11100)).toBe("1.11");
    expect(formatMonthlyBillAmount(12220)).toBe("1.222");
    expect(formatMonthlyBillAmount(13333)).toBe("1.3333");
    expect(formatMonthlyBillAmount(0)).toBe("0.00");
    expect(formatMonthlyBillAmount("11000")).toBe("1.10");
  });

  it("formats decimal bill amounts with at least two decimal places", () => {
    expect(formatDecimalAmount("1.1")).toBe("1.10");
    expect(formatDecimalAmount("1.11")).toBe("1.11");
    expect(formatDecimalAmount("1.123")).toBe("1.123");
    expect(formatDecimalAmount("10.0000")).toBe("10.0000");
    expect(formatDecimalAmount("1.23400")).toBe("1.23400");
    expect(formatDecimalAmount(0)).toBe("0.00");
  });

  it("formats legacy bill amounts after point conversion", () => {
    expect(formatLegacyBillingAmount(10000)).toBe("1.00");
    expect(formatLegacyBillingAmount(11000)).toBe("1.10");
    expect(formatLegacyBillingAmount(11200)).toBe("1.12");
    expect(formatLegacyBillingAmount(12340)).toBe("1.234");
    expect(formatLegacyBillingAmount("12340")).toBe("1.234");
  });

  it("formats precision-based billing prices", () => {
    expect(formatBillingPrice(10000, 1)).toBe("1.00");
    expect(formatBillingPrice(11000, 1)).toBe("1.10");
    expect(formatBillingPrice(11200, 1)).toBe("1.12");
    expect(formatBillingPrice(12340, 1)).toBe("1.234");
    expect(formatBillingPrice(1234000, 100)).toBe("1.234");
  });

  it("calculates precision-based prices and reports invalid inputs", () => {
    expect(dealMoneyWithPrecision(12345, 100, 3)).toBe(0.012);
    expect(dealMoneyWithPrecision(10000, 4)).toBe(0.25);

    expect(dealMoneyWithPrecision(10000, 0)).toBe("-");
    expect(mockReportError).toHaveBeenCalledWith(
      expect.objectContaining({
        errorNo: "deal_money_with_precision_error",
        type: "other",
      }),
    );
  });

  it("keeps nonnumeric string labels and reports unformattable values", () => {
    expect(formatMoneyDisplay("not-a-number")).toBe("not-a-number");
    expect(formatMoneyDisplay(3000)).toBe("3000.00");
    expect(formatMoneyDisplay("12.345")).toBe("12.345");
    expect(formatMoneyDisplay("")).toBe("0.00");

    expect(formatMoneyDisplay(undefined as unknown as number)).toBe(
      "undefined",
    );
    expect(mockReportError).toHaveBeenCalledWith(
      expect.objectContaining({
        errorNo: "format_money_display_error",
        type: "other",
      }),
    );
  });
});
