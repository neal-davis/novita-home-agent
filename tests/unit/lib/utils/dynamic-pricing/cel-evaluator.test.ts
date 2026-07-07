jest.mock(
  "@marcbachmann/cel-js",
  () => {
    const getPath = (context: Record<string, any>, path: string): any => {
      if (/^-?\d+$/.test(path)) return Number(path);
      if (path in context) return context[path];
      return path.split(".").reduce((current, part) => {
        if (current === null || current === undefined || !(part in current)) {
          throw new Error(`missing path: ${path}`);
        }
        return current[part];
      }, context as any);
    };

    const evaluateSimple = (
      expression: string,
      context: Record<string, any>,
    ): any => {
      const expr = expression.trim();

      if (expr.includes(" && ")) {
        return expr
          .split(/\s+&&\s+/)
          .every((part) => Boolean(evaluateSimple(part, context)));
      }

      const greaterThan = expr.match(/^(.+)\s+>\s+(.+)$/);
      if (greaterThan) {
        return (
          evaluateSimple(greaterThan[1], context) >
          evaluateSimple(greaterThan[2], context)
        );
      }

      const equals = expr.match(/^(.+)\s+==\s+(.+)$/);
      if (equals) {
        return (
          String(evaluateSimple(equals[1], context)) ===
          String(evaluateSimple(equals[2], context))
        );
      }

      const multiply = expr.match(/^(.+)\s+\*\s+(.+)$/);
      if (multiply) {
        return (
          Number(evaluateSimple(multiply[1], context)) *
          Number(evaluateSimple(multiply[2], context))
        );
      }

      return getPath(context, expr);
    };

    class Environment {
      private functions = new Map<string, (value: any) => number>();

      constructor(_options?: unknown) {}

      registerFunction(signature: string, handler: (value: any) => number) {
        this.functions.set(signature.split("(")[0], handler);
        return this;
      }

      evaluate(expression: string, context: Record<string, any>) {
        const expr = expression.trim();
        const intExpr = expr.match(/^int\((.+)\)(?:\s+\*\s+(.+))?$/);
        if (intExpr) {
          const handler = this.functions.get("int");
          let rawValue;
          try {
            rawValue = getPath(context, intExpr[1]);
          } catch {
            rawValue = undefined;
          }
          const value = handler?.(rawValue) ?? 0;
          return intExpr[2] ? value * Number(intExpr[2]) : value;
        }
        return evaluateSimple(expr, context);
      }
    }

    return {
      Environment,
      evaluate: jest.fn(evaluateSimple),
    };
  },
  { virtual: true },
);

import {
  evaluateExtended,
  needsExtendedEvaluation,
} from "@/lib/utils/dynamic-pricing/cel-evaluator";

describe("extended CEL evaluator", () => {
  it("detects map-sum expressions without flagging normal expressions", () => {
    expect(
      needsExtendedEvaluation("body.items.map(item, item.tokens).sum()"),
    ).toBe(true);
    expect(
      needsExtendedEvaluation(
        "body.items.map(item, item.tokens * (item.weight + 1)).sum()",
      ),
    ).toBe(true);
    expect(needsExtendedEvaluation("body.items.map")).toBe(false);
    expect(needsExtendedEvaluation("body.duration * 1000")).toBe(false);
  });

  it("evaluates map-sum expressions over nested request body arrays", () => {
    const result = evaluateExtended(
      "body.images.map(image, image.width * image.height).sum()",
      {
        body: {
          images: [
            { width: 2, height: 3 },
            { width: 4, height: 5 },
          ],
        },
      },
    );

    expect(result).toBe(BigInt(26));
  });

  it("combines multiple map-sum replacements and escaped operators", () => {
    const result = evaluateExtended(
      "body.parts.map(part, part.tokens).sum() \\u003E 9 && body.parts.map(part, part.count).sum() == 3",
      {
        body: {
          parts: [
            { tokens: 4, count: 1 },
            { tokens: 6, count: 2 },
          ],
        },
      },
    );

    expect(result).toBe(true);
  });

  it("treats missing arrays and failed per-item expressions as zero", () => {
    expect(
      evaluateExtended("body.missing.map(item, item.tokens).sum()", {
        body: {},
      }),
    ).toBe(BigInt(0));

    expect(
      evaluateExtended("body.items.map(item, item.unknown.value).sum()", {
        body: {
          items: [{ tokens: 10 }, { tokens: 20 }],
        },
      }),
    ).toBe(BigInt(0));
  });

  it("uses extended int coercion for numeric, string, boolean and empty values", () => {
    expect(
      evaluateExtended("int(body.duration) * 2", {
        body: { duration: "3.8" },
      }),
    ).toBe(6);
    expect(
      evaluateExtended("int(body.enabled)", {
        body: { enabled: true },
      }),
    ).toBe(1);
    expect(evaluateExtended("int(body.missing)", { body: {} })).toBe(0);
  });
});
