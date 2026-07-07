/**
 * Dynamic pricing table generator
 * Generates table row data from price factors
 */
import {
  PriceFactor,
  PriceFactorDisplayConfig,
  DynamicPriceTableRow,
  DynamicModelConfig,
  PricingConfig,
} from "@/types/dynamic-pricing";
import {
  parseCELExpressions,
  matchSKU,
  getMatchFailureReason,
} from "./cel-matcher";
import { ensureDefaultPricingConfig } from "./default-config";
import { extractValuesFromCELExpr } from "./cel-expr-extractor";
import { evaluate, parse } from "@marcbachmann/cel-js";
import { evaluateExtended } from "./cel-evaluator";
import Big from "big.js";
/**
 * String body fields that are often compared in CEL/billingExpr (e.g. body.resolution == '540p').
 * Backend config may use inconsistent case (540P vs 540p). Normalize to lowercase before eval so
 * comparison works regardless of backend convention. Extend this list if more such fields appear.
 */
const BODY_STRING_FIELDS_NORMALIZE_CASE = [
  "resolution",
  "mode",
  "size",
] as const;
function normalizeBodyParamsCase(bodyParams: Record<string, unknown>): void {
  for (const key of BODY_STRING_FIELDS_NORMALIZE_CASE) {
    const v = bodyParams[key];
    if (typeof v === "string" && v.length > 0) {
      (bodyParams as Record<string, unknown>)[key] = v.toLowerCase();
    }
  }
}
/**
 * Default duration for billing when not configured: use 1s for price calculation.
 * Display: when duration is not in priceConfig, table shows "-" (no default display value).
 */
function getTableDefaultDuration(config: PricingConfig | undefined): number {
  if (!config?.billing?.paramDefaults) return 1;
  const pd = config.billing.paramDefaults["body.duration"];
  if (pd === undefined || pd === null) return 1;
  const n = typeof pd === "string" ? parseInt(pd, 10) : Number(pd);
  return Number.isNaN(n) ? 1 : n;
}
/**
 * Apply billingExpr given known skuCode and base price (no SKU re-match).
 * Used in generateRowsFromSKUs so each row uses its own SKU's base price + body params (duration, resolution, etc.).
 * Aligns with backend: avoid wrong price from re-matching params to a different SKU.
 */
function applyBillingExpr(
  billingExpr: string,
  basePrice: number | string,
  baseOriginalPrice: number | string | undefined,
  baseDiscountPrice: number | string | undefined,
  params: Record<string, any>,
  pricingConfig: PricingConfig,
): {
  price: number | string;
  originalPrice?: number | string;
  discountPrice?: number | string;
} {
  let price = basePrice;
  let originalPrice = baseOriginalPrice;
  let discountPrice = baseDiscountPrice;
  if (typeof price !== "number") {
    return { price, originalPrice, discountPrice };
  }
  if (pricingConfig.billing?.multiplier) {
    const multiplier = params[pricingConfig.billing.multiplier];
    if (multiplier !== undefined) {
      const multiplierBig = new Big(multiplier);
      price = new Big(price).times(multiplierBig).toNumber();
      if (typeof originalPrice === "number") {
        originalPrice = new Big(originalPrice).times(multiplierBig).toNumber();
      }
      if (typeof discountPrice === "number") {
        discountPrice = new Big(discountPrice).times(multiplierBig).toNumber();
      }
    }
    return { price, originalPrice, discountPrice };
  }
  try {
    const bodyParams = { ...params };
    const paramDefaults = pricingConfig.billing?.paramDefaults;
    if (paramDefaults) {
      for (const [path, value] of Object.entries(paramDefaults)) {
        const key = path.replace(/^body\./, "");
        if (key === "duration") {
          const num =
            typeof value === "string" ? parseInt(value, 10) : Number(value);
          if (
            !Number.isNaN(num) &&
            (bodyParams.duration === undefined || bodyParams.duration === null)
          ) {
            bodyParams.duration = num;
          }
        } else if (bodyParams[key] === undefined || bodyParams[key] === null) {
          bodyParams[key] =
            typeof value === "string" && /^\d+$/.test(value)
              ? parseInt(value, 10)
              : value;
        }
      }
    }
    if (
      (billingExpr.includes("duration") ||
        billingExpr.includes("body.duration")) &&
      (bodyParams.duration === undefined || bodyParams.duration === null)
    ) {
      bodyParams.duration = 1;
    }
    if (pricingConfig.billing?.paramConstructors) {
      for (const [paramPath, constructor] of Object.entries(
        pricingConfig.billing.paramConstructors,
      )) {
        if (typeof constructor === "function") {
          try {
            const constructedValue = constructor(params);
            const pathParts = paramPath.replace(/^body\./, "").split(".");
            let target = bodyParams;
            for (let i = 0; i < pathParts.length - 1; i++) {
              if (!target[pathParts[i]]) target[pathParts[i]] = {};
              target = target[pathParts[i]];
            }
            target[pathParts[pathParts.length - 1]] = constructedValue;
          } catch {
            // ignore
          }
        }
      }
    }
    normalizeBodyParamsCase(bodyParams);
    let exprToEval = billingExpr;
    if (
      typeof price === "number" &&
      price > 0 &&
      price % 1 !== 0 &&
      billingExpr.includes("int(sku)")
    ) {
      exprToEval = billingExpr.replace(/\bint\s*\(\s*sku\s*\)/g, "sku");
    }
    const celContext: Record<string, any> = { body: bodyParams };
    if (exprToEval.includes("sku") && price !== undefined) {
      celContext.sku = typeof price === "number" ? price : price;
    }
    const result = evaluateExtended(exprToEval, celContext);
    let calculatedPrice: number;
    if (typeof result === "bigint") {
      calculatedPrice = Number(result);
    } else if (typeof result === "number") {
      calculatedPrice = result;
    } else {
      return { price, originalPrice, discountPrice };
    }
    const usesSku = billingExpr.includes("sku");
    if (usesSku) {
      const priceRatio =
        price === 0 ? new Big(1) : new Big(calculatedPrice).div(price);
      price = calculatedPrice;
      if (typeof originalPrice === "number") {
        originalPrice = new Big(originalPrice).times(priceRatio).toNumber();
      }
      if (typeof discountPrice === "number") {
        discountPrice = new Big(discountPrice).times(priceRatio).toNumber();
      }
    } else {
      const priceBig = new Big(price);
      const originalPriceRatio =
        typeof originalPrice === "number" && price > 0
          ? new Big(originalPrice).div(priceBig)
          : new Big(1);
      const discountPriceRatio =
        typeof discountPrice === "number" && price > 0
          ? new Big(discountPrice).div(priceBig)
          : new Big(1);
      const calculatedPriceBig = new Big(calculatedPrice);
      price = calculatedPrice;
      if (typeof originalPrice === "number") {
        originalPrice = calculatedPriceBig.times(originalPriceRatio).toNumber();
      }
      if (typeof discountPrice === "number") {
        discountPrice = calculatedPriceBig.times(discountPriceRatio).toNumber();
      }
    }
    const divisor = usesSku ? 1 : 10000;
    if (typeof price === "number" && price >= 0 && isFinite(price)) {
      price = new Big(price).div(divisor).round(4).toNumber();
    } else {
      price = "-";
    }
    if (
      typeof originalPrice === "number" &&
      originalPrice >= 0 &&
      isFinite(originalPrice)
    ) {
      originalPrice = new Big(originalPrice).div(divisor).round(4).toNumber();
    } else {
      originalPrice = undefined;
    }
    if (
      typeof discountPrice === "number" &&
      discountPrice >= 0 &&
      isFinite(discountPrice)
    ) {
      discountPrice = new Big(discountPrice).div(divisor).round(4).toNumber();
    } else {
      discountPrice = undefined;
    }
  } catch {
    // keep original price on CEL error
  }
  return { price, originalPrice, discountPrice };
}
/**
 * Generate all price factor combinations (Cartesian product)
 */
