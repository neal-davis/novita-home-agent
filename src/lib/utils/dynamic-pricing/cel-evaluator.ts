/**
 * Extended CEL expression evaluator
 * Supports custom functions: has, map, sum, int, etc.
 */

import {
  Environment,
  evaluate as evaluateStandard,
} from "@marcbachmann/cel-js";

// Create a global extended environment (singleton pattern to avoid repeated creation)
let extendedEnvironment: Environment | null = null;

/**
 * Get the extended CEL execution environment
 * Registers custom functions: has, int
 * Note: map and sum require special handling as they are implemented via method chaining
 */
function getExtendedEnvironment(): Environment {
  if (extendedEnvironment) {
    return extendedEnvironment;
  }

  // Consistent with global evaluate: variables not registered in the registry (like sku, body) are read from context and treated as dyn
  extendedEnvironment = new Environment({ unlistedVariablesAreDyn: true });

  // Note: has() function is already built-in in @marcbachmann/cel-js, no need to register
  // If custom behavior is needed, you can try to register, but it may conflict with the built-in function

  // Try to register int() function (if not built-in in the library)
  // Declare return type as double so that sku * int(body.duration) becomes double * double, avoiding "no such overload: dyn<double> * int"
  try {
    extendedEnvironment.registerFunction(
      "int(dyn): double",
      (value: any): number => {
        if (value === null || value === undefined) {
          return 0;
        }
        if (typeof value === "bigint") {
          return Number(value);
        }
        if (typeof value === "number") {
          return Math.floor(value);
        }
        if (typeof value === "string") {
          const num = parseFloat(value);
          return Math.floor(isNaN(num) ? 0 : num);
        }
        if (typeof value === "boolean") {
          return value ? 1 : 0;
        }
        return 0;
      },
    );
  } catch (error: any) {
    // If registration fails (possibly because the library already has int() built-in), ignore the error
  }

  return extendedEnvironment;
}

/**
 * Evaluate CEL expression (with extended function support)
 *
 * @param expr - CEL expression string
 * @param context - Execution context (variables)
 * @returns Expression evaluation result
 */
