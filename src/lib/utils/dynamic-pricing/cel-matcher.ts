/**
 * CEL expression matcher
 * Parses CEL expressions and matches parameter values
 */

import { SKUMatchRule } from "@/types/dynamic-pricing";

/** Result of parsing a single CEL: condition list + top-level logical operator (pure || = OR, else AND) */
type ParseCELResult = {
  conditions: SKUMatchRule["conditions"];
  logicalOperator: "AND" | "OR";
};

/**
 * Parse CEL expressions and produce match rules
 */
export function parseCELExpressions(
  skuMappings: Array<{ skuCode: string; celExpr: string }>,
  fieldMapping: Record<string, string>,
): SKUMatchRule[] {
  const safeFieldMapping = fieldMapping ?? {};
  return skuMappings.map((mapping) => {
    const { conditions, logicalOperator } = parseCELExpression(
      mapping.celExpr,
      safeFieldMapping,
    );
    return {
      skuCode: mapping.skuCode,
      conditions,
      logicalOperator,
    };
  });
}

/**
 * Parse a single CEL expression (e.g. object.parameters.resolution == "480P", has(body.video), size(body.images) > 0, OR conditions)
 */
function parseCELExpression(
  celExpr: string,
  fieldMapping: Record<string, string>,
): ParseCELResult {
  const conditions: SKUMatchRule["conditions"] = [];

  try {
    let expr = celExpr.trim().replace(/\\"/g, '"').replace(/\\'/g, "'");

    if (expr === "true") {
      return { conditions: [], logicalOperator: "AND" };
    }

    expr = expr.replace(/^\((.+)\)$/, "$1").trim();

    if (expr.includes("&&")) {
      const andParts = expr.split("&&").map((p) => p.trim());
      for (const part of andParts) {
        if (part.includes("||")) {
          const orConditions = parseORCondition(part, fieldMapping);
          if (orConditions.length > 0) {
            conditions.push(...orConditions);
          }
        } else {
          const condition = parseSingleCondition(part, fieldMapping);
          if (condition) {
            conditions.push(condition);
          }
        }
      }
      return { conditions, logicalOperator: "AND" };
    }
    if (expr.includes("||")) {
      const orConditions = parseORCondition(expr, fieldMapping);
      conditions.push(...orConditions);
      return { conditions, logicalOperator: "OR" };
    }
    const condition = parseSingleCondition(expr, fieldMapping);
    if (condition) {
      conditions.push(condition);
    }
    return { conditions, logicalOperator: "AND" };
  } catch (error) {
    console.error("Failed to parse CEL expression:", celExpr, error);
  }

  return { conditions, logicalOperator: "AND" };
}

/**
 * Parse OR conditions
 */
function parseORCondition(
  conditionStr: string,
  fieldMapping: Record<string, string>,
): SKUMatchRule["conditions"] {
  const conditions: SKUMatchRule["conditions"] = [];
  const orParts = conditionStr.split("||").map((p) => p.trim());

  for (const part of orParts) {
    const condition = parseSingleCondition(part, fieldMapping);
    if (condition) {
      conditions.push(condition);
    }
  }

  return conditions;
}

/**
 * Remove CEL type casting function wrappers (such as int(), string(), double(), bool(), etc.)
 * Example: int(body.duration) -> body.duration
 */
function unwrapCELTypeCast(expr: string): string {
  // Match int(...), string(...), double(...), bool(...), uint(...), etc.
  const typeCastMatch = expr.match(/^(int|string|double|bool|uint)\((.+)\)$/);
  if (typeCastMatch) {
    return typeCastMatch[2].trim();
  }
  return expr;
}

/**
 * Parse a single condition (supports OR)
 */