export function generatePriceFactorCombinations(
  priceFactors: PriceFactor[],
): Record<string, any>[] {
  if (priceFactors.length === 0) {
    return [{}]; // No price factors, return empty object
  }
  // Compute all combinations
  const combinations: Record<string, any>[] = [];
  const factorValues = priceFactors.map((factor) => factor.values);
  // Recursively generate Cartesian product
  function cartesianProduct(
    arrays: any[][],
    index: number = 0,
    current: Record<string, any> = {},
  ): void {
    if (index === arrays.length) {
      combinations.push({ ...current });
      return;
    }
    const factor = priceFactors[index];
    for (const value of arrays[index]) {
      current[factor.name] = value;
      cartesianProduct(arrays, index + 1, current);
    }
  }
  cartesianProduct(factorValues);
  return combinations;
}
/**
 * Calculate price for a single parameter combination (core logic)
 * Shared by generateTableRows and calculatePlaygroundPrice
 *
 * @param params - Parameter combination object; keys match fieldMapping (e.g. { duration: 5, resolution: "480P" })
 * @param modelConfig - Model config
 * @param priceMap - Price map (from Redux store)
 * @param skuMatchRules - SKU match rules (optional; if provided, reused to avoid re-parsing)
 * @returns Object with skuCode and price
 */
