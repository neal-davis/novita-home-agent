import Big from "big.js";
import { reportError } from "@/lib/utils/reporter";

// for modelAPI
export function dealMoney(originPrice = 0, accuracy = 2, type?: string) {
  if (type === "ceil") {
    return (
      Math.ceil((originPrice / 100000) * Math.pow(10, accuracy)) /
      Math.pow(10, accuracy)
    );
  } else {
    return (
      Math.round((originPrice / 100000) * Math.pow(10, accuracy)) /
      Math.pow(10, accuracy)
    );
  }
}

// for modelAPI
export const balanceFormat = (v: number | string) => {
  const points = Number(v);
  return points === 0 ? 0 : (points / 10000).toFixed(4);
};

export const formatMonthlyBillAmount = (value: number | string) => {
  try {
    const amount = Big(value || 0).div(10000);
    const trimmed = amount.toFixed(12).replace(/\.?0+$/, "");
    const [integerPart, decimalPart = ""] = trimmed.split(".");

    if (decimalPart.length === 0) {
      return `${integerPart}.00`;
    }
    if (decimalPart.length === 1) {
      return `${integerPart}.${decimalPart}0`;
    }
    return trimmed;
  } catch (error) {
    reportError({
      errorNo: "format_monthly_bill_amount_error",
      errorInfo: `value: ${value}, error: ${error}`,
      level: 0,
      type: "other",
    });
    return "0.00";
  }
};

export const formatDecimalAmount = (value?: string | number | null): string => {
  // Bill detail decimal amounts are already Yuan strings from the backend.
  if (value === null || value === undefined || value === "") {
    return "0.00";
  }
  if (typeof value === "string") {
    const normalized = value.trim();
    if (normalized === "") {
      return "0.00";
    }
    const [integerPart, decimalPart = ""] = normalized.split(".");
    if (decimalPart.length === 0) {
      return `${integerPart}.00`;
    }
    if (decimalPart.length === 1) {
      return `${integerPart}.${decimalPart}0`;
    }
    return normalized;
  }
  return formatBillingDisplayAmount(value);
};

const formatBillingDisplayAmount = (value: string | number | Big) => {
  const amount = Big(value || 0);
  const fixed = amount.toFixed();
  const trimmed = fixed.includes(".") ? fixed.replace(/\.?0+$/, "") : fixed;
  const [integerPart, decimalPart = ""] = trimmed.split(".");

  if (decimalPart.length === 0) {
    return `${integerPart}.00`;
  }
  if (decimalPart.length === 1) {
    return `${integerPart}.${decimalPart}0`;
  }
  return trimmed;
};

export const formatLegacyBillingAmount = (value: number | string): string => {
  try {
    return formatBillingDisplayAmount(Big(value || 0).div(10000));
  } catch (error) {
    reportError({
      errorNo: "format_legacy_billing_amount_error",
      errorInfo: `value: ${value}, error: ${error}`,
      level: 0,
      type: "other",
    });
    return "0.00";
  }
};

export const formatBillingPrice = (
  price: number | string,
  pricePrecision?: number | string,
): string => {
  try {
    return formatBillingDisplayAmount(
      Big(price || 0)
        .div(pricePrecision || 1)
        .div(10000),
    );
  } catch (error) {
    reportError({
      errorNo: "format_billing_price_error",
      errorInfo: `price: ${price}, pricePrecision: ${pricePrecision}, error: ${error}`,
      level: 0,
      type: "other",
    });
    return "0.00";
  }
};

export const balanceFormatReal = (v: number | string) => {
  return v ? Big(v).div(10000).toNumber() : 0;
};

export const formatBudgetAmountFromMinor = (v: number | string) => {
  try {
    return new Big(v || 0).div(10000).round(2, 0).toFixed(2);
  } catch {
    return "0.00";
  }
};

export const budgetAmountToMinor = (v: number | string) => {
  try {
    return new Big(v || 0).round(2, 0).times(10000).round(0, 0).toNumber();
  } catch {
    return 0;
  }
};

export const normalizeBudgetAmountInput = (value: string) => {
  const normalized = value.replace(/[^\d.]/g, "");
  const [integerPart = "", ...decimalParts] = normalized.split(".");
  const decimalPart = decimalParts.join("").slice(0, 2);
  return normalized.includes(".")
    ? `${integerPart}.${decimalPart}`
    : integerPart;
};

export const dealGPUMoney = (price: number) => {
  return Math.round((price / 100000) * Math.pow(10, 2)) / Math.pow(10, 2);
};

// Using price precision calculation according to the new discount system
export const dealMoneyWithPrecision = (
  price: number,
  precision: number,
  accuracy?: number,
) => {
  try {
    const result = new Big(price).div(10000).div(precision);
    if (accuracy) {
      return result.round(accuracy).toNumber();
    }
    return result.toNumber();
  } catch (error) {
    reportError({
      errorNo: "deal_money_with_precision_error",
      errorInfo: `price: ${price}, precision: ${precision}, accuracy: ${accuracy}, error: ${error}`,
      level: 0,
      type: "other",
    });
    return "-";
  }
};
// example:
// input: 3000 , output: 3,000
export const formatMoneyDisplay = (money: number | string) => {
  if (typeof money === "string") {
    const parsedMoney = Number(money);
    if (isNaN(parsedMoney)) {
      return money;
    }
    money = parsedMoney;
  }
  try {
    const bigMoney = new Big(money);
    // Get decimal places, minimum 2
    const decimalPlaces = Math.max(2, bigMoney.c.length - bigMoney.e - 1);
    return bigMoney.toFixed(decimalPlaces).toLocaleString();
  } catch (error) {
    reportError({
      errorNo: "format_money_display_error",
      errorInfo: `money: ${money}, error: ${error}`,
      level: 0,
      type: "other",
    });
    return String(money);
  }
};