function parseSingleCondition(
  conditionStr: string,
  fieldMapping: Record<string, string>,
): SKUMatchRule["conditions"][0] | null {
  conditionStr = conditionStr.replace(/^\(|\)$/g, "").trim();

  if (conditionStr.includes("||")) {
    const orParts = conditionStr.split("||").map((p) => p.trim());
    const values: any[] = [];
    let fieldName: string | null = null;
    let operator: string = "==";

    for (const part of orParts) {
      const condition = parseSingleCondition(part, fieldMapping);
      if (condition) {
        if (!fieldName) {
          fieldName = condition.field;
          operator = condition.operator;
        }
        if (condition.value !== undefined) {
          values.push(condition.value);
        }
      }
    }

    if (fieldName && values.length > 0) {
      return {
        field: fieldName,
        operator: operator as any,
        value: values,
      };
    }
  }

  if (conditionStr.includes("has(")) {
    const match = conditionStr.match(/has\(([^)]+)\)/);
    if (match) {
      const path = match[1].trim();
      const fieldName = findFieldNameByPath(path, fieldMapping);
      if (fieldName) {
        return {
          field: fieldName,
          operator: "has",
          path: path,
        };
      }
      const normalizedPath = path.replace(/^(object|body)\./, "");
      if (normalizedPath && fieldMapping[normalizedPath]) {
        return {
          field: normalizedPath,
          operator: "has",
          path: path,
        };
      }
    }
    return null;
  }

  if (conditionStr.startsWith("size(")) {
    const match = conditionStr.match(
      /size\(([^)]+)\)\s*(==|!=|>|<|>=|<=)\s*(\d+)/,
    );
    if (match) {
      const path = match[1].trim();
      const value = parseInt(match[3], 10);
      const fieldName = findFieldNameByPath(path, fieldMapping);
      if (fieldName) {
        return {
          field: `${fieldName}.size()`,
          operator: match[2] as any,
          value: value,
          path: path,
        };
      }
    }
    return null;
  }

  const operators = ["==", "!=", ">=", "<=", ">", "<"];
  for (const op of operators) {
    if (conditionStr.includes(op)) {
      const parts = conditionStr.split(op).map((p) => p.trim());
      if (parts.length === 2) {
        // Remove CEL type casting function wrappers (such as int(body.duration) -> body.duration)
        const left = unwrapCELTypeCast(parts[0]);
        const right = parts[1];

        let fieldName = findFieldNameByPath(left, fieldMapping);
        if (!fieldName) {
          const normalizedPath = left.replace(/^(object|body)\./, "");
          if (fieldMapping[normalizedPath]) {
            fieldName = normalizedPath;
          } else {
            fieldName = normalizedPath;
          }
        }

        if (!fieldName) {
          continue;
        }

        let value: any = right;
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        } else if (
          (value.startsWith('\\"') && value.endsWith('\\"')) ||
          (value.startsWith("\\'") && value.endsWith("\\'"))
        ) {
          value = value.slice(2, -2);
        } else if (!isNaN(Number(value))) {
          value = Number(value);
        } else if (value === "true") {
          value = true;
        } else if (value === "false") {
          value = false;
        }

        return {
          field: fieldName,
          operator: op as any,
          value: value,
        };
      }
    }
  }

  const hasOperator = operators.some((op) => conditionStr.includes(op));
  if (!hasOperator) {
    let fieldName = findFieldNameByPath(conditionStr, fieldMapping);
    if (!fieldName) {
      const normalizedPath = conditionStr.replace(/^(object|body)\./, "");
      if (fieldMapping[normalizedPath]) {
        fieldName = normalizedPath;
      } else {
        fieldName = normalizedPath;
      }
    }
    if (fieldName) {
      return {
        field: fieldName,
        operator: "==",
        value: true,
      };
    }
  }

  return null;
}

/**
 * Find field name (fieldMapping key) by path
 */
function findFieldNameByPath(
  path: string,
  fieldMapping: Record<string, string>,
): string | null {
  if (fieldMapping == null || typeof fieldMapping !== "object") {
    return null;
  }
  const normalizedPath = path.replace(/^(object|body)\./, "");

  for (const [fieldName, fieldPath] of Object.entries(fieldMapping)) {
    const normalizedFieldPath = fieldPath.replace(/^(object|body)\./, "");
    if (normalizedFieldPath === normalizedPath) {
      return fieldName;
    }
  }

  if (fieldMapping[normalizedPath]) {
    return normalizedPath;
  }

  return null;
}

