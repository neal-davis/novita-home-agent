import Big from "big.js";

/**
 * Format price with "/ M Tokens" suffix
 * @param price - Price in the original unit
 * @returns Formatted price string like "$0.03 / M Tokens"
 */
export const formatPrice = (price: number): string => {
  return `$${Big(price || 0)
    .div(10000)
    .toString()} / M Tokens`;
};

/**
 * Format price for table display (without suffix)
 * @param price - Price in the original unit
 * @returns Formatted price string like "$0.03"
 */
export const formatTablePrice = (price: number): string => {
  return `$${Big(price || 0)
    .div(10000)
    .toString()}`;
};

/**
 * Format token range for display
 * @param min - Minimum tokens
 * @param max - Maximum tokens
 * @returns Formatted range string like "0 <tokens <=8192" or "8192<tokens <=65536"
 */
export const formatTokenRange = (min: number, max: number): string => {
  if (min === 0 || min === 1) {
    return `1 <= tokens < ${max ? max.toLocaleString() : "∞"}`;
  }
  return `${min.toLocaleString()} <= tokens < ${max ? max.toLocaleString() : "∞"}`;
};