export function calculatePriceForSingleParams(
  params: Record<string, any>,
  modelConfig: DynamicModelConfig,
  priceMap: Record<
    string,
    | number
    | string
    | {
        originalPrice: number;
        discountPrice: number;
      }
  >,
  skuMatchRules?: ReturnType<typeof parseCELExpressions>,
  pricingConfig?: PricingConfig,
): {
  skuCode: string | null;
  price: number | string;
  originalPrice?: number | string;
  discountPrice?: number | string;
} {
  // If pricingConfig not provided, get from modelConfig or use default config
  let config: PricingConfig | null =
    pricingConfig || modelConfig.pricingConfig || null;
  if (!config) {
    // Fallback to default config
    config = ensureDefaultPricingConfig(modelConfig);
  }
  if (!config) {
    return { skuCode: null, price: "-" };
  }
  // If skuMatchRules not provided, parse CEL expressions (reuse result for performance)
  if (!skuMatchRules) {
    skuMatchRules = parseCELExpressions(
      modelConfig.modelConfig.skuMappings,
      config.fieldMapping ?? {},
    );
  }
  // 1. Match SKU (use params; CEL expressions use field names from fieldMapping)
  const skuCode = matchSKU(params, skuMatchRules);
  if (skuCode == null) {
    const reason = getMatchFailureReason(params, skuMatchRules);
    if (reason) {
      console.warn("[Playground price] Match failure reason:", reason);
    }
  }
  // 2. Look up price
  let price: number | string = "-";
  let originalPrice: number | string | undefined;
  let discountPrice: number | string | undefined;
  if (skuCode) {
    const rawPrice = priceMap[skuCode];
    // 0 is a valid configured price and should render as free, not missing.
    if (rawPrice === undefined || rawPrice === null || rawPrice === "") {
      price = "-";
    } else {
      // Handle object-format price (originalPrice and discountPrice)
      if (
        typeof rawPrice === "object" &&
        rawPrice !== null &&
        "originalPrice" in rawPrice &&
        "discountPrice" in rawPrice
      ) {
        originalPrice = rawPrice.originalPrice;
        discountPrice = rawPrice.discountPrice;
        price = discountPrice;
      } else {
        // Single price value
        price = rawPrice as number | string;
        originalPrice = price;
        discountPrice = price;
      }
      // 3. If billing formula exists, apply it (to both original and discount price)
      const billingExpr = modelConfig.modelConfig.config.billingExpr;
      // If billingExpr is just "sku", use price from priceMap directly with no calculation
      const isSimpleSku = billingExpr && billingExpr.trim() === "sku";
      if (billingExpr && !isSimpleSku && typeof price === "number") {
        // If multiplier is configured, use simple multiplication (backward compatible)
        // Use big.js for precision
        if (config.billing?.multiplier) {
          const multiplier = params[config.billing.multiplier];
          if (multiplier !== undefined) {
            // Apply billing formula, e.g. sku * int(body.duration)
            // Use big.js for precision
            const multiplierBig = new Big(multiplier);
            const priceBig = new Big(price);
            price = priceBig.times(multiplierBig).toNumber();
            if (typeof originalPrice === "number") {
              originalPrice = new Big(originalPrice)
                .times(multiplierBig)
                .toNumber();
            }
            if (typeof discountPrice === "number") {
              discountPrice = new Big(discountPrice)
                .times(multiplierBig)
                .toNumber();
            }
          }
        } else {
          // If no multiplier, evaluate full billingExpr with CEL evaluator
          // Note: In generateTableRows, params come from price factor Cartesian product so duration etc. are always set;
          // for API/single price calc, params are from caller and may be empty or missing duration, hence fallback (bodyParams.duration below).
          // CEL is strict on types (sku as BigInt for int*int, unlistedVariablesAreDyn, etc.).
          try {
            // Build CEL expression context (billingExpr may use body.xxx and sku)
            // If billingExpr uses sku, pass it; otherwise compute absolute price.
            // Build params using paramConstructors config
            const bodyParams = { ...params };
            // Apply priceConfig paramDefaults first (e.g. "body.duration": "1"), aligned with other platforms
            const paramDefaults = config.billing?.paramDefaults;
            if (paramDefaults) {
              for (const [path, value] of Object.entries(paramDefaults)) {
                const key = path.replace(/^body\./, "");
                if (key === "duration") {
                  const num =
                    typeof value === "string"
                      ? parseInt(value, 10)
                      : Number(value);
                  if (
                    !Number.isNaN(num) &&
                    (bodyParams.duration === undefined ||
                      bodyParams.duration === null)
                  ) {
                    bodyParams.duration = num;
                  }
                } else if (
                  bodyParams[key] === undefined ||
                  bodyParams[key] === null
                ) {
                  bodyParams[key] =
                    typeof value === "string" && /^\d+$/.test(value)
                      ? parseInt(value, 10)
                      : value;
                }
              }
            }
            // When billingExpr uses body.duration but it's not set (and not from paramDefaults), use 1s to avoid CEL "No such key: duration"
            if (
              (billingExpr.includes("duration") ||
                billingExpr.includes("body.duration")) &&
              (bodyParams.duration === undefined ||
                bodyParams.duration === null)
            ) {
              bodyParams.duration = 1;
            }
            if (config.billing?.paramConstructors) {
              for (const [paramPath, constructor] of Object.entries(
                config.billing.paramConstructors,
              )) {
                if (typeof constructor === "function") {
                  try {
                    const constructedValue = constructor(params);
                    // Set constructed value on bodyParams at the given path
                    // e.g. paramPath = "body.image_settings" -> bodyParams.image_settings = constructedValue
                    const pathParts = paramPath
                      .replace(/^body\./, "")
                      .split(".");
                    let target = bodyParams;
                    for (let i = 0; i < pathParts.length - 1; i++) {
                      if (!target[pathParts[i]]) {
                        target[pathParts[i]] = {};
                      }
                      target = target[pathParts[i]];
                    }
                    target[pathParts[pathParts.length - 1]] = constructedValue;
                  } catch (error) {
                    // Construction failed, ignore (use original params)
                  }
                }
              }
            }
            normalizeBodyParamsCase(bodyParams);
            // Build CEL context (ensure type match if billingExpr uses sku)
            // price may already be in yuan (e.g. 0.0223); billingExpr often expects sku as integer
            const celContext: Record<string, any> = {
              body: bodyParams, // body.xxx maps to bodyParams.xxx
            };
            // Only pass sku when billingExpr uses it
            // If billingExpr has sku * int(...), sku must be integer
            if (billingExpr.includes("sku")) {
              const usesIntSku =
                /sku\s*\*\s*int\(|int\([^)]*\)\s*\*\s*sku/.test(billingExpr);
              if (usesIntSku && typeof price === "number") {
                // Pass sku as BigInt so CEL gets int * int (library supports), avoid dyn<double> * int overload error
                const skuCents =
                  price < 1 ? Math.round(price * 10000) : Math.round(price);
                celContext.sku = BigInt(skuCents);
              } else if (typeof price === "number") {
                // sku can be double; if price < 1, convert back
                celContext.sku = price < 1 ? price * 10000 : price;
              } else {
                celContext.sku = price;
              }
            }
            // Evaluate CEL expression with evaluateExtended (tries standard evaluate first, then extended on error)
            let result;
            try {
              result = evaluateExtended(billingExpr, celContext);
            } catch (error: any) {
              // If error message contains "no matching overload", treat as missing/type mismatch and keep original price
              if (
                error?.message?.includes("no matching overload") ||
                error?.message?.includes("found no matching overload")
              ) {
                return { skuCode, price, originalPrice, discountPrice };
              }
              throw error;
            }
            // Handle result (CEL may return BigInt, convert to number)
            let calculatedPrice: number;
            if (typeof result === "bigint") {
              calculatedPrice = Number(result);
            } else if (typeof result === "number") {
              calculatedPrice = result;
            } else {
              calculatedPrice = price;
            }
            // Whether billingExpr uses sku (multiplier vs absolute price)
            const usesSku = billingExpr.includes("sku");
            if (usesSku) {
              // Apply price ratio to original and discount price (use big.js for precision)
              const priceRatio =
                price === 0 ? new Big(1) : new Big(calculatedPrice).div(price);
              price = calculatedPrice;
              if (typeof originalPrice === "number") {
                originalPrice = new Big(originalPrice)
                  .times(priceRatio)
                  .toNumber();
              }
              if (typeof discountPrice === "number") {
                discountPrice = new Big(discountPrice)
                  .times(priceRatio)
                  .toNumber();
              }
            } else {
              // billingExpr returns absolute price; keep original/discount ratio (use big.js for precision)
              const priceBig = new Big(price);
              const originalPriceRatio =
                typeof originalPrice === "number" && price > 0
                  ? new Big(originalPrice).div(priceBig)
                  : new Big(1);
              const discountPriceRatio =
                typeof discountPrice === "number" && price > 0
                  ? new Big(discountPrice).div(priceBig)
                  : new Big(1);
              const calculatedPriceBig = new Big(calculatedPrice);
              price = calculatedPrice;
              if (typeof originalPrice === "number") {
                originalPrice = calculatedPriceBig
                  .times(originalPriceRatio)
                  .toNumber();
              }
              if (typeof discountPrice === "number") {
                discountPrice = calculatedPriceBig
                  .times(discountPriceRatio)
                  .toNumber();
              }
            }
            // Divide by 10000 and round to 4 decimals (complex expr returns cents)
            // Simple "sku" keeps price as-is (already in yuan). Use big.js for precision.
            if (typeof price === "number" && price >= 0 && isFinite(price)) {
              price = new Big(price).div(10000).round(4).toNumber();
            } else {
              price = "-";
            }
            if (
              typeof originalPrice === "number" &&
              originalPrice >= 0 &&
              isFinite(originalPrice)
            ) {
              originalPrice = new Big(originalPrice)
                .div(10000)
                .round(4)
                .toNumber();
            } else {
              originalPrice = "-";
            }
            if (
              typeof discountPrice === "number" &&
              discountPrice >= 0 &&
              isFinite(discountPrice)
            ) {
              discountPrice = new Big(discountPrice)
                .div(10000)
                .round(4)
                .toNumber();
            } else {
              discountPrice = "-";
            }
          } catch {
            // CEL evaluation failed, keep original price
          }
        }
      }
    }
  }
  return { skuCode, price, originalPrice, discountPrice };
}
/**
 * Extract all field names from CEL expression AST (recursive)
 */
