import {
  extractEnumValues,
  extractPriceFactors,
} from "@/lib/utils/dynamic-pricing/openapi-parser";

const openapiSchema = JSON.stringify({
  openapi: "3.0.0",
  paths: {
    "/v3/model": {
      post: {
        requestBody: {
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Request" },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Request: {
        type: "object",
        properties: {
          duration: { type: "integer", enum: [5, 10], default: 5 },
          fast_mode: { type: "boolean", default: true },
          resolution: { type: "string", enum: ["480p", "720p"] },
          strength: { type: "number" },
        },
      },
    },
  },
});

describe("OpenAPI price factor extraction", () => {
  it("extracts enum and boolean factors with configured display order", () => {
    expect(
      extractPriceFactors(openapiSchema, {
        fieldMapping: {
          duration: "body.duration",
          fast_mode: "body.fast_mode",
          resolution: "body.resolution",
          strength: "body.strength",
        },
        priceFactors: {
          resolution: {
            column: { dataIndex: "resolution", order: 1, title: "Output" },
          },
          duration: {
            column: { dataIndex: "duration", order: 2, title: "Seconds" },
          },
        },
      }),
    ).toMatchObject([
      {
        displayConfig: { column: { dataIndex: "resolution", order: 1 } },
        name: "resolution",
        type: "enum",
        values: ["480p", "720p"],
      },
      {
        defaultValue: 5,
        displayConfig: { column: { dataIndex: "duration", order: 2 } },
        name: "duration",
        type: "enum",
        values: [5, 10],
      },
      {
        defaultValue: true,
        displayConfig: { column: { dataIndex: "mode", render: "mode" } },
        name: "fast_mode",
        type: "boolean",
        values: [true, false],
      },
    ]);
  });

  it("returns an empty list for invalid schemas and unsupported numeric factors", () => {
    const error = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(extractPriceFactors("{bad-json", { fieldMapping: {} })).toEqual([]);
    expect(
      extractPriceFactors(openapiSchema, {
        fieldMapping: { strength: "body.strength" },
      }),
    ).toEqual([]);

    error.mockRestore();
  });

  it("extracts enum values from nested schemas", () => {
    expect(
      extractEnumValues(
        {
          properties: { body: { properties: { size: { enum: ["a", "b"] } } } },
        },
        ["body", "size"],
      ),
    ).toEqual(["a", "b"]);
    expect(extractEnumValues({ properties: {} }, ["missing"])).toEqual([]);
  });
});
