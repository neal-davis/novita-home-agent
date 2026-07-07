import * as z from "zod";

const ENDPOINT_NAME_MAX_LENGTH = 63;
const FALLBACK_ENDPOINT_NAME = "endpoint";
export const LORA_ROUTE_DUPLICATE_ERROR_MESSAGE =
  "Route must be unique within the endpoint.";

export function normalizeEndpointName(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const nameWithValidPrefix = /^[a-z]/.test(normalized)
    ? normalized
    : `endpoint-${normalized}`;

  const trimmedName = nameWithValidPrefix
    .slice(0, ENDPOINT_NAME_MAX_LENGTH)
    .replace(/-+$/g, "");

  return trimmedName || FALLBACK_ENDPOINT_NAME;
}

const modelIdSchema = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      return value;
    }

    if (value && typeof value === "object") {
      const maybeModel = value as {
        modelId?: unknown;
        value?: unknown;
        id?: unknown;
      };
      return maybeModel.modelId || maybeModel.value || maybeModel.id;
    }

    return value;
  },
  z.string().min(1, "Hugging Face model repository name is required"),
);

// LoRA adapter form item — modelId is the adapter name (HF repo or novita id),
// modelAlias is the optional user-defined route.
export interface LoraAdapterItem {
  modelId: string;
  modelAlias?: string;
}

export function getLoraEffectiveRoute(adapter: LoraAdapterItem) {
  return (adapter.modelAlias || "").trim() || adapter.modelId;
}

export function getDuplicateLoraRouteIndexes(adapters: LoraAdapterItem[]) {
  const routeIndexes = new Map<string, number[]>();

  adapters.forEach((adapter, index) => {
    const route = getLoraEffectiveRoute(adapter);
    const indexes = routeIndexes.get(route) || [];
    indexes.push(index);
    routeIndexes.set(route, indexes);
  });

  return new Set(
    Array.from(routeIndexes.values())
      .filter((indexes) => indexes.length > 1)
      .flat(),
  );
}

const loraAdapterShapeSchema = z.object({
  modelId: z.string().min(1),
  modelAlias: z.string().optional(),
});

export const loraAdapterItemSchema = z.preprocess((value) => {
  if (typeof value === "string") {
    return { modelId: value };
  }

  return value;
}, loraAdapterShapeSchema);

const loraAdaptersSchema = z
  .array(loraAdapterItemSchema)
  .superRefine((adapters, ctx) => {
    getDuplicateLoraRouteIndexes(adapters).forEach((index) => {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: LORA_ROUTE_DUPLICATE_ERROR_MESSAGE,
        path: [index, "modelAlias"],
      });
    });
  });

export function createEndpointNameSchema() {
  return z.object({
    name: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(ENDPOINT_NAME_MAX_LENGTH, "Name must not exceed 63 characters")
      .regex(
        /^[a-z][a-z0-9-]*$/,
        "Name must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens",
      )
      .refine((val) => !val.endsWith("-"), "Name must not end with a hyphen")
      .refine(
        (val) => !val.includes("--"),
        "Name must not contain consecutive hyphens",
      ),
  });
}

export function createModelSchema() {
  return z.object({
    modelId: modelIdSchema,
    token: z.string().optional(),
    loraAdapters: loraAdaptersSchema.optional(),
  });
}

export const modelSchema = z.object({
  modelId: modelIdSchema,
  token: z.string().optional(),
  loraAdapters: loraAdaptersSchema.optional(),
});

export function createAutoscalingSchema() {
  return z.object({
    enabled: z.boolean(),
    minReplicas: z.number().min(0, "Min replicas must be at least 0"),
    maxReplicas: z.number().max(10, "Max replicas must not exceed 10"),
    cooldownPeriod: z
      .number()
      .min(300, "Scale-down delay must be at least 300 seconds"),
  });
}

export function createAdvancedScalingSchema() {
  return z.object({
    scaleDownWindow: z
      .number()
      .min(60, "Scale down window must be at least 60 seconds"),
    stableWindow: z
      .number()
      .min(60, "Stable window must be at least 60 seconds"),
  });
}

export function createEngineSchema() {
  return z.object({
    version: z.string().optional(),
    maxModelLen: z.number().optional(),
    maxNumSeqs: z
      .number()
      .int("Must be a positive integer")
      .min(1, "Must be at least 1")
      .optional(),
    isSuffixDecodingEnable: z.boolean().optional(),
    extraArgs: z.array(z.string()).optional(),
  });
}

export function createCompleteFormSchema() {
  return z.object({
    endpointName: createEndpointNameSchema(),
    model: createModelSchema(),
    autoscaling: createAutoscalingSchema(),
    advancedScaling: createAdvancedScalingSchema(),
    engine: createEngineSchema(),
  });
}

export type CompleteFormDataType = z.infer<
  ReturnType<typeof createCompleteFormSchema>
>;

// Error type for validation
export interface ValidationErrors {
  name?: string;
  model?: string;
  instance?: string;
  autoscaling?: string;
  advancedScaling?: string;
  engine?: string;
}

// Validation result type
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

// Data type for controlled components
export interface ControlledComponentsData {
  name: string;
  model: z.infer<ReturnType<typeof createModelSchema>>;
  autoscaling: z.infer<ReturnType<typeof createAutoscalingSchema>>;
  // advancedScaling: z.infer<ReturnType<typeof createAdvancedScalingSchema>>;
  engine: z.infer<ReturnType<typeof createEngineSchema>>;
}

// Validate all controlled components
export const validateControlledComponents = (
  data: ControlledComponentsData,
): ValidationResult => {
  const errors: ValidationErrors = {};
  let hasErrors = false;

  // Validate form fields
  try {
    createEndpointNameSchema().parse({
      name: data.name,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        if (err.path[0] === "name") {
          errors.name = err.message;
          hasErrors = true;
        }
      });
    }
  }

  try {
    createModelSchema().parse(data.model);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.model = error.errors[0]?.message || "Model validation failed";
      hasErrors = true;
    }
  }

  try {
    createAutoscalingSchema().parse(data.autoscaling);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.autoscaling =
        error.errors[0]?.message || "Autoscaling validation failed";
      hasErrors = true;
    }
  }

  // try {
  //   createAdvancedScalingSchema().parse(data.advancedScaling);
  // } catch (error) {
  //   if (error instanceof z.ZodError) {
  //     errors.advancedScaling =
  //       error.errors[0]?.message || "Advanced scaling validation failed";
  //     hasErrors = true;
  //   }
  // }

  try {
    createEngineSchema().parse(data.engine);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.engine = error.errors[0]?.message || "Engine validation failed";
      hasErrors = true;
    }
  }

  return {
    isValid: !hasErrors,
    errors,
  };
};
