"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import CopyBtn from "@/components/ui/standard/code-copy-btn";
import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";
import { getModelLogoName } from "@/app/components/ModelLibrary/ModelLogo/modelLogoConfig";
import { LLMModelWithStatus, ModelLabelMap, ModelType } from "@/types/models";
import { useRouter } from "next/navigation";
import { transformModelIdToPath } from "@/lib/utils";
import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import PartnerTag from "../../ModelLibrary/PartnerTag";
import getCampaignConfig from "@/config/campaign";
import BuildMonthTag from "../../buildMonth";

interface ModelDetailHeaderProps {
  modelName?: string;
  modelVersion?: string;
  modelStatus?: string;
  modelId?: string;
  modelLogo?: string;
  model?: LLMModelWithStatus;
  onTryModal?: () => void;
  onApiDocs?: () => void;
}

const ModelDetailHeader: React.FC<ModelDetailHeaderProps> = ({
  modelName,
  modelId,
  model,
  onTryModal,
  onApiDocs,
}) => {
  const campaign = getCampaignConfig();
  const router = useRouter();

  // Check if model supports deploy on demand
  const supportsDeployOnDemand =
    (model as any)?.de_configured === true &&
    (model as any)?.hf_mirror_url &&
    (model as any).hf_mirror_url.trim() !== "";

  // Check if model supports serverless (based on features array)
  const supportsServerless =
    Array.isArray(model?.features) &&
    model.features.some(
      (feature: string) => feature.toLowerCase() === "serverless",
    );

  const isPartner = model?.labels?.some(
    (label) =>
      label.key === ModelLabelMap.Partner &&
      label.value === ModelLabelMap.Partner,
  );
  const logoModelName = getModelLogoName({
    series: model?.series,
    displayName: modelName || model?.displayName,
    name: model?.name,
    id: modelId || model?.id,
  });

  // Handle Try Model button click
  const handleTryModalClick = () => {
    if (onTryModal) {
      onTryModal();
    } else if (model?.id) {
      router.push(
        `${NOVITA_URL.LLM_CONSOLE_PLAYGROUND}?model=${transformModelIdToPath(model.id)}`,
      );
    }
  };

  // Handle API Documentation button click
  const handleApiDocsClick = () => {
    if (onApiDocs) {
      onApiDocs();
    } else if (model?.type) {
      const docsUrlMap: Record<string, string> = {
        [ModelType.Reranker]: DOCS_URL.RERANKER,
        [ModelType.Chat]: DOCS_URL.LLM,
        [ModelType.Embedding]: DOCS_URL.EMBEDDING,
      };
      const docsUrl = docsUrlMap[model.type] || DOCS_URL.LLM;
      window.open(docsUrl, "_blank");
    }
  };

  // Handle Deploy on Demand button click
  const handleDeployOnDemandClick = () => {
    if (model?.id) {
      router.push(
        `/models-console/llm-dedicated-endpoints?modelId=${encodeURIComponent(model.id)}`,
      );
    } else {
      router.push("/models-console/llm-dedicated-endpoints");
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Model Info Module */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-8 w-full">
        {/* Left side - Model icon, name and ID */}
        <div className="flex flex-col gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {/* Model Icon */}
            <ModelLogo size={44} modelName={logoModelName} />

            {/* Model Name and ID */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-[32px] font-semibold text-[var(--dark-1)] leading-[1.25] tracking-[-0.02em]">
                  {modelName || "-"}
                </h1>
              </div>

              {/* Model ID with copy button */}
              <div className="flex flex-row items-center gap-2">
                {(model?.input_pricing?.originPricePerM || 0) !==
                  (model?.input_pricing?.pricePerM || 0) &&
                  campaign?.enabled && (
                    <BuildMonthTag
                      type="common"
                      text={campaign?.modelPageDiscountLabel || ""}
                    />
                  )}
                {isPartner && <PartnerTag className="h-5 leading-5" />}
                <div className="flex items-center gap-2 bg-[var(--gray-3)] px-1.5 py-0 rounded w-fit h-5">
                  <span className="text-xs font-normal text-[var(--dark-2)] leading-[1.67]">
                    {modelId || "-"}
                  </span>
                  <CopyBtn content={modelId || ""} size={14} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Action buttons - aligned with Info component */}
        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0 min-w-0 justify-start lg:justify-end w-full lg:w-auto flex-wrap">
          {/* Try Model button - only show if features includes "serverless" */}
          {supportsServerless && model?.type === ModelType.Chat && (
            <Button
              onClick={handleTryModalClick}
              size="sl"
              className="px-3 font-mono text-xs font-medium leading-[1.67] tracking-[0.02em]"
            >
              Try Model
            </Button>
          )}
          {/* Deploy on Demand button - only show if de_configured is true and hf_mirror_url is not empty */}
          {supportsDeployOnDemand && (
            <Button
              onClick={handleDeployOnDemandClick}
              variant={supportsServerless ? "secondary" : "default"}
              size="sl"
              className="px-3 font-mono text-xs font-medium leading-[1.67] tracking-[0.02em]"
            >
              Deploy on Demand
            </Button>
          )}
          {/* API Documentation button - only show if features includes "serverless" */}
          {supportsServerless && (
            <Button
              onClick={handleApiDocsClick}
              variant="secondary"
              size="sl"
              className="px-3 font-mono text-xs font-medium leading-[1.67] tracking-[0.02em]"
            >
              API Documentation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModelDetailHeader;
