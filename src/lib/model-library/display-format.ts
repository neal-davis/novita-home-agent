const TOKENS_PER_K = 1024;
const TOKENS_PER_M = TOKENS_PER_K * TOKENS_PER_K;

export function formatTokenWindow(value?: number | string | null): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return "-";
  }

  if (numericValue >= TOKENS_PER_M) {
    const millions = numericValue / TOKENS_PER_M;
    const formatted = Number.isInteger(millions)
      ? String(millions)
      : millions.toFixed(1).replace(/\.0$/, "");
    return `${formatted}M`;
  }

  if (numericValue >= TOKENS_PER_K) {
    return `${Math.round(numericValue / TOKENS_PER_K)}K`;
  }

  return String(Math.round(numericValue));
}

export function formatLongContextTag(value?: number | string | null): string {
  const formatted = formatTokenWindow(value);
  return formatted === "-" ? "Long context" : `${formatted} ctx`;
}

export function formatModelDate(value?: string | number | null): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const numericValue = Number(value);
  if (Number.isFinite(numericValue) && numericValue <= 0) {
    return null;
  }

  const date =
    Number.isFinite(numericValue) && String(value).trim() !== ""
      ? new Date(
          numericValue < 10_000_000_000 ? numericValue * 1000 : numericValue,
        )
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .replace(",", " ,");
}
