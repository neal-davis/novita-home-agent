import {
  filterEmptyFields,
  getDefaultValue,
  parseOpenAPISchema,
  parseRawListItem,
  validateField,
} from "@/app/models-console/multimodal-playground/utils/schemaParser";

describe("multimodal schema parser (more branches)", () => {
  it("resolves nested $ref via array items and anyOf/oneOf/allOf", () => {
    const parsed = parseOpenAPISchema({
      info: { title: "M", version: "1" },
      paths: {
        "/v1/task": {
          post: {
            requestBody: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Req" },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Req: {
            type: "object",
            required: [],
            properties: {
              // array whose items is itself a $ref (resolveSchemaRefs array branch)
              list: {
                type: "array",
                items: { $ref: "#/components/schemas/Leaf" },
              },
              // array whose items is inline (else branch -> resolveSchemaRefs)
              plain: {
                type: "array",
                items: { type: "string" },
              },
              // anyOf with a $ref to exercise the anyOf/oneOf/allOf map
              choice: {
                anyOf: [{ $ref: "#/components/schemas/Leaf" }],
              },
            },
          },
          Leaf: { type: "string", description: "leaf" },
        },
      },
    } as any);

    expect(parsed.requestSchema.list).toMatchObject({
      type: "array",
      items: { type: "string", description: "leaf" },
    });
    expect(parsed.requestSchema.plain).toMatchObject({
      type: "array",
      items: { type: "string" },
    });
    expect(parsed.requestSchema.choice).toMatchObject({
      anyOf: [{ type: "string", description: "leaf" }],
    });
  });

  it("reads inline requestBody.properties when there is no schema $ref", () => {
    const parsed = parseOpenAPISchema({
      info: { title: "M", version: "1" },
      paths: {
        "/v1/inline": {
          post: {
            requestBody: {
              content: {
                "application/json": {
                  schema: {
                    properties: {
                      prompt: { type: "string" },
                    },
                    required: ["prompt"],
                  },
                },
              },
            },
          },
        },
      },
      components: { schemas: {} },
    } as any);

    expect(parsed.endpoint).toBe("/v1/inline");
    expect(parsed.requestSchema.prompt).toEqual({ type: "string" });
    expect(parsed.requiredFields).toContain("prompt");
  });

  it("defaults endpoint/method and tolerates a missing schema name", () => {
    const empty = parseOpenAPISchema({
      info: { title: "M", version: "1" },
      paths: {},
      components: { schemas: {} },
    } as any);
    expect(empty.endpoint).toBe("");
    expect(empty.method).toBe("post");
    expect(empty.requestSchema).toEqual({});
  });

  it("returns null for required object default and unknown-type default", () => {
    expect(getDefaultValue({ type: "object" } as any, true)).toBeUndefined();
    expect(getDefaultValue({ type: "weird" } as any, true)).toBeNull();
  });

  it("skips validation for empty optional arrays and objects", () => {
    expect(
      validateField([], { type: "array", minItems: 5 } as any, false),
    ).toBeNull();
    expect(validateField({}, { type: "object" } as any, false)).toBeNull();
  });

  it("passes validation for in-range numbers, strings and arrays", () => {
    expect(
      validateField(
        5,
        { type: "integer", minimum: 1, maximum: 10 } as any,
        true,
      ),
    ).toBeNull();
    expect(
      validateField(
        "abc",
        { type: "string", minLength: 1, maxLength: 5 } as any,
        true,
      ),
    ).toBeNull();
    expect(
      validateField(
        [1, 2],
        { type: "array", minItems: 1, maxItems: 3 } as any,
        true,
      ),
    ).toBeNull();
  });

  it("treats empty objects as empty in filterEmptyFields but keeps required empties", () => {
    const out = filterEmptyFields({ keepObj: {}, dropObj: {}, present: "x" }, [
      "keepObj",
    ]);
    // required empty object retained, optional empty object dropped
    expect(out).toHaveProperty("keepObj");
    expect(out).not.toHaveProperty("dropObj");
    expect(out).toHaveProperty("present", "x");
  });

  it("accepts an already-parsed openapiSchema object", () => {
    const parsed = parseRawListItem({
      modelConfig: {
        config: {
          category: "audio_gen",
          async: false,
          openapiSchema: {
            info: { title: "M", version: "1" },
            paths: {},
            components: { schemas: {} },
          },
        },
      },
      fusionConfig: {
        name: "audio",
        displayName: "Audio",
        // no examples / no markdown / no description -> default branches
      },
    } as any);

    expect(parsed).toMatchObject({
      name: "audio",
      category: "audio_gen",
      async: false,
      description: "",
      markdown: "",
      examples: [],
    });
  });

  it("returns the fallback model when openapiSchema string is invalid JSON", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const parsed = parseRawListItem({
      modelConfig: {
        config: { category: "image_gen", async: false, openapiSchema: "{bad" },
      },
      fusionConfig: { name: "x", displayName: "X" },
    } as any);
    expect(parsed.name).toBe("Error Loading Model");
    consoleError.mockRestore();
  });

  it("returns the fallback model when examples string is invalid JSON", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();
    const parsed = parseRawListItem({
      modelConfig: {
        config: {
          category: "image_gen",
          async: false,
          openapiSchema: {
            info: { title: "M", version: "1" },
            paths: {},
            components: { schemas: {} },
          },
        },
      },
      fusionConfig: { name: "x", displayName: "X", examples: "{bad" },
    } as any);
    expect(parsed.name).toBe("Error Loading Model");
    consoleError.mockRestore();
  });
});
