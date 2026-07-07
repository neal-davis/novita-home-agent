import {
  filterEmptyFields,
  flattenRequiredFields,
  flattenSchema,
  generateDefaultFormData,
  getDefaultValue,
  getValueByFlattenedKey,
  parseOpenAPISchema,
  parseRawListItem,
  unflattenFormData,
  validateField,
} from "@/app/models-console/multimodal-playground/utils/schemaParser";

const nestedSchema = {
  input: {
    type: "object",
    required: ["prompt"],
    properties: {
      prompt: {
        type: "string",
        minLength: 3,
      },
      options: {
        type: "object",
        required: ["steps"],
        properties: {
          steps: {
            type: "integer",
            minimum: 1,
            maximum: 50,
          },
        },
      },
    },
  },
  seed: {
    type: "integer",
    default: 42,
  },
  tags: {
    type: "array",
    minItems: 1,
    maxItems: 2,
  },
} as any;

describe("multimodal schema parser", () => {
  it("parses OpenAPI request schema, resolves refs and flattens required fields", () => {
    const parsed = parseOpenAPISchema({
      info: { title: "Model", version: "1.0.0" },
      paths: {
        "/v1/task": {
          post: {
            description: "Create task",
            requestBody: {
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/CreateTaskRequest" },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          CreateTaskRequest: {
            type: "object",
            required: ["input"],
            properties: {
              input: { $ref: "#/components/schemas/Input" },
              images: {
                type: "array",
                items: { $ref: "#/components/schemas/Image" },
              },
            },
          },
          Input: nestedSchema.input,
          Image: {
            type: "object",
            properties: {
              url: { type: "string", pattern: "^https://" },
            },
          },
        },
      },
    } as any);

    expect(parsed).toMatchObject({
      endpoint: "/v1/task",
      method: "post",
      description: "Create task",
      requiredFields: ["input", "input.prompt", "input.options.steps"],
    });
    expect(parsed.requestSchema["input.prompt"]).toEqual({
      type: "string",
      minLength: 3,
    });
    expect(parsed.requestSchema.images).toMatchObject({
      type: "array",
      items: {
        type: "object",
        properties: {
          url: { type: "string", pattern: "^https://" },
        },
      },
    });
  });

  it("flattens nested schema and required fields without mutating values", () => {
    expect(flattenSchema(nestedSchema)).toEqual({
      "input.prompt": { type: "string", minLength: 3 },
      "input.options.steps": {
        type: "integer",
        minimum: 1,
        maximum: 50,
      },
      seed: { type: "integer", default: 42 },
      tags: { type: "array", minItems: 1, maxItems: 2 },
    });

    expect(flattenRequiredFields(nestedSchema, ["input"])).toEqual([
      "input",
      "input.prompt",
      "input.options.steps",
    ]);
  });

  it("generates defaults only for explicit defaults and required fields", () => {
    expect(getDefaultValue({ type: "string" } as any, true)).toBe("");
    expect(getDefaultValue({ type: "number", minimum: 2 } as any, true)).toBe(
      2,
    );
    expect(getDefaultValue({ type: "boolean" } as any, true)).toBe(false);
    expect(getDefaultValue({ type: "array" } as any, true)).toEqual([]);
    expect(getDefaultValue({ type: "object" } as any, true)).toBeUndefined();
    expect(getDefaultValue({ type: "string" } as any, false)).toBeUndefined();
    expect(getDefaultValue({ type: "string", default: "x" } as any)).toBe("x");

    expect(
      generateDefaultFormData(nestedSchema, [
        "input.prompt",
        "input.options.steps",
      ]),
    ).toEqual({
      "input.prompt": "",
      "input.options.steps": 1,
      seed: 42,
    });
  });

  it("validates required, numeric, string and array constraints", () => {
    expect(validateField("", { type: "string" } as any, true)).toBe(
      "This field is required",
    );
    expect(
      validateField("ab", { type: "string", minLength: 3 } as any, true),
    ).toBe("Length cannot be less than 3 characters");
    expect(
      validateField("abcd", { type: "string", maxLength: 3 } as any, true),
    ).toBe("Length cannot exceed 3 characters");
    expect(
      validateField(
        "ftp://x",
        { type: "string", pattern: "^https://" } as any,
        true,
      ),
    ).toBe("Invalid format");
    expect(validateField("1", { type: "number" } as any, true)).toBe(
      "Must be a valid number",
    );
    expect(validateField(0, { type: "integer", minimum: 1 } as any, true)).toBe(
      "Cannot be less than 1",
    );
    expect(
      validateField(11, { type: "integer", maximum: 10 } as any, true),
    ).toBe("Cannot be greater than 10");
    expect(validateField("x", { type: "array" } as any, true)).toBe(
      "Must be an array",
    );
    expect(validateField([], { type: "array", minItems: 1 } as any, true)).toBe(
      "At least 1 items required",
    );
    expect(
      validateField([1, 2, 3], { type: "array", maxItems: 2 } as any, true),
    ).toBe("At most 2 items allowed");
    expect(
      validateField(undefined, { type: "array" } as any, false),
    ).toBeNull();
  });

  it("converts between flat and nested form data and removes optional empty values", () => {
    const flat = {
      "input.prompt": "hello",
      "input.options.steps": 20,
      optional: "",
      optionalArray: [],
      optionalObject: {},
      seed: 0,
    };

    expect(unflattenFormData(flat)).toEqual({
      input: {
        prompt: "hello",
        options: {
          steps: 20,
        },
      },
      optional: "",
      optionalArray: [],
      optionalObject: {},
      seed: 0,
    });

    expect(getValueByFlattenedKey("input.prompt", flat)).toBe("hello");
    expect(
      getValueByFlattenedKey("input.options.steps", unflattenFormData(flat)),
    ).toBe(20);
    expect(
      getValueByFlattenedKey("input.missing", { input: null }),
    ).toBeUndefined();

    expect(filterEmptyFields(flat, ["input.prompt", "optional"])).toEqual({
      input: {
        prompt: "hello",
        options: {
          steps: 20,
        },
      },
      optional: "",
      seed: 0,
    });
  });

  it("normalizes raw list items and returns a fallback model on invalid config", () => {
    const parsed = parseRawListItem({
      modelConfig: {
        config: {
          category: "image_gen",
          async: true,
          openapiSchema: JSON.stringify({
            info: { title: "Model", version: "1.0.0" },
            paths: {},
            components: { schemas: {} },
          }),
        },
      },
      fusionConfig: {
        name: "model",
        displayName: "Model",
        description: "Description",
        examples: JSON.stringify([{ request: { prompt: "x" }, response: {} }]),
        markdown: "# Model",
      },
    } as any);

    expect(parsed).toMatchObject({
      name: "model",
      displayName: "Model",
      category: "image_gen",
      async: true,
      description: "Description",
      markdown: "# Model",
      examples: [{ request: { prompt: "x" }, response: {} }],
    });

    const consoleError = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    expect(
      parseRawListItem({
        modelConfig: { config: {} },
        fusionConfig: {},
      } as any),
    ).toMatchObject({
      name: "Error Loading Model",
      displayName: "Error Loading Model",
      async: false,
    });
    consoleError.mockRestore();
  });
});