function extractFieldsFromCELAST(
  ast: any,
  fieldMapping: Record<string, string>,
): Set<string> {
  const fields = new Set<string>();
  if (!ast || typeof ast !== "object") {
    return fields;
  }
  // Handle different AST node types
  if (ast.kind === "ident" || ast.kind === "IDENT") {
    // Identifier node, may be field name
    const identifier = ast.name || ast.value;
    if (identifier && fieldMapping[identifier]) {
      fields.add(identifier);
    }
  } else if (ast.kind === "select" || ast.kind === "SELECT") {
    // Select expression, e.g. body.duration
    const operand = ast.operand || ast.expr;
    const field = ast.field || ast.ident;
    if (operand) {
      const operandFields = extractFieldsFromCELAST(operand, fieldMapping);
      operandFields.forEach((f) => fields.add(f));
    }
    // Extract field name (last segment)
    if (field) {
      const fieldName =
        typeof field === "string" ? field : field.name || field.value;
      if (fieldName && fieldMapping[fieldName]) {
        fields.add(fieldName);
      }
    }
  } else if (ast.kind === "call" || ast.kind === "CALL") {
    // Function call, e.g. map(), sum(), has()
    const target = ast.target || ast.function;
    const args = ast.args || ast.arguments || [];
    if (target) {
      const targetFields = extractFieldsFromCELAST(target, fieldMapping);
      targetFields.forEach((f) => fields.add(f));
    }
    for (const arg of args) {
      const argFields = extractFieldsFromCELAST(arg, fieldMapping);
      argFields.forEach((f) => fields.add(f));
    }
  } else if (ast.kind === "conditional" || ast.kind === "CONDITIONAL") {
    // Ternary ? :
    const test = ast.test || ast.condition;
    const trueExpr = ast.true || ast.trueExpr;
    const falseExpr = ast.false || ast.falseExpr;
    if (test) {
      const testFields = extractFieldsFromCELAST(test, fieldMapping);
      testFields.forEach((f) => fields.add(f));
    }
    if (trueExpr) {
      const trueFields = extractFieldsFromCELAST(trueExpr, fieldMapping);
      trueFields.forEach((f) => fields.add(f));
    }
    if (falseExpr) {
      const falseFields = extractFieldsFromCELAST(falseExpr, fieldMapping);
      falseFields.forEach((f) => fields.add(f));
    }
  } else if (ast.kind === "list" || ast.kind === "LIST") {
    const elements = ast.elements || [];
    for (const elem of elements) {
      const elemFields = extractFieldsFromCELAST(elem, fieldMapping);
      elemFields.forEach((f) => fields.add(f));
    }
  } else if (ast.kind === "map" || ast.kind === "MAP") {
    const entries = ast.entries || [];
    for (const entry of entries) {
      if (entry.key) {
        const keyFields = extractFieldsFromCELAST(entry.key, fieldMapping);
        keyFields.forEach((f) => fields.add(f));
      }
      if (entry.value) {
        const valueFields = extractFieldsFromCELAST(entry.value, fieldMapping);
        valueFields.forEach((f) => fields.add(f));
      }
    }
  } else {
    for (const key in ast) {
      if (key !== "kind" && typeof ast[key] === "object" && ast[key] !== null) {
        const childFields = extractFieldsFromCELAST(ast[key], fieldMapping);
        childFields.forEach((f) => fields.add(f));
      }
    }
  }
  return fields;
}
/**
 * Extract all fields used in billingExpr (CEL AST when possible, regex fallback)
 */
function extractFieldsFromBillingExpr(
  billingExpr: string,
  fieldMapping: Record<string, string>,
): Set<string> {
  const fields = new Set<string>();
  if (!billingExpr) {
    return fields;
  }
  // Try CEL library AST first
  let astParsed = false;
  try {
    const parsed = parse(billingExpr);
    if (parsed && parsed.ast) {
      const astFields = extractFieldsFromCELAST(parsed.ast, fieldMapping);
      astFields.forEach((f) => fields.add(f));
      astParsed = true;
    }
  } catch (error) {
    // AST parse failed, fall through to regex
  }
  // Regex fallback for nested arrays (e.g. image_settings[].duration)
  const fieldPatterns = [
    /(?:body|object)(?:\.parameters)?\.([a-zA-Z_][a-zA-Z0-9_]*)/g,
    /(?:\[|\]|\.)([a-zA-Z_][a-zA-Z0-9_]*)(?:\[|\]|\.|$)/g,
  ];
  for (const pattern of fieldPatterns) {
    let match;
    while ((match = pattern.exec(billingExpr)) !== null) {
      const fieldName = match[1];
      if (fieldMapping[fieldName] || fieldName === "duration") {
        fields.add(fieldName);
      }
    }
  }
  // If billingExpr mentions duration (including nested), ensure it's in the set
  if (billingExpr.includes("duration") || billingExpr.includes(".duration")) {
    fields.add("duration");
  }
  return fields;
}
/**
 * Generate table row data
 */
