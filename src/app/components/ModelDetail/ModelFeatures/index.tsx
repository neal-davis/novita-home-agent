"use client";
import React from "react";
import { CloudUpload, LayoutDashboard, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LLMModelWithStatus, ModelType } from "@/types/models";
import { useRouter } from "next/navigation";
import { transformModelIdToPath } from "@/lib/utils";
import { NOVITA_URL } from "@/constants/urls";
import FeatureItem from "./FeatureItem";
import PricingRow from "./PricingRow";
import TieredPricingTable from "./TieredPricingTable";
import MultimodalPricingTable from "./MultimodalPricingTable";
import { formatPrice } from "./utils";
import styles from "./index.module.scss";

interface ModelFeaturesProps {
  modelId?: string;
  model?: LLMModelWithStatus;
  modelConfig?: any;
}

const ModelFeatures: React.FC<ModelFeaturesProps> = ({
  modelId,
  model,
  modelConfig,
}) => {
  const router = useRouter();

  // Check if model supports serverless (based on features array)
  const supportsServerless =
    Array.isArray(model?.features) &&
    model.features.some(
      (feature: string) => feature.toLowerCase() === "serverless",
    );

  // Check if model supports deploy on demand
  const supportsDeployOnDemand =
    (model as any)?.de_configured === true &&
    (model as any)?.hf_mirror_url &&
    (model as any).hf_mirror_url.trim() !== "";

  const handleTryNowClick = () => {
    if (
      model?.id &&
      ![ModelType.Reranker, ModelType.Embedding].includes(model.type)
    ) {
      router.push(
        `${NOVITA_URL.LLM_CONSOLE_PLAYGROUND}?model=${transformModelIdToPath(model.id)}`,
      );
    }
  };

  const modelDescription = model?.description || "";
  const hasDescription = modelDescription.trim() !== "";
  const hasCacheReadPricing =
    model?.cache_read_input_token_price_per_m !== undefined &&
    model?.cache_read_input_token_price_per_m !== 0;
  const hasCacheWrite5mPricing =
    model?.cache_creation_input_token_price_per_m !== undefined &&
    model?.cache_creation_input_token_price_per_m !== 0;
  const hasCacheWrite1hPricing =
    model?.cache_creation_1_hour_input_token_price_per_m !== undefined &&
    model?.cache_creation_1_hour_input_token_price_per_m !== 0;
  const hasTieredPricing =
    model?.tiered_billing_configs && model.tiered_billing_configs.length > 0;

  // Check if this model is omnimodal
  // Consider it omnimodal if multimodal_pricing exists and has non-empty arrays
  const isOmnimodal =
    model?.multimodal_pricing !== null &&
    model?.multimodal_pricing !== undefined &&
    ((Array.isArray(model.multimodal_pricing.input_price) &&
      model.multimodal_pricing.input_price.length > 0) ||
      (Array.isArray(model.multimodal_pricing.output_price) &&
        model.multimodal_pricing.output_price.length > 0));

  const showTryNowButton = model?.type === ModelType.Chat;

  return (
    <div className="flex flex-col gap-4">
      {/* Model Description */}
      {hasDescription && (
        <div className="text-sm font-normal text-[var(--dark-1)]">
          {modelDescription}
        </div>
      )}

      {/* Features Section Title */}
      <h2 className="text-xl font-semibold text-black leading-6 font-miletus">
        Features
      </h2>

      {/* Serverless API Feature - only show if model supports serverless */}
      {supportsServerless && (
        <FeatureItem
          icon={
            <CloudUpload className="w-[18px] h-[18px] text-[var(--dark-1)]" />
          }
          title="Serverless API"
          description={`${modelId || "DeepSeek R1 0528"} is available via Novita's serverless API, where you pay per token. There are several ways to call the API, including OpenAI-compatible endpoints with exceptional reasoning performance.`}
          docsLink="/docs/guides/llm-api"
        />
      )}

      {/* On-demand Deployments Feature - only show if model supports deploy on demand */}
      {supportsDeployOnDemand && (
        <FeatureItem
          icon={
            <LayoutDashboard className="w-[18px] h-[18px] text-[var(--black)]" />
          }
          title="On-demand Deployments"
          description={`On-demand deployments allow you to use ${modelId || "DeepSeek R1 0528"} on dedicated GPUs with high-performance serving stack with high reliability and no rate limits.`}
          docsLink="/docs/guides/llm-dedicated-endpoint"
        />
      )}

      {/* Available Serverless Pricing Section - show if model supports serverless */}
      {supportsServerless && (
        <div className={styles.serverlessContainer}>
          {/* Header with Title and Try Now Button */}
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h2 className={styles.title}>Available Serverless</h2>
              <p className={styles.subtitle}>
                Run queries immediately, pay only for usage
              </p>
            </div>

            {showTryNowButton && (
              <Button
                onClick={handleTryNowClick}
                className="px-2 h-7"
                variant="default"
                size="sm"
              >
                <div className="flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4 text-white" />
                  <span>Try Now</span>
                </div>
              </Button>
            )}
          </div>

          {/* Pricing Information - show multimodal table if omnimodal, otherwise show regular pricing */}
          {isOmnimodal && model?.multimodal_pricing ? (
            <MultimodalPricingTable pricing={model.multimodal_pricing} />
          ) : (
            <div className={styles.pricingTable}>
              <PricingRow
                label="Input"
                value={formatPrice(model?.input_token_price_per_m || 0)}
                originValue={
                  model?.input_pricing?.originPricePerM ===
                  model?.input_pricing?.pricePerM
                    ? null
                    : formatPrice(model?.input_pricing?.originPricePerM || 0)
                }
              />

              {hasCacheReadPricing && (
                <PricingRow
                  label="Cache Read"
                  value={formatPrice(model.cache_read_input_token_price_per_m!)}
                  originValue={
                    model?.cache_pricing?.originPricePerM ===
                    model?.cache_pricing?.pricePerM
                      ? null
                      : formatPrice(model?.cache_pricing?.originPricePerM || 0)
                  }
                />
              )}

              {hasCacheWrite5mPricing && (
                <PricingRow
                  label="Cache Write(5m)"
                  value={formatPrice(
                    model.cache_creation_input_token_price_per_m!,
                  )}
                  originValue={
                    model?.cache_creation_input_pricing?.originPricePerM ===
                    model?.cache_creation_input_pricing?.pricePerM
                      ? null
                      : formatPrice(
                          model?.cache_creation_input_pricing
                            ?.originPricePerM || 0,
                        )
                  }
                />
              )}

              {hasCacheWrite1hPricing && (
                <PricingRow
                  label="Cache Write(1h)"
                  value={formatPrice(
                    model.cache_creation_1_hour_input_token_price_per_m!,
                  )}
                  originValue={
                    model?.cache_creation_1_hour_input_pricing
                      ?.originPricePerM ===
                    model?.cache_creation_1_hour_input_pricing?.pricePerM
                      ? null
                      : formatPrice(
                          model?.cache_creation_1_hour_input_pricing
                            ?.originPricePerM || 0,
                        )
                  }
                />
              )}

              <PricingRow
                label="Output"
                value={formatPrice(model?.output_token_price_per_m || 0)}
                originValue={
                  model?.output_pricing?.originPricePerM ===
                  model?.output_pricing?.pricePerM
                    ? null
                    : formatPrice(model?.output_pricing?.originPricePerM || 0)
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Tiered Pricing Table - only show if not omnimodal */}
      {hasTieredPricing && !isOmnimodal && (
        <TieredPricingTable configs={model.tiered_billing_configs!} />
      )}
    </div>
  );
};

export default ModelFeatures;
