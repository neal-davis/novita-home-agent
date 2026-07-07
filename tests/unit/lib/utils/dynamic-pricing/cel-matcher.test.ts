import {
  getMatchFailureReason,
  matchSKU,
  matchSKURule,
  parseCELExpressions,
} from "@/lib/utils/dynamic-pricing/cel-matcher";

const fieldMapping = {
  duration: "body.duration",
  images: "body.images",
  resolution: "body.resolution",
  size: "body.size",
};

describe("CEL matcher", () => {
  it("parses CEL expressions and matches params case-insensitively", () => {
    const rules = parseCELExpressions(
      [
        {
          skuCode: "SKU_720P_5S",
          celExpr:
            'body.resolution == "720P" && int(body.duration) == 5 && size(body.images) > 0',
        },
      ],
      fieldMapping,
    );

    expect(rules[0]).toMatchObject({
      logicalOperator: "AND",
      skuCode: "SKU_720P_5S",
    });
    expect(
      matchSKURule(
        { duration: 5, images: ["a.png"], resolution: "720p" },
        rules[0],
      ),
    ).toBe(true);
  });

  it("matches OR rules and prefers the most specific matched SKU", () => {
    const rules = parseCELExpressions(
      [
        { skuCode: "SKU_ANY", celExpr: 'body.resolution == "720P"' },
        {
          skuCode: "SKU_720P_10S",
          celExpr: 'body.resolution == "720P" && body.duration == 10',
        },
      ],
      fieldMapping,
    );

    expect(matchSKU({ duration: 10, resolution: "720p" }, rules)).toBe(
      "SKU_720P_10S",
    );
  });

  it("maps resolution to known size aliases when size is absent", () => {
    const rules = parseCELExpressions(
      [{ skuCode: "SKU_SIZE", celExpr: 'body.size == "1280*720"' }],
      fieldMapping,
    );

    expect(matchSKU({ resolution: "720P" }, rules)).toBe("SKU_SIZE");
  });

  it("returns a useful failure reason", () => {
    const rules = parseCELExpressions(
      [{ skuCode: "SKU_SHORT", celExpr: "body.duration <= 3" }],
      fieldMapping,
    );

    expect(getMatchFailureReason({ duration: 5 }, rules)).toContain(
      "SKU_SHORT",
    );
    expect(getMatchFailureReason({ duration: 2 }, rules)).toBeNull();
    expect(getMatchFailureReason({}, [])).toBe("No SKU rules");
  });

  it("matches grouped OR conditions with an AND guard", () => {
    const rules = parseCELExpressions(
      [
        {
          skuCode: "SKU_RESOLUTION_DURATION",
          celExpr:
            '(body.resolution == "480P" || body.resolution == "720P") && body.duration >= 5',
        },
      ],
      fieldMapping,
    );

    expect(rules[0]).toMatchObject({
      logicalOperator: "AND",
      conditions: expect.arrayContaining([
        expect.objectContaining({ field: "resolution", value: "480P" }),
        expect.objectContaining({ field: "resolution", value: "720P" }),
        expect.objectContaining({
          field: "duration",
          operator: ">=",
          value: 5,
        }),
      ]),
    });
    expect(matchSKURule({ duration: 5, resolution: "720p" }, rules[0])).toBe(
      true,
    );
    expect(matchSKURule({ duration: 4, resolution: "720p" }, rules[0])).toBe(
      false,
    );
    expect(matchSKURule({ duration: 6, resolution: "1080P" }, rules[0])).toBe(
      false,
    );
  });

  it("handles nested has and size paths through field mapping", () => {
    const rules = parseCELExpressions(
      [
        {
          skuCode: "SKU_NESTED",
          celExpr:
            "has(body.input.prompt) == true && size(body.input.images) >= 2",
        },
      ],
      {
        imageCount: "body.input.images",
        prompt: "body.input.prompt",
      },
    );

    expect(rules[0].conditions).toEqual([
      expect.objectContaining({
        field: "prompt",
        operator: "has",
        path: "body.input.prompt",
      }),
      expect.objectContaining({
        field: "imageCount.size()",
        operator: ">=",
        path: "body.input.images",
        value: 2,
      }),
    ]);
    expect(
      matchSKURule(
        { imageCount: ["a.png", "b.png"], prompt: "draw" },
        rules[0],
      ),
    ).toBe(true);
    expect(
      matchSKURule({ imageCount: ["a.png"], prompt: "draw" }, rules[0]),
    ).toBe(false);
    expect(
      matchSKURule({ imageCount: ["a.png", "b.png"], prompt: "" }, rules[0]),
    ).toBe(false);
  });

  it("handles boolean presence conditions and missing false inputs", () => {
    const presenceRules = parseCELExpressions(
      [{ skuCode: "SKU_AUDIO", celExpr: "body.generate_audio" }],
      { generate_audio: "body.generate_audio" },
    );
    const falseRules = parseCELExpressions(
      [{ skuCode: "SKU_NO_WATERMARK", celExpr: "body.watermark == false" }],
      { watermark: "body.watermark" },
    );

    expect(matchSKURule({ generate_audio: true }, presenceRules[0])).toBe(true);
    expect(matchSKURule({ generate_audio: false }, presenceRules[0])).toBe(
      false,
    );
    expect(matchSKURule({}, presenceRules[0])).toBe(false);

    expect(matchSKURule({}, falseRules[0])).toBe(true);
    expect(matchSKURule({ watermark: false }, falseRules[0])).toBe(true);
    expect(matchSKURule({ watermark: true }, falseRules[0])).toBe(false);
  });

  it("falls back to normalized paths and uses duration suffixes to break ties", () => {
    const qualityRules = parseCELExpressions(
      [{ skuCode: "SKU_STANDARD", celExpr: 'body.quality == "standard"' }],
      undefined as any,
    );
    const durationRules = parseCELExpressions(
      [
        { skuCode: "VIDEO_5S", celExpr: "true" },
        { skuCode: "VIDEO_10S", celExpr: "true" },
      ],
      fieldMapping,
    );

    expect(qualityRules[0].conditions).toEqual([
      expect.objectContaining({ field: "quality", value: "standard" }),
    ]);
    expect(matchSKURule({ quality: "STANDARD" }, qualityRules[0])).toBe(true);
    expect(matchSKU({ duration: 10 }, durationRules)).toBe("VIDEO_10S");
  });
});