export function generateTableRows(
  modelConfig: DynamicModelConfig,
  priceMap: Record<
    string,
    | number
    | string
    | {
        originalPrice: number;
        discountPrice: number;
      }
  >,
): DynamicPriceTableRow[] {
  // Fallback to default config / auto-generate pricingConfig from SKU mappings
  const pricingConfig = ensureDefaultPricingConfig(modelConfig);
  if (!pricingConfig) {
    return [];
  }
  // Explicit rowMode takes highest priority over auto-inference
  const explicitRowMode = pricingConfig.table?.rowMode;
  if (explicitRowMode === "per-sku") {
    return generateRowsFromSKUs(modelConfig, priceMap, pricingConfig);
  }
  // explicitRowMode === "cartesian": skip per-SKU path and proceed to cartesian product path below
  // Prefer one row per SKU when skuMappings exist and no explicit cartesian mode
  const skuMappings = modelConfig.modelConfig.skuMappings;
  if (skuMappings && skuMappings.length > 0 && !explicitRowMode) {
    return generateRowsFromSKUs(modelConfig, priceMap, pricingConfig);
  }
  // skuMappings is required in business; when empty, no display (combination path disabled)
  return [];
  /* combination path (legacy): commented out; skuMappings required in business
    // 1. Extract price factors (from fieldMapping)
    const priceFactors = extractPriceFactors(
      modelConfig.modelConfig.config.openapiSchema,
      pricingConfig,
    );

    // 2. Parse CEL expressions once and reuse for all combinations
    const skuMatchRules = parseCELExpressions(
      modelConfig.modelConfig.skuMappings,
      pricingConfig.fieldMapping,
    );

    // 2.1 Fields used in CEL (for SKU matching)
    const fieldsUsedInCEL = new Set<string>();
    skuMatchRules.forEach((rule) => {
      rule.conditions.forEach((condition) => {
        if (condition.field) {
          fieldsUsedInCEL.add(condition.field);
        }
      });
    });

    // 2.2 Fields used in billingExpr (for price calculation), extracted via CEL AST
    const billingExpr = modelConfig.modelConfig.config.billingExpr;
    const fieldsUsedInBillingExpr = extractFieldsFromBillingExpr(
      billingExpr || "",
      pricingConfig.fieldMapping,
    );

    // If billingExpr uses duration (e.g. in map), ensure it's in fieldsUsedInBillingExpr
    if (
      billingExpr &&
      (billingExpr.includes("duration") || billingExpr.includes(".duration"))
    ) {
      fieldsUsedInBillingExpr.add("duration");
    }

    // 2.3 Optimize: if field not in CEL but used in billingExpr and has default, use only default value
    const optimizedPriceFactors = priceFactors.map((factor) => {
      const isUsedInCEL = fieldsUsedInCEL.has(factor.name);
      const isUsedInBillingExpr = fieldsUsedInBillingExpr.has(factor.name);

      if (!isUsedInCEL && isUsedInBillingExpr) {
        // duration: prefer priceConfig paramDefaults; others: factor.defaultValue
        let defaultValue: any = undefined;

        if (factor.name === "duration") {
          defaultValue = getTableDefaultDuration(pricingConfig);
        } else if (factor.defaultValue !== undefined) {
          defaultValue = factor.defaultValue;
        } else if (
          factor.type === "number" &&
          factor.values &&
          factor.values.length > 0
        ) {
          defaultValue = factor.values[0];
        }

        if (defaultValue !== undefined) {
          return {
            ...factor,
            values: [defaultValue],
          };
        }
      }

      return factor;
    });

    // 2.3.0 If priceConfig explicitly sets values for a factor, use those (e.g. duration [1] -> table shows 1s only)
    if (pricingConfig.priceFactors) {
      for (const [factorName, factorConfig] of Object.entries(
        pricingConfig.priceFactors,
      )) {
        const configWithValues = factorConfig as PriceFactorDisplayConfig & {
          values?: any[];
          defaultValue?: any;
        };
        if (
          Array.isArray(configWithValues.values) &&
          configWithValues.values.length > 0 &&
          !optimizedPriceFactors.some((f) => f.name === factorName)
        ) {
          optimizedPriceFactors.push({
            name: factorName,
            type: "number",
            values: configWithValues.values,
            defaultValue:
              configWithValues.defaultValue ?? configWithValues.values[0],
            displayConfig: {
              column: factorConfig.column,
              valueTransform: factorConfig.valueTransform,
              valueFilter: factorConfig.valueFilter,
            },
          });
        }
      }
    }

    // When duration is not in priceConfig: do not inject a duration factor (table shows "-"; billing uses 1s via bodyParams fallback)

    const finalPriceFactors = optimizedPriceFactors;

    // 3. Check for mode / fast_mode factor (derived from SKU)
    const hasModeFactor =
      pricingConfig.priceFactors?.mode !== undefined ||
      pricingConfig.priceFactors?.fast_mode !== undefined;

    // If priceFactors configured but not extractable from schema (e.g. string template), use generateRowsFromSKUs
    const hasConfiguredPriceFactors =
      pricingConfig.priceFactors &&
      Object.keys(pricingConfig.priceFactors).length > 0;
    const hasColumnValueDerivers =
      pricingConfig.table?.columnValueDerivers &&
      Object.keys(pricingConfig.table.columnValueDerivers).length > 0;

    if (finalPriceFactors.length === 0) {
      // No price factors: use one row per SKU when we have mode/fast_mode or columnValueDerivers (so deriver can run per SKU)
      if (hasModeFactor || hasColumnValueDerivers || hasConfiguredPriceFactors) {
        return generateRowsFromSKUs(modelConfig, priceMap, pricingConfig);
      }
      return generateFixedPriceRows(modelConfig, priceMap);
    }

    // 4. Generate all price factor combinations
    let combinations = generatePriceFactorCombinations(finalPriceFactors);

    // 4.1 If CEL has has() conditions, expand with true/false for those fields
    const hasFields = new Set<string>();
    skuMatchRules.forEach((rule) => {
      rule.conditions.forEach((condition) => {
        if (condition.operator === "has" && condition.field) {
          hasFields.add(condition.field);
        }
      });
    });

    if (hasFields.size > 0) {
      const expandedCombinations: Record<string, any>[] = [];
      for (const combo of combinations) {
        const missingFields = Array.from(hasFields).filter(
          (f) => combo[f] === undefined,
        );

        if (missingFields.length === 0) {
          expandedCombinations.push(combo);
        } else {
          const generateHasCombinations = (
            baseCombo: Record<string, any>,
            fields: string[],
            index: number,
          ): void => {
            if (index >= fields.length) {
              expandedCombinations.push({ ...baseCombo });
              return;
            }
            const fieldName = fields[index];
            generateHasCombinations(
              { ...baseCombo, [fieldName]: true },
              fields,
              index + 1,
            );
            generateHasCombinations(
              { ...baseCombo, [fieldName]: false },
              fields,
              index + 1,
            );
          };
          generateHasCombinations(combo, missingFields, 0);
        }
      }
      combinations = expandedCombinations;
    }

    // 5. For each combination: match SKU and get price
    const rows: DynamicPriceTableRow[] = combinations.map((combo, index) => {
      const { skuCode, price, originalPrice, discountPrice } =
        calculatePriceForSingleParams(
          combo,
          modelConfig,
          priceMap,
          skuMatchRules,
          pricingConfig,
        );

      const displayRow: Record<string, any> = { ...combo };

      // Apply valueTransform
      for (const factor of finalPriceFactors) {
        const fieldName = factor.name;
        const valueTransform = factor.displayConfig?.valueTransform;
        if (valueTransform && displayRow[fieldName] !== undefined) {
          displayRow[fieldName] = valueTransform(displayRow[fieldName]);
        }

        const dataIndex = factor.displayConfig?.column.dataIndex;
        if (dataIndex && dataIndex !== fieldName) {
          displayRow[dataIndex] = displayRow[fieldName];
        }
      }

      if (combo.size && pricingConfig.priceFactors?.resolution) {
        // Map size to resolution for display
        const sizeToResolution: Record<string, string> = {
          "832*480": "480P",
          "480*832": "480P",
          "624*624": "480P",
          "1280*720": "720P",
          "720*1280": "720P",
          "960*960": "720P",
          "1088*832": "720P",
          "832*1088": "720P",
          "1920*1080": "1080P",
          "1080*1920": "1080P",
          "1440*1440": "1080P",
          "1632*1248": "1080P",
          "1248*1632": "1080P",
        };
        displayRow.resolution = sizeToResolution[combo.size] || combo.size;
        delete displayRow.size;
      }

      // Column combiners: when multiple factors map to one column, combine display
      const columnCombiners = pricingConfig.table?.columnCombiners;
      if (columnCombiners) {
        for (const [columnName, combinerConfig] of Object.entries(
          columnCombiners,
        )) {
          const fields = combinerConfig.fields || [];
          const separator = combinerConfig.separator || "/";

          const values: string[] = [];
          for (const fieldName of fields) {
            const factor = finalPriceFactors.find((f) => f.name === fieldName);
            if (factor) {
              const originalValue = combo[fieldName];
              if (originalValue !== undefined) {
                let transformedValue = originalValue;
                if (factor.displayConfig?.valueTransform) {
                  transformedValue =
                    factor.displayConfig.valueTransform(originalValue);
                }
                if (
                  transformedValue !== undefined &&
                  transformedValue !== null &&
                  transformedValue !== ""
                ) {
                  values.push(String(transformedValue));
                }
              }
            }
          }

          if (values.length > 0) {
            displayRow[columnName] = values.join(separator);
          }
        }
      }

      const columnValueDerivers = pricingConfig.table?.columnValueDerivers;
      if (columnValueDerivers) {
        for (const [targetKey, deriver] of Object.entries(columnValueDerivers)) {
          if (typeof deriver === "function") {
            const derived = deriver({ skuCode, params: combo, row: displayRow });
            if (derived !== undefined) {
              displayRow[targetKey] = derived;
            }
          }
        }
      }

      // Legacy: if mode factor configured and not set by combiner/deriver, derive from SKU
      if (
        hasModeFactor &&
        skuCode &&
        !columnCombiners?.mode &&
        displayRow.mode === undefined
      ) {
        displayRow.mode = deriveModeFromSKU(skuCode);
      }

      // Clean displayRow: only set duration from combo when in priceFactors; when not configured, leave undefined so UI shows "-"
      const hasDurationFactor = finalPriceFactors.some(
        (f) => f.name === "duration",
      );
      if (hasDurationFactor) {
        if (displayRow.duration === null || displayRow.duration === undefined) {
          displayRow.duration = combo.duration;
        }
      } else if (
        displayRow.duration === null ||
        displayRow.duration === undefined
      ) {
        delete displayRow.duration;
      }

      return {
        ...displayRow,
        skuCode: skuCode || undefined,
        price,
        originalPrice,
        discountPrice,
      };
    });

    // Filter out rows with no matching SKU
    const filteredRows = rows.filter(
      (row) => row.skuCode !== null && row.skuCode !== undefined,
    );

    // Dedupe: if multiple combinations match same SKU, keep first (CEL OR conditions can cause this)
    const seenSKUs = new Set<string>();
    const uniqueRows = filteredRows.filter((row) => {
      if (!row.skuCode) {
        return false;
      }
      if (seenSKUs.has(row.skuCode)) {
        return false;
      }
      seenSKUs.add(row.skuCode);
      return true;
    });

    return uniqueRows;
    */
}
/**
 * Get resolution string from size value
 */
