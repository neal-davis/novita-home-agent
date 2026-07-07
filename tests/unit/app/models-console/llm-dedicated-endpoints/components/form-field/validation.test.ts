import {
  LORA_ROUTE_DUPLICATE_ERROR_MESSAGE,
  createAdvancedScalingSchema,
  createAutoscalingSchema,
  createCompleteFormSchema,
  createEndpointNameSchema,
  createEngineSchema,
  createModelSchema,
  getDuplicateLoraRouteIndexes,
  getLoraEffectiveRoute,
  loraAdapterItemSchema,
  modelSchema,
  normalizeEndpointName,
  validateControlledComponents,
} from "@/app/models-console/llm-dedicated-endpoints/components/form-field/validation";

describe("LLM dedicated endpoint form validation", () => {
  it("normalizes endpoint names into the API-safe format", () => {
    expect(normalizeEndpointName("  Llama 3.1 / 8B !! ")).toBe("llama-3-1-8b");
    expect(normalizeEndpointName("123")).toBe("endpoint-123");
    expect(normalizeEndpointName("---")).toBe("endpoint");
    expect(normalizeEndpointName(`a${"-".repeat(70)}`)).toBe("a");
  });

  it("detects duplicate effective LoRA routes", () => {
    expect(
      getLoraEffectiveRoute({
        modelAlias: " route-a ",
        modelId: "owner/model-a",
      }),
    ).toBe("route-a");
    expect(
      getLoraEffectiveRoute({
        modelAlias: "",
        modelId: "owner/model-a",
      }),
    ).toBe("owner/model-a");

    expect(
      Array.from(
        getDuplicateLoraRouteIndexes([
          { modelAlias: "same", modelId: "owner/a" },
          { modelId: "owner/b" },
          { modelAlias: "same", modelId: "owner/c" },
          { modelId: "owner/b" },
        ]),
      ).sort(),
    ).toEqual([0, 1, 2, 3]);
  });

  it("preprocesses LoRA and model values before schema validation", () => {
    expect(loraAdapterItemSchema.parse("owner/adapter")).toEqual({
      modelId: "owner/adapter",
    });
    expect(
      createModelSchema().parse({
        loraAdapters: ["owner/adapter"],
        modelId: {
          id: "owner/base",
        },
        token: "hf-token",
      }),
    ).toEqual({
      loraAdapters: [{ modelId: "owner/adapter" }],
      modelId: "owner/base",
      token: "hf-token",
    });
    expect(
      modelSchema.safeParse({
        modelId: {
          value: "owner/base-from-value",
        },
      }).success,
    ).toBe(true);

    const duplicate = createModelSchema().safeParse({
      loraAdapters: [
        { modelAlias: "dup", modelId: "owner/a" },
        { modelAlias: "dup", modelId: "owner/b" },
      ],
      modelId: "owner/base",
    });
    expect(duplicate.success).toBe(false);
    expect(duplicate.error?.errors[0].message).toBe(
      LORA_ROUTE_DUPLICATE_ERROR_MESSAGE,
    );
  });

  it("validates individual form schemas", () => {
    expect(createEndpointNameSchema().parse({ name: "valid-name-1" })).toEqual({
      name: "valid-name-1",
    });
    expect(
      createEndpointNameSchema().safeParse({ name: "BadName" }).success,
    ).toBe(false);
    expect(createEndpointNameSchema().safeParse({ name: "bad-" }).success).toBe(
      false,
    );
    expect(
      createEndpointNameSchema().safeParse({ name: "bad--name" }).success,
    ).toBe(false);

    expect(
      createAutoscalingSchema().safeParse({
        cooldownPeriod: 299,
        enabled: true,
        maxReplicas: 11,
        minReplicas: -1,
      }).success,
    ).toBe(false);
    expect(
      createAdvancedScalingSchema().parse({
        scaleDownWindow: 60,
        stableWindow: 120,
      }),
    ).toEqual({
      scaleDownWindow: 60,
      stableWindow: 120,
    });
    expect(
      createEngineSchema().safeParse({
        maxNumSeqs: 0,
      }).success,
    ).toBe(false);
    expect(
      createEngineSchema().parse({
        extraArgs: ["--trust-remote-code"],
        isSuffixDecodingEnable: true,
        maxModelLen: 8192,
        maxNumSeqs: 16,
        version: "0.8",
      }),
    ).toMatchObject({
      maxNumSeqs: 16,
      version: "0.8",
    });
  });

  it("validates the complete form and controlled component aggregate result", () => {
    expect(
      createCompleteFormSchema().safeParse({
        advancedScaling: {
          scaleDownWindow: 60,
          stableWindow: 60,
        },
        autoscaling: {
          cooldownPeriod: 300,
          enabled: true,
          maxReplicas: 3,
          minReplicas: 1,
        },
        endpointName: {
          name: "valid-endpoint",
        },
        engine: {
          maxNumSeqs: 16,
        },
        model: {
          modelId: "owner/base",
        },
      }).success,
    ).toBe(true);

    expect(
      validateControlledComponents({
        autoscaling: {
          cooldownPeriod: 10,
          enabled: true,
          maxReplicas: 11,
          minReplicas: -1,
        },
        engine: {
          maxNumSeqs: 0,
        },
        model: {
          loraAdapters: [
            { modelAlias: "dup", modelId: "owner/a" },
            { modelAlias: "dup", modelId: "owner/b" },
          ],
          modelId: "",
        },
        name: "BadName",
      }),
    ).toEqual({
      errors: {
        autoscaling: "Min replicas must be at least 0",
        engine: "Must be at least 1",
        model: "Hugging Face model repository name is required",
        name: expect.stringContaining("Name must start"),
      },
      isValid: false,
    });

    expect(
      validateControlledComponents({
        autoscaling: {
          cooldownPeriod: 300,
          enabled: false,
          maxReplicas: 1,
          minReplicas: 0,
        },
        engine: {},
        model: {
          loraAdapters: [],
          modelId: "owner/base",
        },
        name: "valid-name",
      }),
    ).toEqual({
      errors: {},
      isValid: true,
    });
  });
});
