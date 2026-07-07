import {
  ModelLabelMap,
  ModelType,
  type LLMModelWithStatus,
} from "@/types/models";
import { convertRawModelToLLMModelClient } from "@/lib/utils/models";
import { getModelCapabilities } from "@/lib/model-library/capabilities";
import {
  getPrimaryModelBadge,
  isModelFeatured,
} from "@/lib/model-library/badges";

function createModel(
  overrides: Partial<LLMModelWithStatus>,
): LLMModelWithStatus {
  return {
    id: "model-1",
    name: "model-1",
    displayName: "Model 1",
    type: ModelType.Chat,
    context_size: 131072,
    description: "",
    input_token_price_per_m: 0,
    input_token_price_per_m_toString: "0",
    output_token_price_per_m: 0,
    output_token_price_per_m_toString: "0",
    features: [],
    tags: [],
    infos: {
      inputPricing: "$0/Mt",
      outputPricing: "$0/Mt",
      contextSize: "131072",
      maxOutputTokens: "4096",
    },
    ...overrides,
  };
}

describe("model-library badges and capabilities", () => {
  it("uses configured discount badge priority", () => {
    expect(getPrimaryModelBadge(createModel({ isNew: true }))).toEqual({
      label: "New",
      kind: "new",
    });
    expect(
      getPrimaryModelBadge(
        createModel({
          isNew: true,
          isHot: true,
          isFree: true,
          discount: 0.9,
          labels: [
            { key: ModelLabelMap.Display, value: ModelLabelMap.Discount },
          ],
        }),
      ),
    ).toEqual({ label: "LIMITED TIME 10% OFF", kind: "discount" });
    expect(
      getPrimaryModelBadge(
        createModel({
          labels: [{ key: ModelLabelMap.Display, value: ModelLabelMap.Free }],
        }),
      ),
    ).toEqual({ label: "Free", kind: "free" });
  });

  it("does not show a discount badge without a discount label", () => {
    const model = convertRawModelToLLMModelClient({
      id: "discount-model",
      title: "vendor/discount-model",
      display_name: "Discount Model",
      description: "",
      model_type: "chat",
      context_size: 131072,
      input_token_price_per_m: 90000,
      output_token_price_per_m: 0,
      input_pricing: {
        pricePerM: 90000,
        originPricePerM: 100000,
      },
      output_pricing: {
        pricePerM: 0,
        originPricePerM: 0,
      },
      max_output_tokens: 4096,
      features: [],
      endpoints: [],
      status: 1,
      labels: [{ key: ModelLabelMap.Display, value: ModelLabelMap.Free }],
      tags: [],
    });

    expect(model.isFree).toBe(true);
    expect(model.isDiscount).toBe(false);
    expect(getPrimaryModelBadge(model)).toEqual({
      label: "Free",
      kind: "free",
    });
  });

  it("uses custom display labels as the primary badge when no built-in badge applies", () => {
    expect(
      getPrimaryModelBadge(
        createModel({
          labels: [
            { key: ModelLabelMap.Display, value: "Early Access" },
            { key: ModelLabelMap.Filter, value: ModelLabelMap.Featured },
          ],
        }),
      ),
    ).toEqual({ label: "Early Access", kind: "custom" });
  });

  it("detects featured from transformed field or labels", () => {
    expect(isModelFeatured(createModel({ isFeatured: true }))).toBe(true);
    expect(
      isModelFeatured(
        createModel({
          labels: [
            { key: ModelLabelMap.Filter, value: ModelLabelMap.Featured },
          ],
        }),
      ),
    ).toBe(true);
    expect(
      isModelFeatured(
        createModel({
          isFeatured: true,
          labels: [],
        }),
      ),
    ).toBe(false);
  });

  it("detects console feature facets", () => {
    const capabilities = getModelCapabilities(
      createModel({
        context_size: 262144,
        features: ["function-calling", "structured-outputs", "reasoning"],
      }),
    );

    expect(capabilities).toEqual(
      expect.arrayContaining([
        "tool-calling",
        "json-schema",
        "reasoning",
        "long-context",
      ]),
    );
  });
});