function getResolutionFromSize(size: string): string | null {
  const resolutionMap: Record<string, string> = {
    "832*480": "480P",
    "480*832": "480P",
    "624*624": "480P",
    "1280*720": "720P",
    "720*1280": "720P",
    "960*960": "720P",
    "1088*832": "720P",
    "832*1088": "720P",
    "1920*1080": "1080P",
    "1080*1920": "1080P",
    "1440*1440": "1080P",
    "1632*1248": "1080P",
    "1248*1632": "1080P",
  };
  return resolutionMap[size] || null;
}
/**
 * Generate table rows for fixed-price model (no price factors)
 */
function generateFixedPriceRows(
  modelConfig: DynamicModelConfig,
  priceMap: Record<
    string,
    | number
    | string
    | {
        originalPrice: number;
        discountPrice: number;
      }
  >,
): DynamicPriceTableRow[] {
  // Fixed-price model usually has one SKU; no SKU mappings -> no rows
  if (
    !modelConfig.modelConfig.skuMappings ||
    modelConfig.modelConfig.skuMappings.length === 0
  ) {
    return [];
  }
  const skuCode = modelConfig.modelConfig.skuMappings[0].skuCode;
  const rawPrice = priceMap[skuCode];
  let price: number | string = "-";
  let originalPrice: number | string | undefined;
  let discountPrice: number | string | undefined;
  if (rawPrice === undefined || rawPrice === null || rawPrice === "") {
    price = "-";
  } else {
    // Handle object-format price (originalPrice and discountPrice)
    if (
      typeof rawPrice === "object" &&
      rawPrice !== null &&
      "originalPrice" in rawPrice &&
      "discountPrice" in rawPrice
    ) {
      originalPrice = rawPrice.originalPrice;
      discountPrice = rawPrice.discountPrice;
      price = discountPrice;
    } else {
      // Single price value
      price = rawPrice as number | string;
      originalPrice = price;
      discountPrice = price;
    }
  }
  return [
    {
      skuCode,
      price,
      originalPrice,
      discountPrice,
    },
  ];
}
/**
 * When there are no price factors but mode is configured, generate one row per SKU
 */
