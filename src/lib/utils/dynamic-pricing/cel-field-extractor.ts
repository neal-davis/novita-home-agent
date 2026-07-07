/**
 * Extract field mapping from CEL expressions (for auto-generating pricingConfig.fieldMapping)
 */

/**
 * Extract field paths from CEL expression
 * e.g. "body.fast_mode == true" -> { fast_mode: "body.fast_mode" }, has(body.video) -> { video: "body.video" }
 */
export function extractFieldsFromCEL(celExpr: string): Record<string, string> {
  const fieldMapping: Record<string, string> = {};

  const fieldPatterns = [
    /(body|object)\.parameters\.([a-zA-Z_][a-zA-Z0-9_]*)/g,
    /(body|object)\.(?!parameters\.)([a-zA-Z_][a-zA-Z0-9_]*)/g,
  ];

  for (const pattern of fieldPatterns) {
    let match;
    while ((match = pattern.exec(celExpr)) !== null) {
      const fullPath = match[0];
      const fieldName = match[match.length - 1];

      if (
        !fieldMapping[fieldName] ||
        fullPath.length > fieldMapping[fieldName].length
      ) {
        fieldMapping[fieldName] = fullPath;
      }
    }
  }

  return fieldMapping;
}

/**
 * Extract field mapping from multiple CEL expressions (merge all fields)
 */
export function extractFieldsFromCELs(
  celExprs: string[],
): Record<string, string> {
  const mergedMapping: Record<string, string> = {};

  for (const celExpr of celExprs) {
    const fields = extractFieldsFromCEL(celExpr);
    for (const [fieldName, fieldPath] of Object.entries(fields)) {
      if (
        !mergedMapping[fieldName] ||
        fieldPath.length > mergedMapping[fieldName].length
      ) {
        mergedMapping[fieldName] = fieldPath;
      }
    }
  }

  return mergedMapping;
}

/**
 * Extract field mapping from SKU mappings
 */
export function extractFieldMappingFromSKUMappings(
  skuMappings: Array<{ celExpr: string }>,
): Record<string, string> {
  if (!skuMappings || skuMappings.length === 0) {
    return {};
  }

  const celExprs = skuMappings.map((mapping) => mapping.celExpr);
  return extractFieldsFromCELs(celExprs);
}