export function evaluateExtended(
  expr: string,
  context: Record<string, any>,
): any {
  // Check if special handling is needed for map().sum() pattern
  if (needsExtendedEvaluation(expr)) {
    try {
      return evaluateWithManualMap(expr, context);
    } catch (error: any) {
      // If manual processing fails, fall back to standard evaluate (consistent with original behavior)
      return evaluateStandard(expr, context);
    }
  }

  // When expression contains int(...), use extended environment directly to avoid int return type causing double * int error in standard environment
  if (/int\s*\(/.test(expr)) {
    const env = getExtendedEnvironment();
    return env.evaluate(expr, context);
  }

  // For other expressions, try standard evaluate first, use extended environment if it fails
  try {
    return evaluateStandard(expr, context);
  } catch (error: any) {
    const env = getExtendedEnvironment();
    return env.evaluate(expr, context);
  }
}

/**
 * Manually process expressions containing map().sum()
 * This is the core function that handles complex array mapping and sum operations
 */
function evaluateWithManualMap(
  expr: string,
  context: Record<string, any>,
): any {
  const env = getExtendedEnvironment();

  let processedExpr = expr;
  const mapResults = new Map<string, bigint>();
  let matchIndex = 0;

  // Collect all map().sum() patterns that need processing
  // Use a more reliable method: manually find .map( and its corresponding ).sum()
  const matches: Array<{
    fullMatch: string;
    arrayPath: string;
    varName: string;
    mapExpr: string;
    startIndex: number;
    endIndex: number;
  }> = [];

  // Find all positions of .map(
  let searchIndex = 0;
  while (searchIndex < expr.length) {
    const mapIndex = expr.indexOf(".map(", searchIndex);
    if (mapIndex === -1) break;

    // Look backward to find the array path (e.g., body.image_settings)
    let pathStart = mapIndex - 1;
    while (pathStart >= 0 && /[\w.]/.test(expr[pathStart])) {
      pathStart--;
    }
    pathStart++;
    const arrayPath = expr.substring(pathStart, mapIndex);

    // Find the content after map(
    const parenStart = mapIndex + 5; // Length of ".map("
    let parenCount = 1;
    let currentIndex = parenStart;
    let varName = "";
    let mapExprStart = -1;

    // Skip whitespace
    while (currentIndex < expr.length && /\s/.test(expr[currentIndex])) {
      currentIndex++;
    }

    // Read variable name (e.g., x)
    const varNameStart = currentIndex;
    while (currentIndex < expr.length && /[\w_]/.test(expr[currentIndex])) {
      currentIndex++;
    }
    varName = expr.substring(varNameStart, currentIndex);

    // Skip whitespace and comma
    while (
      currentIndex < expr.length &&
      (/\s/.test(expr[currentIndex]) || expr[currentIndex] === ",")
    ) {
      currentIndex++;
    }

    mapExprStart = currentIndex;

    // Find matching closing parenthesis (handle nested parentheses)
    while (currentIndex < expr.length && parenCount > 0) {
      if (expr[currentIndex] === "(") {
        parenCount++;
      } else if (expr[currentIndex] === ")") {
        parenCount--;
      }
      if (parenCount > 0) {
        currentIndex++;
      }
    }

    const mapExprEnd = currentIndex;
    let mapExpr = expr.substring(mapExprStart, mapExprEnd);

    // Clean up escape characters in mapExpr
    mapExpr = mapExpr
      .replace(/\\u003E/g, ">")
      .replace(/\\u003C/g, "<")
      .replace(/\\u0026/g, "&")
      .replace(/\\u0027/g, "'")
      .replace(/\\u0022/g, '"');

    // Check if followed by .sum()
    const afterMap = expr.substring(mapExprEnd + 1).trim();
    if (afterMap.startsWith(".sum()")) {
      const endIndex = mapExprEnd + 1 + ".sum()".length;
      const fullMatch = expr.substring(pathStart, endIndex);

      matches.push({
        fullMatch,
        arrayPath,
        varName,
        mapExpr,
        startIndex: pathStart,
        endIndex,
      });

      searchIndex = endIndex;
    } else {
      searchIndex = mapIndex + 5;
    }
  }

  // If no map().sum() pattern is found, use standard evaluate directly
  // This may be a false positive case, maintain consistency with original behavior
  if (matches.length === 0) {
    return evaluateStandard(expr, context);
  }

  // Process from back to front to avoid position offset
  // Use an array to store replacement operations, then apply them all at once
  const replacements: Array<{
    start: number;
    end: number;
    replacement: string;
  }> = [];

  for (let i = matches.length - 1; i >= 0; i--) {
    const { fullMatch, arrayPath, varName, mapExpr, startIndex, endIndex } =
      matches[i];

    // Get array from context
    const array = getNestedValue(context, arrayPath);

    let sum: bigint;

    if (!Array.isArray(array)) {
      // If array doesn't exist or is not an array, return 0
      sum = BigInt(0);
    } else {
      // Execute map expression for each element in the array
      const mappedValues: bigint[] = [];
      for (const item of array) {
        // Create child context, include current element (as varName)
        // Note: Need to ensure variable name is passed correctly, CEL may need complete context structure
        const itemContext: Record<string, any> = {};

        // Copy original context (but exclude potentially conflicting variables)
        for (const [key, value] of Object.entries(context)) {
          itemContext[key] = value;
        }

        // Set map variable (as top-level variable, CEL can access directly)
        itemContext[varName] = item;

        // Execute map expression
        // Use standard evaluate instead of env.evaluate to ensure variables can be recognized correctly
        try {
          const mappedValue = evaluateStandard(mapExpr, itemContext);
          // Convert to bigint
          const numValue =
            typeof mappedValue === "bigint"
              ? mappedValue
              : BigInt(Math.floor(Number(mappedValue) || 0));
          mappedValues.push(numValue);
        } catch (error: any) {
          // Silently handle errors, use default value 0
          mappedValues.push(BigInt(0));
        }
      }

      // Calculate sum
      sum = mappedValues.reduce((acc, val) => acc + val, BigInt(0));
    }

    // Store result and record replacement operation
    const tempVar = `__map_sum_${matchIndex++}`;
    mapResults.set(tempVar, sum);
    replacements.push({
      start: startIndex,
      end: endIndex,
      replacement: tempVar,
    });
  }

  // Apply replacements from back to front to avoid position offset
  for (const { start, end, replacement } of replacements) {
    processedExpr =
      processedExpr.substring(0, start) +
      replacement +
      processedExpr.substring(end);
  }

  // Clean up escape characters (e.g., \u003E -> >)
  // Handle common Unicode escape sequences
  processedExpr = processedExpr
    .replace(/\\u003E/g, ">")
    .replace(/\\u003C/g, "<")
    .replace(/\\u0026/g, "&")
    .replace(/\\u0027/g, "'")
    .replace(/\\u0022/g, '"');

  // Add map results to context
  const extendedContext = {
    ...context,
    ...Object.fromEntries(mapResults),
  };

  // Execute processed expression
  // Use standard evaluate to execute processed expression to ensure context variables (like body) can be recognized correctly
  return evaluateStandard(processedExpr, extendedContext);
}

/**
 * Get value from nested object
 * Example: getNestedValue({ body: { image_settings: [...] } }, "body.image_settings")
 */
function getNestedValue(obj: any, path: string): any {
  const parts = path.split(".");
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

/**
 * Check if expression contains patterns that need special handling (e.g., map().sum())
 */
export function needsExtendedEvaluation(expr: string): boolean {
  // More precise check: must contain .map( followed by ).sum()
  // Use stricter pattern to avoid false positives
  // Check if there's .map( followed by any content (including nested parentheses), then ).sum()
  const hasMapSum = /\.map\s*\([^)]*(?:\([^)]*\)[^)]*)*\)\.sum\s*\(\)/.test(
    expr,
  );

  // If regex matching fails, try simpler method: check if both .map( and .sum() are present
  if (!hasMapSum) {
    const mapIndex = expr.indexOf(".map(");
    if (mapIndex !== -1) {
      const afterMap = expr.substring(mapIndex);
      // Check if .sum() exists after .map(
      return afterMap.includes(".sum()");
    }
  }

  return hasMapSum;
}
