export function formatTokens(value: number | string): string {
  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return String(value);

  if (num >= 1_000_000_000) {
    const wan = num / 1_000_000_000;
    return Number.isInteger(wan) ? `${wan}B` : `${wan.toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    const yi = num / 1_000_000;
    return Number.isInteger(yi) ? `${yi}M` : `${yi.toFixed(1)}M`;
  }
  return num.toLocaleString("en-US");
}
