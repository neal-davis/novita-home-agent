"use client";
import React, { useMemo } from "react";
import Big from "big.js";
import ModelSection from "./ModelSection";
import { MODEL_GROUP_TITLE_MAP, MODEL_DESC_MAP } from "@/constants/models";
import { LLMModelWithStatus, MultimodalPricing } from "@/types/models";
interface LLMModelData {
  id: string;
  name: string;
  displayName?: string;
  context_size: number;
  input_token_price_per_m: number;
  input_pricing?: {
    originPricePerM: number;
    pricePerM: number;
  } | null;
  output_token_price_per_m: number;
  output_pricing?: {
    originPricePerM: number;
    pricePerM: number;
  } | null;
  cache_read_input_token_price_per_m?: number;
  cache_read_input_pricing?: {
    originPricePerM: number;
    pricePerM: number;
  } | null;
  cache_creation_input_token_price_per_m?: number;
  cache_creation_input_pricing?: {
    originPricePerM: number;
    pricePerM: number;
  } | null;
  cache_creation_1_hour_input_token_price_per_m?: number;
  cache_creation_1_hour_input_pricing?: {
    originPricePerM: number;
    pricePerM: number;
  } | null;
  labels?: LLMModelWithStatus["labels"];
  series?: string;
  is_tiered_billing?: boolean;
  tiered_billing_configs?: LLMModelWithStatus["tiered_billing_configs"];
  multimodal_pricing?: MultimodalPricing | null;
}
interface LLMModelsSectionProps {
  llmList: LLMModelData[];
  onCalculate?: (model: LLMModelData) => void;
  isConsole?: boolean;
}
const formatPrice = (pricePerM: number | undefined | null): string =>
  Big(pricePerM || 0)
    .div(10000)
    .toString();