/**
 * Check if params match rule
 */
export function matchSKURule(
  params: Record<string, any>,
  rule: SKUMatchRule,
): boolean {
  if (rule.conditions.length === 0) {
    return true;
  }

  if (rule.logicalOperator === "OR") {
    return rule.conditions.some((condition) =>
      matchCondition(params, condition),
    );
  }

  const conditionGroups = groupConditionsByField(rule.conditions);

  for (const [, fieldConditions] of Object.entries(conditionGroups)) {
    if (
      fieldConditions.length > 1 &&
      areAllEqualityConditions(fieldConditions)
    ) {
      const anyMatched = fieldConditions.some((condition) =>
        matchCondition(params, condition),
      );
      if (!anyMatched) {
        return false;
      }
    } else {
      for (const condition of fieldConditions) {
        if (
          params[condition.field] === undefined &&
          condition.operator === "==" &&
          condition.value === false
        ) {
          continue;
        }
        const matched = matchCondition(params, condition);
        if (!matched) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Group conditions by field
 */
function groupConditionsByField(
  conditions: SKUMatchRule["conditions"],
): Record<string, SKUMatchRule["conditions"]> {
  const groups: Record<string, SKUMatchRule["conditions"]> = {};

  for (const condition of conditions) {
    const field = condition.field || "default";
    if (!groups[field]) {
      groups[field] = [];
    }
    groups[field].push(condition);
  }

  return groups;
}

/**
 * Check if all conditions are equality
 */
function areAllEqualityConditions(
  conditions: SKUMatchRule["conditions"],
): boolean {
  return conditions.every((c) => c.operator === "==");
}

/**
 * Check if a single condition matches
 */
function matchCondition(
  params: Record<string, any>,
  condition: SKUMatchRule["conditions"][0],
): boolean {
  const { field, operator, value } = condition;
  const isLengthCompare =
    typeof field === "string" &&
    field.endsWith(".size()") &&
    (operator === ">" ||
      operator === "<" ||
      operator === ">=" ||
      operator === "<=" ||
      operator === "==" ||
      operator === "!=");
  const baseField = isLengthCompare
    ? (field as string)
        .replace(/\.size\(\)$/, "")
        .replace(/^(body|object)\./, "")
    : field;
  const paramValue = params[baseField];
  const lengthForCompare = isLengthCompare
    ? typeof paramValue === "string"
      ? paramValue.length
      : Array.isArray(paramValue)
        ? paramValue.length
        : paramValue != null && paramValue !== ""
          ? Number(paramValue)
          : 0
    : undefined;

  switch (operator) {
    case "==":
      if (isLengthCompare && lengthForCompare !== undefined) {
        return lengthForCompare === Number(value);
      }
      if (Array.isArray(value)) {
        if (typeof paramValue === "string") {
          const paramLower = paramValue.toLowerCase();
          return value.some(
            (v) => (typeof v === "string" ? v.toLowerCase() : v) === paramLower,
          );
        }
        return value.includes(paramValue);
      }
      if (typeof paramValue === "string" && typeof value === "string") {
        return paramValue.toLowerCase() === value.toLowerCase();
      }
      return paramValue === value;
    case "!=":
      if (isLengthCompare && lengthForCompare !== undefined) {
        return lengthForCompare !== Number(value);
      }
      if (typeof paramValue === "string" && typeof value === "string") {
        return paramValue.toLowerCase() !== value.toLowerCase();
      }
      return paramValue !== value;
    case ">":
      if (isLengthCompare && lengthForCompare !== undefined) {
        return lengthForCompare > Number(value);
      }
      return Number(paramValue) > Number(value);
    case "<":
      if (isLengthCompare && lengthForCompare !== undefined) {
        return lengthForCompare < Number(value);
      }
      return Number(paramValue) < Number(value);
    case ">=":
      if (isLengthCompare && lengthForCompare !== undefined) {
        return lengthForCompare >= Number(value);
      }
      return Number(paramValue) >= Number(value);
    case "<=":
      if (isLengthCompare && lengthForCompare !== undefined) {
        return lengthForCompare <= Number(value);
      }
      return Number(paramValue) <= Number(value);
    case "has":
      if (paramValue === undefined) {
        return false;
      }
      if (typeof paramValue === "boolean") {
        return paramValue;
      }
      return paramValue !== null && paramValue !== "";
    default:
      return false;
  }
}

/**
 * Compare size (for size operator)
 */
function compareSize(
  actual: number,
  operator: string,
  expected: number,
): boolean {
  switch (operator) {
    case "==":
      return actual === expected;
    case "!=":
      return actual !== expected;
    case ">":
      return actual > expected;
    case "<":
      return actual < expected;
    case ">=":
      return actual >= expected;
    case "<=":
      return actual <= expected;
    default:
      return false;
  }
}

/**
 * When no rule matches, return first failure reason (for debugging)
 */
export function getMatchFailureReason(
  params: Record<string, any>,
  rules: SKUMatchRule[],
): string | null {
  const matchParams = { ...params };
  for (const rule of rules) {
    const matched = matchSKURule(matchParams, rule);
    if (matched) return null;
    for (const cond of rule.conditions ?? []) {
      const ok = matchCondition(matchParams, cond);
      if (!ok) {
        const field = cond.field ?? "?";
        const paramVal = matchParams[field];
        const expect = Array.isArray(cond.value)
          ? `[${(cond.value as any[]).join(", ")}]`
          : cond.value;
        return `SKU ${rule.skuCode}: condition ${field} ${cond.operator} ${JSON.stringify(expect)} not satisfied (params.${field}=${JSON.stringify(paramVal)})`;
      }
    }
  }
  return rules.length === 0 ? "No SKU rules" : "No rule matched";
}

/**
 * Match SKU: find SKU code by parameter values
 */
export function matchSKU(
  params: Record<string, any>,
  rules: SKUMatchRule[],
): string | null {
  const matchParams = { ...params };
  if (matchParams.resolution && !matchParams.size) {
    const sizeValues = getSizeFromResolution(matchParams.resolution);
    for (const sizeValue of sizeValues) {
      const testParams = { ...matchParams, size: sizeValue };
      for (const rule of rules) {
        if (matchSKURule(testParams, rule)) {
          return rule.skuCode;
        }
      }
    }
  }

  const matchedRules: SKUMatchRule[] = [];
  for (const rule of rules) {
    const matched = matchSKURule(matchParams, rule);
    if (matched) {
      matchedRules.push(rule);
    }
  }

  if (matchedRules.length > 1) {
    const mostSpecific = [...matchedRules].sort(
      (a, b) => (b.conditions?.length ?? 0) - (a.conditions?.length ?? 0),
    );
    if (
      (mostSpecific[0].conditions?.length ?? 0) >
      (mostSpecific[mostSpecific.length - 1].conditions?.length ?? 0)
    ) {
      return mostSpecific[0].skuCode;
    }
  }

  if (matchedRules.length > 1 && matchParams.duration !== undefined) {
    const durationStr = matchParams.duration.toString();
    const matchedRule = matchedRules.find((rule) => {
      const match = rule.skuCode.match(/_(\d+)S$/);
      if (match) {
        const skuDuration = match[1];
        return skuDuration === durationStr;
      }
      return false;
    });

    if (matchedRule) {
      return matchedRule.skuCode;
    }
  }

  if (matchedRules.length === 1) {
    return matchedRules[0].skuCode;
  }

  if (matchedRules.length > 1) {
    return matchedRules[0].skuCode;
  }

  return null;
}

/**
 * Get size value list from resolution
 */
function getSizeFromResolution(resolution: string): string[] {
  const sizeMap: Record<string, string[]> = {
    "480P": ["832*480", "480*832", "624*624"],
    "720P": ["1280*720", "720*1280", "960*960", "1088*832", "832*1088"],
    "1080P": ["1920*1080", "1080*1920", "1440*1440", "1632*1248", "1248*1632"],
  };

  return sizeMap[resolution] || [];
}