function generateRowsFromSKUs(
  modelConfig: DynamicModelConfig,
  priceMap: Record<
    string,
    | number
    | string
    | {
        originalPrice: number;
        discountPrice: number;
      }
  >,
  pricingConfig: PricingConfig,
): DynamicPriceTableRow[] {
  const rows: DynamicPriceTableRow[] = [];
  for (const skuMapping of modelConfig.modelConfig.skuMappings) {
    const skuCode = skuMapping.skuCode;
    const celExpr = skuMapping.celExpr;
    const extractedValues = extractValuesFromCELExpr(
      celExpr,
      pricingConfig.fieldMapping,
    ) as Record<string, unknown>;
    const rawPrice = priceMap[skuCode];
    let price: number | string = "-";
    let originalPrice: number | string | undefined;
    let discountPrice: number | string | undefined;
    if (rawPrice === undefined || rawPrice === null || rawPrice === "") {
      price = "-";
    } else {
      if (
        typeof rawPrice === "object" &&
        rawPrice !== null &&
        "originalPrice" in rawPrice &&
        "discountPrice" in rawPrice
      ) {
        originalPrice = rawPrice.originalPrice;
        discountPrice = rawPrice.discountPrice;
        price = discountPrice;
      } else {
        price = rawPrice as number | string;
        originalPrice = price;
        discountPrice = price;
      }
    }
    const row: DynamicPriceTableRow = {
      ...extractedValues,
      skuCode: skuCode,
      price,
      originalPrice,
      discountPrice,
    } as DynamicPriceTableRow;
    if ((row as any).size && pricingConfig.priceFactors?.resolution) {
      const sizeToResolution: Record<string, string> = {
        "832*480": "480P",
        "480*832": "480P",
        "624*624": "480P",
        "1280*720": "720P",
        "720*1280": "720P",
        "960*960": "720P",
        "1088*832": "720P",
        "832*1088": "720P",
        "1920*1080": "1080P",
        "1080*1920": "1080P",
        "1440*1440": "1080P",
        "1632*1248": "1080P",
        "1248*1632": "1080P",
      };
      (row as any).resolution =
        sizeToResolution[(row as any).size] || (row as any).size;
    }
    const priceFactors = pricingConfig.priceFactors;
    if (priceFactors) {
      for (const [factorName, factorConfig] of Object.entries(priceFactors)) {
        if (
          factorConfig?.valueTransform &&
          (row as any)[factorName] !== undefined
        ) {
          (row as any)[factorName] = factorConfig.valueTransform(
            (row as any)[factorName],
          );
        }
        const dataIndex = (factorConfig as any)?.column?.dataIndex;
        if (dataIndex && dataIndex !== factorName) {
          (row as any)[dataIndex] = (row as any)[factorName];
        }
      }
    }
    const fastModeConfig = pricingConfig.priceFactors?.fast_mode;
    if (fastModeConfig) {
      // Extract fast_mode from CEL (e.g. has(body.fast_mode) && body.fast_mode == true -> true)
      let isFastMode = false;
      if (
        celExpr.includes("fast_mode == true") &&
        !celExpr.includes("fast_mode == false")
      ) {
        isFastMode = true;
      } else if (
        celExpr.includes("fast_mode == false") ||
        (!celExpr.includes("fast_mode == true") &&
          celExpr.includes("!has(body.fast_mode)"))
      ) {
        isFastMode = false;
      }
      if (fastModeConfig.valueTransform) {
        row.mode = fastModeConfig.valueTransform(isFastMode);
      } else {
        row.mode = isFastMode ? "Fast mode" : "Standard mode";
      }
    } else if (pricingConfig.priceFactors?.mode && !("mode" in row)) {
      row.mode = deriveModeFromSKU(skuCode);
    }
    // When priceConfig has paramDefaults["body.duration"] or priceFactors.duration default/values, fill row.duration for display (e.g. VIDU 5s)
    if ((row as any).duration === undefined || (row as any).duration === null) {
      const defaultDuration =
        pricingConfig.billing?.paramDefaults?.["body.duration"];
      if (defaultDuration !== undefined && defaultDuration !== null) {
        const parsed =
          typeof defaultDuration === "string"
            ? parseInt(defaultDuration, 10)
            : Number(defaultDuration);
        if (!Number.isNaN(parsed)) (row as any).duration = parsed;
      } else {
        const durationFactor = pricingConfig.priceFactors?.duration as
          | {
              defaultValue?: number;
              values?: number[];
            }
          | undefined;
        if (durationFactor?.defaultValue !== undefined) {
          (row as any).duration = durationFactor.defaultValue;
        } else if (
          Array.isArray(durationFactor?.values) &&
          durationFactor.values.length > 0
        ) {
          (row as any).duration = durationFactor.values[0];
        }
      }
    }
    // Column combiners: when multiple factors map to one column, combine display
    const columnCombiners = pricingConfig.table?.columnCombiners;
    if (columnCombiners) {
      for (const [columnName, combinerConfig] of Object.entries(
        columnCombiners,
      )) {
        const fields = combinerConfig.fields || [];
        const separator = combinerConfig.separator || "/";
        const values: string[] = [];
        for (const fieldName of fields) {
          const factorConfig = pricingConfig.priceFactors?.[fieldName];
          let val = (row as any)[fieldName];
          if (val === undefined && factorConfig) {
            const dataIndex = (factorConfig as any)?.column?.dataIndex;
            if (dataIndex) val = (row as any)[dataIndex];
          }
          if (val !== undefined && val !== null && val !== "") {
            values.push(String(val));
          }
        }
        if (values.length > 0) {
          (row as any)[columnName] = values.join(separator);
        }
      }
    }
    const columnValueDerivers = pricingConfig.table?.columnValueDerivers;
    if (columnValueDerivers) {
      for (const [targetKey, deriver] of Object.entries(columnValueDerivers)) {
        if (typeof deriver === "function") {
          const derived = deriver({
            skuCode,
            params: extractedValues,
            row: row as any,
            celExpr,
          });
          if (derived !== undefined) {
            (row as any)[targetKey] = derived;
          }
        }
      }
    }
    // Apply billingExpr with this row's SKU base price + body params (no re-match)
    const billingExpr = modelConfig.modelConfig.config.billingExpr;
    const isSimpleSku = billingExpr && billingExpr.trim() === "sku";
    const isIntSku =
      billingExpr && /^int\s*\(\s*sku\s*\)\s*$/.test(billingExpr.trim());
    const hasResponseBody =
      billingExpr && billingExpr.includes("response_body");
    if (
      billingExpr &&
      !isSimpleSku &&
      !isIntSku &&
      !hasResponseBody &&
      typeof price === "number"
    ) {
      const paramsForBilling: Record<string, any> = {
        ...extractedValues,
        duration: (row as any).duration,
        resolution: (row as any).resolution,
      };
      const calculated = applyBillingExpr(
        billingExpr,
        price,
        originalPrice,
        discountPrice,
        paramsForBilling,
        pricingConfig,
      );
      row.price = calculated.price;
      if (calculated.originalPrice !== undefined)
        row.originalPrice = calculated.originalPrice;
      if (calculated.discountPrice !== undefined)
        row.discountPrice = calculated.discountPrice;
    }
    rows.push(row);
  }
  return rows;
}
/**
 * Derive mode label from SKU code
 */
