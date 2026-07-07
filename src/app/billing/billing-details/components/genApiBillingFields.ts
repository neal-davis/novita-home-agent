import { formatDecimalAmount } from "@/lib/utils/money";

type GenApiValue = number | string | null | undefined;
type GenApiBillFields = {
  category?: string;
  billNum?: GenApiValue;
  billNumUnit?: GenApiValue;
  originAmount?: GenApiValue;
  originAmountDecimal?: GenApiValue;
};

const EMPTY_DASH = "-";

const isEmptyOrZero = (val: unknown): boolean => {
  if (val === null || val === undefined || val === "") return true;
  if (typeof val === "number") return val === 0;
  if (typeof val === "string") return val.trim() === "" || Number(val) === 0;
  return false;
};

export const displayOrDash = (val: unknown): string =>
  isEmptyOrZero(val) ? EMPTY_DASH : String(val);

export const moneyOrDash = (val: unknown): string =>
  isEmptyOrZero(val) ? EMPTY_DASH : `$${formatDecimalAmount(val as string)}`;

export const exportMoneyOrDash = (val: unknown): string =>
  isEmptyOrZero(val) ? EMPTY_DASH : String(formatDecimalAmount(val as string));

export const formatGenApiApiKeyUsage = (row: GenApiBillFields) =>
  displayOrDash(row.billNum);

export const formatGenApiApiKeyUsageUnit = (row: GenApiBillFields) =>
  displayOrDash(row.billNumUnit);

export const formatGenApiApiKeyOriginalAmount = (row: GenApiBillFields) =>
  moneyOrDash(row.originAmountDecimal);

export const getGenApiApiKeyExportValues = (row: GenApiBillFields) => ({
  usage: displayOrDash(row.billNum),
  usageUnit: displayOrDash(row.billNumUnit),
  originAmount: exportMoneyOrDash(row.originAmountDecimal),
});
