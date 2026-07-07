/**
 * Process valueTransform string into function
 * Backend returns valueTransform as string; it needs to be converted to a function
 */

import { DynamicModelConfig } from "@/types/dynamic-pricing";

type ColumnValueDeriverContext = {
  skuCode?: string | null;
  params: Record<string, unknown>;
  row: Record<string, unknown>;
  celExpr?: string;
};
type ParsedValueTransform = (value: unknown) => unknown;
type ParsedColumnValueDeriver = (ctx: ColumnValueDeriverContext) => unknown;

/**
 * Convert function string into an actual function
 * Example: "(value) => (value ? 'Fast mode' : 'Standard mode')" -> actual function
 */
function parseFunctionString(
  fnStr: string | undefined,
): ((...args: unknown[]) => unknown) | undefined {
  if (!fnStr || typeof fnStr !== "string") return undefined;

  try {
    // Use Function constructor to safely parse function string
    // Note: Assumes string format is "(value) => ..." or "value => ..."
    const func = new Function("return " + fnStr)();
    if (typeof func !== "function") return undefined;
    // Avoid class-like values (direct invocation would throw)
    const source = Function.prototype.toString.call(func);
    if (source.startsWith("class ")) return undefined;
    return func as (...args: unknown[]) => unknown;
  } catch (error) {
    console.warn("Failed to parse function string:", fnStr, error);
  }

  return undefined;
}

/**
 * Process valueTransform strings in DynamicModelConfig and convert them to functions
 * Also process billing.paramConstructors string-to-function conversion
 */
export function processValueTransforms(
  config: DynamicModelConfig,
): DynamicModelConfig {
  if (!config.pricingConfig) return config;

  const processedConfig = { ...config };
  const priceFactors = config.pricingConfig.priceFactors
    ? { ...config.pricingConfig.priceFactors }
    : undefined;

  // Process table.columnValueDerivers
  const table = config.pricingConfig.table
    ? { ...config.pricingConfig.table }
    : undefined;
  if (table?.columnValueDerivers) {
    const columnValueDerivers = { ...table.columnValueDerivers };
    for (const [key, val] of Object.entries(columnValueDerivers)) {
      if (typeof val === "string") {
        const fn = parseFunctionString(val) as
          | ParsedColumnValueDeriver
          | undefined;
        if (fn) {
          columnValueDerivers[key] = fn;
        }
      }
    }
    table.columnValueDerivers = columnValueDerivers;
  }

  // Iterate all priceFactors and process valueTransform
  if (priceFactors) {
    for (const [fieldName, factorConfig] of Object.entries(priceFactors)) {
      if (
        factorConfig.valueTransform &&
        typeof factorConfig.valueTransform === "string"
      ) {
        const func = parseFunctionString(factorConfig.valueTransform) as
          | ParsedValueTransform
          | undefined;
        if (func) {
          priceFactors[fieldName] = {
            ...factorConfig,
            valueTransform: func,
          };
        }
      }
    }
  }

  // Process billing.paramConstructors
  const billing = config.pricingConfig.billing
    ? { ...config.pricingConfig.billing }
    : undefined;
  if (billing?.paramConstructors) {
    const paramConstructors = { ...billing.paramConstructors };
    for (const [paramPath, constructor] of Object.entries(paramConstructors)) {
      if (typeof constructor === "string") {
        const fn = parseFunctionString(constructor) as
          | ((params: Record<string, any>) => any)
          | undefined;
        if (fn) {
          paramConstructors[paramPath] = fn;
        }
      }
    }
    billing.paramConstructors = paramConstructors;
  }

  processedConfig.pricingConfig = {
    ...config.pricingConfig,
    ...(priceFactors ? { priceFactors } : {}),
    ...(table ? { table } : {}),
    ...(billing ? { billing } : {}),
  };

  return processedConfig;
}

/**
 * Process multiple configs in batch
 */
export function processValueTransformsBatch(
  configs: DynamicModelConfig[],
): DynamicModelConfig[] {
  return configs.map(processValueTransforms);
}
