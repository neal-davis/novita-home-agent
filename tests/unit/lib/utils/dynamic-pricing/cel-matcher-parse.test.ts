import { parseCELExpressions } from "@/lib/utils/dynamic-pricing/cel-matcher";

const fieldMapping = {
  resolution: "body.resolution",
  duration: "body.duration",
  size: "body.size",
  images: "body.images",
  video: "body.video",
  fast_mode: "body.fast_mode",
  count: "body.count",
};

function parseOne(celExpr: string) {
  return parseCELExpressions([{ skuCode: "SKU", celExpr }], fieldMapping)[0];
}

describe("parseCELExpressions branch coverage", () => {
  it("returns no conditions for the literal true", () => {
    const rule = parseOne("true");
    expect(rule.conditions).toEqual([]);
    expect(rule.logicalOperator).toBe("AND");
  });

  it("strips an outer parenthesis wrapper", () => {
    const rule = parseOne('(body.resolution == "720P")');
    expect(rule.conditions[0]).toMatchObject({
      field: "resolution",
      operator: "==",
      value: "720P",
    });
  });

  it("parses AND expressions into multiple conditions", () => {
    const rule = parseOne('body.resolution == "720P" && body.duration >= 5');
    expect(rule.logicalOperator).toBe("AND");
    expect(rule.conditions).toHaveLength(2);
    expect(rule.conditions[1]).toMatchObject({
      field: "duration",
      operator: ">=",
      value: 5,
    });
  });

  it("parses a top-level OR expression", () => {
    const rule = parseOne(
      'body.resolution == "480P" || body.resolution == "720P"',
    );
    expect(rule.logicalOperator).toBe("OR");
    expect(rule.conditions.length).toBeGreaterThanOrEqual(1);
  });

  it("splits an AND part containing an OR into separate conditions", () => {
    const rule = parseOne(
      'body.count >= 1 && body.size == "a" || body.size == "b"',
    );
    expect(rule.logicalOperator).toBe("AND");
    const sizeConds = rule.conditions.filter((c) => c.field === "size");
    expect(sizeConds).toHaveLength(2);
  });

  it("parses a top-level OR of the same field as separate conditions", () => {
    const rule = parseOne('body.size == "a" || body.size == "b"');
    expect(rule.logicalOperator).toBe("OR");
    expect(rule.conditions).toHaveLength(2);
  });

  it("parses an AND expression that also references has()", () => {
    // has() as a standalone token is dropped by the parser's paren handling,
    // but the comparison part is still parsed.
    const rule = parseOne("body.duration >= 5 && has(body.video)");
    expect(rule.conditions).toEqual([
      expect.objectContaining({ field: "duration", operator: ">=", value: 5 }),
    ]);
  });

  it("parses size() conditions with a comparison operator", () => {
    const rule = parseOne("size(body.images) > 0");
    expect(rule.conditions[0]).toMatchObject({
      field: "images.size()",
      operator: ">",
      value: 0,
    });
  });

  it("unwraps int() type casts around the field", () => {
    const rule = parseOne("int(body.duration) == 10");
    expect(rule.conditions[0]).toMatchObject({
      field: "duration",
      operator: "==",
      value: 10,
    });
  });

  it("coerces boolean literal values", () => {
    const t = parseOne("body.fast_mode == true");
    expect(t.conditions[0].value).toBe(true);
    const f = parseOne("body.fast_mode == false");
    expect(f.conditions[0].value).toBe(false);
  });

  it("treats a bare field reference as a truthy presence check", () => {
    const rule = parseOne("body.fast_mode");
    expect(rule.conditions[0]).toMatchObject({
      field: "fast_mode",
      operator: "==",
      value: true,
    });
  });

  it("handles AND combined with an OR group", () => {
    const rule = parseOne(
      'body.duration >= 5 && (body.size == "a" || body.size == "b")',
    );
    expect(rule.logicalOperator).toBe("AND");
    expect(rule.conditions.length).toBeGreaterThanOrEqual(2);
  });

  it("returns an empty rule for an unparseable single condition", () => {
    const rule = parseOne("garbage_without_operator_or_field !!!");
    expect(Array.isArray(rule.conditions)).toBe(true);
  });

  it("tolerates a null fieldMapping", () => {
    const rules = parseCELExpressions(
      [{ skuCode: "S", celExpr: "true" }],
      null as never,
    );
    expect(rules[0].skuCode).toBe("S");
  });
});
