/**
 * CEL expression value extractor
 * Extracts parameter values (e.g. duration, resolution, last_image) from CEL expressions
 * so that "one row per SKU" can still display resolution/duration/mode columns.
 *
 * How many SKUs => how many rows; row columns from CEL + derivers.
 */

/**
 * Extract parameter values from a single CEL expression.
 *
 * @param celExpr - CEL expression string
 * @param fieldMapping - optional field mapping (object.last_image -> last_image, etc.)
 * @returns extracted values, e.g. { resolution: "720p", service_tier: "default", generate_audio: true }
 */
export function extractValuesFromCELExpr(
  celExpr: string,
  fieldMapping?: Record<string, string>,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  if (!celExpr || celExpr.trim() === "") {
    return values;
  }

  let expr = celExpr.trim().replace(/\\"/g, '"').replace(/\\'/g, "'");

  if (expr === "true") {
    return values;
  }

  expr = expr.replace(/^\((.+)\)$/, "$1").trim();
  const andParts = expr.split("&&").map((p) => p.trim());

  for (const part of andParts) {
    if (part.includes("||")) {
      const orParts = part.split("||").map((p) => p.trim());
      for (const orPart of orParts) {
        const extracted = extractValueFromSingleCondition(orPart, fieldMapping);
        if (extracted) {
          values[extracted.field] = extracted.value;
          break;
        }
      }
    } else {
      const extracted = extractValueFromSingleCondition(part, fieldMapping);
      if (extracted) {
        values[extracted.field] = extracted.value;
      } else {
        const hasExtracted = extractValueFromHasCondition(part, fieldMapping);
        if (hasExtracted) {
          values[hasExtracted.field] = hasExtracted.value;
        } else {
          const presenceExtracted = extractValueFromPresenceCondition(
            part,
            fieldMapping,
          );
          if (presenceExtracted) {
            values[presenceExtracted.field] = presenceExtracted.value;
          }
        }
      }
    }
  }

  return values;
}

function extractValueFromSingleCondition(
  conditionStr: string,
  fieldMapping?: Record<string, string>,
): { field: string; value: unknown } | null {
  conditionStr = conditionStr.replace(/^\(|\)$/g, "").trim();

  // 支持 body.parameters.size in ["832*480", "480*832", ...] 的解析
  const inMatch = conditionStr.match(/^(.+?)\s+in\s+\[([\s\S]*)\]$/);
  if (inMatch) {
    const left = inMatch[1].trim();
    const arrayStr = inMatch[2];
    const fieldName = extractFieldName(left, fieldMapping);
    if (!fieldName) return null;
    const values: string[] = [];
    const itemRegex = /["']([^"']*)["']/g;
    let itemMatch;
    while ((itemMatch = itemRegex.exec(arrayStr)) !== null) {
      values.push(itemMatch[1].replace(/\\"/g, '"'));
    }
    if (values.length > 0) {
      return { field: fieldName, value: values[0] };
    }
  }

  const operators = ["==", "!=", ">=", "<=", ">", "<"];
  for (const op of operators) {
    if (conditionStr.includes(op)) {
      const parts = conditionStr.split(op).map((p) => p.trim());
      if (parts.length === 2) {
        const left = parts[0];
        const right = parts[1].replace(/\)+$/, "").trim();

        const fieldName = extractFieldName(left, fieldMapping);
        if (!fieldName) continue;

        let value: unknown = right;
        if (
          (typeof value === "string" &&
            value.startsWith('"') &&
            value.endsWith('"')) ||
          (typeof value === "string" &&
            value.startsWith("'") &&
            value.endsWith("'"))
        ) {
          value = (value as string).slice(1, -1);
        } else if (
          typeof value === "string" &&
          ((value.startsWith('\\"') && value.endsWith('\\"')) ||
            (value.startsWith("\\'") && value.endsWith("\\'")))
        ) {
          value = (value as string).slice(2, -2);
        } else if (
          typeof value === "string" &&
          !Number.isNaN(Number((value as string).trim()))
        ) {
          value = Number((value as string).trim());
        } else if (
          typeof value === "string" &&
          (value as string).trim() === "true"
        ) {
          value = true;
        } else if (
          typeof value === "string" &&
          (value as string).trim() === "false"
        ) {
          value = false;
        }

        if (op === "==") {
          return { field: fieldName, value };
        }
        const isEmptyString = value === "" || value === '""' || value === '"';
        if (op === "!=" && isEmptyString) {
          return { field: fieldName, value: true };
        }
        if (op === ">=" || op === "<=" || op === ">" || op === "<") {
          return { field: fieldName, value };
        }
      }
    }
  }

  return null;
}

function extractValueFromPresenceCondition(
  conditionStr: string,
  fieldMapping?: Record<string, string>,
): { field: string; value: boolean } | null {
  const trimmed = conditionStr
    .trim()
    .replace(/^\((.*)\)$/, "$1")
    .trim();
  if (/(==|!=|>=|<=|>|<|\sin\s|\|\||&&)/.test(trimmed)) return null;
  const negated = trimmed.startsWith("!");
  const rest = negated ? trimmed.slice(1).trim() : trimmed;
  const match = rest.match(/^(object|body)\.([^.]+(?:\.[^.]+)*)$/);
  if (!match) return null;
  const pathPrefix = `${match[1]}.${match[2]}`;
  const fieldName = extractFieldName(pathPrefix, fieldMapping);
  if (!fieldName) return null;
  return { field: fieldName, value: !negated };
}

function extractValueFromHasCondition(
  conditionStr: string,
  fieldMapping?: Record<string, string>,
): { field: string; value: true } | null {
  const trimmed = conditionStr
    .trim()
    .replace(/^\((.*)\)$/, "$1")
    .trim();
  const match = trimmed.match(/^has\s*\(\s*(object|body)\.([^)\s]+)\s*\)$/);
  if (!match) return null;
  const pathPrefix = `${match[1]}.${match[2]}`;
  const fieldName = extractFieldName(pathPrefix, fieldMapping);
  if (!fieldName) return null;
  return { field: fieldName, value: true };
}

function extractFieldName(
  path: string,
  fieldMapping?: Record<string, string>,
): string | null {
  const normalizedPath = path.replace(/^(object|body)\./, "");

  if (fieldMapping) {
    for (const [fieldName, fieldPath] of Object.entries(fieldMapping)) {
      const normalizedFieldPath = fieldPath.replace(/^(object|body)\./, "");
      if (normalizedFieldPath === normalizedPath) return fieldName;
    }
    if (fieldMapping[normalizedPath]) return normalizedPath;
  }

  const parts = normalizedPath.split(".");
  return parts[parts.length - 1] || null;
}