function deriveModeFromSKU(skuCode: string): string {
  const hasLoRA = skuCode.includes("LORA");
  if (skuCode.includes("TXT_TO_IMG")) {
    return hasLoRA ? "Text-to-Image (LoRA)" : "Text-to-Image";
  }
  if (skuCode.includes("IMG_TO_IMG")) {
    return hasLoRA ? "Image-to-Image (LoRA)" : "Image-to-Image";
  }
  return "-";
}
/**
 * Get table column config
 */
export function getTableColumns(
  priceFactors: PriceFactor[],
  pricingConfig: PricingConfig,
  copy: any,
): Array<{
  title: string;
  dataIndex: string;
  render?: (value: any, record: any) => any;
  order?: number;
}> {
  const columns: Array<{
    title: string;
    dataIndex: string;
    render?: (value: any, record: any) => any;
    order?: number;
  }> = [];
  for (const factor of priceFactors) {
    const displayConfig = factor.displayConfig;
    if (displayConfig) {
      columns.push({
        title: displayConfig.column.title,
        dataIndex: displayConfig.column.dataIndex || factor.name,
        render: getColumnRenderer(displayConfig.column.render, copy),
        order: displayConfig.column.order ?? 999,
      });
    } else {
      columns.push({
        title: factor.name,
        dataIndex: factor.name,
        order: 999,
      });
    }
  }
  columns.push({
    title: "Price",
    dataIndex: "price",
    render: (value: any) => {
      if (value === "-" || value === null || value === undefined) {
        return "-";
      }
      const unit = pricingConfig.table?.priceUnit || "";
      return `$${value}${unit ? ` /${unit}` : ""}`;
    },
    order: 9999,
  });
  columns.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  return columns;
}
/**
 * Get column render function
 */
function getColumnRenderer(
  renderType: string | undefined,
  copy: any,
): ((value: any, record: any) => any) | undefined {
  if (!renderType || renderType === "default") {
    return undefined;
  }
  switch (renderType) {
    case "duration":
      return (value: any) => {
        if (
          value === null ||
          value === undefined ||
          value === "" ||
          String(value).trim() === "" ||
          String(value).toLowerCase() === "null" ||
          String(value).toLowerCase() === "undefined"
        ) {
          return "-";
        }
        const numDuration = Number(value);
        if (isNaN(numDuration) || numDuration <= 0) {
          return "-";
        }
        return `${numDuration}${copy?.pricing_table?.video?.second || "s"}`;
      };
    case "resolution":
      return (value: string) => value || "-";
    case "mode":
      return (value: string) => value || "-";
    case "size":
      return (value: string) => value || "-";
    default:
      return undefined;
  }
}
// ==================== Playground helpers (for future integration) ====================
/**
 * Convert Playground user params to fieldMapping format
 * e.g. { width: 720, height: 1280, duration: 5 } -> { size: "720*1280", duration: 5 } or { resolution: "720P", duration: 5 }
 *
 * @param userParams - User params from Playground
 * @param modelConfig - Model config (fieldMapping and conversion rules)
 * @returns Params object with keys matching fieldMapping
 */
export function convertPlaygroundParamsToFieldMapping(
  userParams: {
    width?: number;
    height?: number;
    duration?: number;
    resolution?: string;
    size?: string;
    mode?: string;
    [key: string]: any;
  },
  modelConfig: DynamicModelConfig,
): Record<string, any> {
  const { pricingConfig } = modelConfig;
  if (!pricingConfig) {
    return {};
  }
  const mappedParams: Record<string, any> = {};
  for (const [fieldKey, fieldPath] of Object.entries(
    pricingConfig.fieldMapping,
  )) {
    if (userParams[fieldKey] !== undefined) {
      mappedParams[fieldKey] = userParams[fieldKey];
      continue;
    }
    if (fieldKey === "size" && userParams.width && userParams.height) {
      mappedParams[fieldKey] = `${userParams.width}*${userParams.height}`;
      continue;
    }
    if (fieldKey === "resolution" && userParams.width && userParams.height) {
      const resolution = convertSizeToResolutionForPlayground(
        userParams.width,
        userParams.height,
      );
      if (resolution) {
        mappedParams[fieldKey] = resolution;
        continue;
      }
    }
    if (fieldKey === "resolution" && userParams.size) {
      const resolution = getResolutionFromSize(userParams.size);
      if (resolution) {
        mappedParams[fieldKey] = resolution;
        continue;
      }
    }
    const pathParts = fieldPath.split(".");
    const paramName = pathParts[pathParts.length - 1];
    if (userParams[paramName] !== undefined) {
      mappedParams[fieldKey] = userParams[paramName];
    }
  }
  return mappedParams;
}
/**
 * Convert width and height to resolution string (for Playground)
 *
 * @param width - Width
 * @param height - Height
 * @returns Resolution string (e.g. "480P", "720P", "1080P") or null
 */
function convertSizeToResolutionForPlayground(
  width: number,
  height: number,
): string | null {
  const size = `${width}*${height}`;
  return getResolutionFromSize(size);
}
/**
 * Format price for display
 *
 * @param price - Price value
 * @param pricingConfig - Pricing config
 * @returns Formatted price string
 */
function formatPrice(
  price: number | string,
  pricingConfig?: PricingConfig,
): string {
  if (price === "-" || price === null || price === undefined) {
    return "-";
  }
  const unit = pricingConfig?.table?.priceUnit || "";
  if (typeof price === "number") {
    return `$${price}${unit ? ` /${unit}` : ""}`;
  }
  return price;
}
/**
 * Calculate real-time price in Playground (when user changes duration, resolution, size, etc.)
 *
 * @param userParams - User params (width, height, duration, resolution, etc.)
 * @param modelConfig - Model config
 * @param priceMap - Price map (from Redux store)
 * @returns { skuCode, price, formattedPrice }
 */
export function calculatePlaygroundPrice(
  userParams: {
    width?: number;
    height?: number;
    duration?: number;
    resolution?: string;
    size?: string;
    mode?: string;
    [key: string]: any;
  },
  modelConfig: DynamicModelConfig,
  priceMap: Record<
    string,
    | number
    | string
    | {
        originalPrice: number;
        discountPrice: number;
      }
  >,
): {
  skuCode: string | null;
  price: number | string;
  formattedPrice: string;
} {
  const mappedParams = convertPlaygroundParamsToFieldMapping(
    userParams,
    modelConfig,
  );
  const { skuCode, price } = calculatePriceForSingleParams(
    mappedParams,
    modelConfig,
    priceMap,
  );
  const formattedPrice = formatPrice(price, modelConfig.pricingConfig);
  return { skuCode, price, formattedPrice };
}
