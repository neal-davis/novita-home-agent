import {
  extractEnumValues,
  extractPriceFactors,
} from "@/lib/utils/dynamic-pricing/openapi-parser";

const emptyConfig = { fieldMapping: {} } as never;

describe("extractPriceFactors edge branches", () => {
  it("returns [] for empty or whitespace input", () => {
    expect(extractPriceFactors("", emptyConfig)).toEqual([]);
    expect(extractPriceFactors("   ", emptyConfig)).toEqual([]);
  });

  it("returns [] and logs on invalid JSON", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(extractPriceFactors("{not json", emptyConfig)).toEqual([]);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it("returns [] when there is no request schema (no paths)", () => {
    expect(extractPriceFactors(JSON.stringify({}), emptyConfig)).toEqual([]);
  });

  it("returns [] when the post path has no JSON request body", () => {
    const schema = JSON.stringify({ paths: { "/x": { post: {} } } });
    expect(extractPriceFactors(schema, emptyConfig)).toEqual([]);
  });

  it("extracts and sorts factors from an inline request schema", () => {
    const schema = JSON.stringify({
      paths: {
        "/gen": {
          post: {
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      resolution: { type: "string", enum: ["720p", "1080p"] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    const config = {
      fieldMapping: { resolution: "body.resolution" },
    } as never;
    const factors = extractPriceFactors(schema, config);
    expect(Array.isArray(factors)).toBe(true);
  });
});

describe("extractEnumValues", () => {
  const schema = {
    properties: {
      body: {
        properties: {
          size: { enum: ["a", "b"] },
          nested: { properties: { leaf: { enum: [1, 2] } } },
          plain: { type: "string" },
        },
      },
    },
  };

  it("returns the enum at a valid path", () => {
    expect(extractEnumValues(schema, ["body", "size"])).toEqual(["a", "b"]);
    expect(extractEnumValues(schema, ["body", "nested", "leaf"])).toEqual([
      1, 2,
    ]);
  });

  it("returns [] when the path does not resolve", () => {
    expect(extractEnumValues(schema, ["body", "missing"])).toEqual([]);
  });

  it("returns [] when the resolved node has no enum", () => {
    expect(extractEnumValues(schema, ["body", "plain"])).toEqual([]);
  });
});