const LLMModelsSection: React.FC<LLMModelsSectionProps> = ({
  llmList,
  isConsole = false,
}) => {
  const { groups: groupedModels, groupDisplayName } = useMemo(() => {
    const groups: Record<string, LLMModelData[]> = {};
    const groupDisplayName: Record<string, string> = {};
    llmList.forEach((model) => {
      // Use series as vendor/group name; when series is empty, put in Others
      const rawGroup = model.series?.trim() || "Others";
      const normalizedKey = rawGroup.toLowerCase();
      if (!groups[normalizedKey]) {
        groups[normalizedKey] = [];
      }
      groups[normalizedKey].push(model);
      // Display name: prefer series, then config or rawGroup (e.g. Others)
      groupDisplayName[normalizedKey] =
        model.series?.trim() ||
        groupDisplayName[normalizedKey] ||
        MODEL_GROUP_TITLE_MAP[normalizedKey] ||
        rawGroup;
    });
    return { groups, groupDisplayName };
  }, [llmList]);
  const getDescription = (groupName: string, displayName?: string) => {
    const id = MODEL_GROUP_TITLE_MAP[groupName] || displayName || groupName;
    const modelInfo = MODEL_DESC_MAP.find((item) => item.id === id);
    return modelInfo?.description || "";
  };
  const transformModelData = (models: LLMModelData[]) => {
    const result: any[] = [];
    models.forEach((model) => {
      const modelName = model.displayName || model.name;
      // Check if this model has tiered billing
      const isTieredBilling = model.is_tiered_billing === true;
      // Check if this model is omnimodal
      // Consider it omnimodal if multimodal_pricing exists and has non-empty arrays
      const isOmnimodal =
        model.multimodal_pricing !== null &&
        model.multimodal_pricing !== undefined &&
        ((Array.isArray(model.multimodal_pricing.input_price) &&
          model.multimodal_pricing.input_price.length > 0) ||
          (Array.isArray(model.multimodal_pricing.output_price) &&
            model.multimodal_pricing.output_price.length > 0));
      if (
        isTieredBilling &&
        model.tiered_billing_configs &&
        model.tiered_billing_configs.length > 0
      ) {
        // For tiered billing models, create a single row with special values
        result.push({
          name: modelName,
          context: model.context_size,
          input: "-", // Display as "-" for tiered billing
          output: "Tiered pricing", // Display as "Tiered pricing"
          id: model.id,
          isTieredBilling: true,
          tieredBillingConfigs: model.tiered_billing_configs, // Store full config for sub-table
          rowspan: 1,
          cacheWrite5mPricing: model.cache_creation_input_pricing || null,
          cacheWrite1hPricing:
            model.cache_creation_1_hour_input_pricing || null,
          cacheReadPricing: model.cache_read_input_pricing || null,
        });
      } else if (isOmnimodal) {
        // For omnimodal models, create a row with "Omnimodal" output
        result.push({
          name: modelName,
          context: model.context_size,
          input: formatPrice(model.input_token_price_per_m),
          originalInput:
            model?.input_pricing?.originPricePerM ===
            model?.input_pricing?.pricePerM
              ? null
              : formatPrice(model?.input_pricing?.originPricePerM),
          originalOutput:
            model?.output_pricing?.originPricePerM ===
            model?.output_pricing?.pricePerM
              ? null
              : formatPrice(model?.output_pricing?.originPricePerM),
          output: "Omnimodal", // Display as "Omnimodal"
          cacheWrite5mPricing: model.cache_creation_input_pricing || null,
          cacheWrite1hPricing:
            model.cache_creation_1_hour_input_pricing || null,
          cacheReadPricing: model.cache_read_input_pricing || null,
          id: model.id,
          isTieredBilling: false,
          isOmnimodal: true,
          multimodalPricing: model.multimodal_pricing, // Store multimodal pricing data
          rowspan: 1,
        });
      } else {
        // For non-tiered billing models, use existing logic
        result.push({
          name: modelName,
          context: model.context_size,
          input: formatPrice(model.input_token_price_per_m),
          originalInput:
            model?.input_pricing?.originPricePerM ===
            model?.input_pricing?.pricePerM
              ? null
              : formatPrice(model?.input_pricing?.originPricePerM),
          originalOutput:
            model?.output_pricing?.originPricePerM ===
            model?.output_pricing?.pricePerM
              ? null
              : formatPrice(model?.output_pricing?.originPricePerM),
          output: formatPrice(model.output_token_price_per_m),
          cacheWrite5mPricing: model.cache_creation_input_pricing || null,
          cacheWrite1hPricing:
            model.cache_creation_1_hour_input_pricing || null,
          cacheReadPricing: model.cache_read_input_pricing || null,
          id: model.id,
          isTieredBilling: false,
          rowspan: 1,
        });
      }
    });
    return result;
  };
  if (!llmList || llmList.length === 0) {
    return (
      <div className="py-12">
        <div className="text-center text-muted-foreground whitespace-pre-line">
          {"No models found"}
        </div>
      </div>
    );
  }
  // sort order
  const sortOrder = [
    "deepseek",
    "meta-llama",
    "qwen",
    "baidu",
    "google",
    "zai-org",
    "Sao10K",
    "mistralai",
    "nousresearch",
    "cognitivecomputations",
    "sophosympatheia",
    "gryphe",
    "microsoft",
    "others",
  ];
  // sort function
  const getSortIndex = (groupName: string) => {
    const normalizedGroupName = groupName.toLowerCase();
    const index = sortOrder.findIndex(
      (item) => item.toLowerCase() === normalizedGroupName,
    );
    // the second to last position
    return index === -1 ? 11.5 : index; // edge case: 11.5
  };
  // group by sort
  const sortedGroups = Object.entries(groupedModels).sort(([a], [b]) => {
    return getSortIndex(a) - getSortIndex(b);
  });
  return (
    <div className="space-y-4">
      {sortedGroups.map(([groupName, models]) => (
        <ModelSection
          key={groupName}
          modelName={
            MODEL_GROUP_TITLE_MAP[groupName] ||
            groupDisplayName[groupName] ||
            groupName
          }
          provider={groupName}
          sectionId={`pricing-model-${groupName}`}
          description={getDescription(groupName, groupDisplayName[groupName])}
          data={transformModelData(models)}
          isConsole={isConsole}
        />
      ))}
    </div>
  );
};
export default LLMModelsSection;
