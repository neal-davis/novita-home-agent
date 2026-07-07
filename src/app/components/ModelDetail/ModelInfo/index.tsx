"use client";

import React, { useMemo } from "react";
import { Check, X } from "lucide-react";
import CopyBtn from "@/components/ui/standard/code-copy-btn";
import { LLMModelFeatures, LLMModelWithStatus } from "@/types/models";
import { ANTHROPIC_BASE_URL, API_BASE_URL } from "@/constants/urls";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store";
import styles from "./index.module.scss";
// import Big from "big.js";

// Wrap CopyBtn component to fix size and avoid jitter
const StableCopyBtn: React.FC<{
  content: string;
  className?: string;
  size?: number;
}> = ({ content, className, size = 14 }) => {
  return (
    <span
      className={`${styles.stableCopyBtn} ${className || ""}`}
      style={{
        width: size,
        height: size,
        fontSize: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <CopyBtn content={content} size={size} />
    </span>
  );
};

interface ModelInfoProps {
  className?: string;
  model?: LLMModelWithStatus;
}

interface InfoItemProps {
  label: string;
  value?: string | null;
  isSupported?: boolean;
  showCopyButton?: boolean;
  onClick?: () => void;
  isClickable?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = ({
  label,
  value,
  isSupported,
  showCopyButton,
}) => (
  <div className="flex items-center w-full">
    <span className="text-[var(--dark-2)] text-sm font-normal w-24 flex-shrink-0 whitespace-nowrap">
      {label}
    </span>
    <div className="flex items-center gap-1 ml-auto">
      {isSupported !== undefined ? (
        <>
          <div className="w-4 h-4 flex items-center justify-center">
            <Check className="w-4 h-4 text-[var(--brand-1)]" />
          </div>
          <span className="text-[var(--brand-1)] text-sm font-normal">
            Supported
          </span>
        </>
      ) : (
        <span className="text-[var(--black)] text-sm font-medium">
          {value || "-"}
        </span>
      )}
      {showCopyButton && value ? (
        <StableCopyBtn content={value} className="ml-1" size={14} />
      ) : (
        <div className="w-[18px] h-[18px] ml-1" />
      )}
    </div>
  </div>
);

const Divider: React.FC = () => (
  <div className="w-full h-px bg-[var(--gray-2)]" />
);

const ApiInfoItem: React.FC<
  Omit<InfoItemProps, "value"> & {
    value: string[] | string | null;
  }
> = ({ label, value, showCopyButton, onClick, isClickable = false }) => (
  <div className="flex items-start w-full">
    <span className="text-[var(--dark-2)] text-sm font-normal w-24 flex-shrink-0 whitespace-nowrap">
      {label}
    </span>
    {Array.isArray(value) ? (
      <div className="flex flex-col gap-1">
        {value.map((item) => (
          <div
            key={item}
            className={`flex items-center ml-auto ${
              showCopyButton && item ? "gap-1" : ""
            }`}
          >
            <span
              className={`text-sm font-medium ${
                isClickable
                  ? "text-[var(--brand-1)] cursor-pointer hover:opacity-80 transition-opacity"
                  : "text-[var(--black)]"
              }`}
              onClick={onClick}
            >
              {item || "-"}
            </span>
            {showCopyButton && item ? (
              <StableCopyBtn content={item} className="ml-1" size={14} />
            ) : (
              <div className="w-[18px] h-[18px] ml-1" />
            )}
          </div>
        ))}
      </div>
    ) : (
      <div
        className={`flex items-center ml-auto ${
          showCopyButton && value ? "gap-1" : ""
        }`}
      >
        <span
          className={`text-sm font-medium ${
            isClickable
              ? "text-[var(--brand-1)] cursor-pointer hover:opacity-80 transition-opacity"
              : "text-[var(--black)]"
          }`}
          onClick={onClick}
        >
          {value || "-"}
        </span>
        {showCopyButton && value ? (
          <StableCopyBtn content={value} className="ml-1" size={14} />
        ) : (
          <div className="w-[18px] h-[18px] ml-1" />
        )}
      </div>
    )}
  </div>
);

const ApiEndpointItem: React.FC<{
  label: string;
  values: Array<{
    value: string;
    onClick?: () => void;
    showCopyButton?: boolean;
  }>;
}> = ({ label, values }) => (
  <div className="flex items-start w-full">
    <span className="text-[var(--dark-2)] text-sm font-normal w-24 flex-shrink-0 whitespace-nowrap">
      {label}
    </span>
    <div className="flex flex-col items-end ml-auto gap-1">
      {values.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <span className="text-sm font-medium text-[var(--black)]">
            {item.value}
          </span>
          {item.showCopyButton && (
            <StableCopyBtn content={item.value} className="ml-1" size={14} />
          )}
        </div>
      ))}
    </div>
  </div>
);

export default function ModelInfo({ className, model }: ModelInfoProps) {
  const router = useRouter();
  const uuid = useAppSelector((state) => state.user.uuid);
  const isLoggedIn = Boolean(uuid);
  const getModelInfo = (key: keyof LLMModelWithStatus) => {
    if (!model) return null;
    const value = model[key];
    return value ? String(value) : null;
  };

  const handleAPIKeyClick = () => {
    router.push("/settings/key-management");
  };
  const featureLabelMap: Record<string, string> = {
    "function-calling": "Function Calling",
    "structured-outputs": "Structured Output",
    vision: "Vision",
    "disable-character": "Disable Character",
    reasoning: "Reasoning",
  };

  const getSupportedFeatures = () => {
    if (!model?.features || !Array.isArray(model.features)) return [];

    return model.features
      .filter(
        (one: string) =>
          one !== LLMModelFeatures.Vision &&
          one !== LLMModelFeatures.Video &&
          one.toLowerCase() !== "serverless", // Filter out serverless as it's displayed separately
      )
      .map((feature) => ({
        key: feature,
        label: featureLabelMap[feature] || feature,
        isSupported: true,
      }));
  };

  const supportAnthropic = useMemo(() => {
    return (
      Array.isArray(model?.endpoints) && model?.endpoints?.includes("anthropic")
    );
  }, [model?.endpoints]);

  // Check if model supports serverless (based on features array)
  const supportsServerless = useMemo(() => {
    return (
      Array.isArray(model?.features) &&
      model.features.some(
        (feature: string) => feature.toLowerCase() === "serverless",
      )
    );
  }, [model?.features]);

  // Get API endpoints from model.endpoints field
  const apiEndpoints = useMemo(() => {
    if (Array.isArray(model?.endpoints) && model.endpoints.length > 0) {
      // Filter out "anthropic" as it's handled separately for Base URL
      return model.endpoints.filter(
        (endpoint: string) => endpoint.toLowerCase() !== "anthropic",
      );
    }
    return [];
  }, [model?.endpoints]);

  return (
    <div
      className={`flex flex-col gap-6 w-full min-w-[300px] pt-5 px-4 lg:px-6 ${className}`}
    >
      {/* Info Section */}
      <div className="flex flex-col gap-4 w-full">
        <h3 className="text-[var(--dark-1)] text-lg font-semibold leading-6">
          Info
        </h3>
        <div className="flex flex-col gap-4 w-full">
          <InfoItem label="Provider" value={getModelInfo("series") || "-"} />
          <InfoItem
            label="Quantization"
            value={getModelInfo("quantization") || "-"}
          />
        </div>
      </div>

      <Divider />

      {/* Supported Functionality Section */}
      <div className="flex flex-col gap-4 w-full">
        <h3 className="text-[var(--dark-1)] text-lg font-semibold leading-6">
          Supported Functionality
        </h3>
        <div className="flex flex-col gap-4 w-full">
          <InfoItem
            label="Context Length"
            value={getModelInfo("context_size")}
          />
          <InfoItem
            label="Max Output"
            value={getModelInfo("max_output_tokens")}
          />
          {/* Serverless Support */}
          <div className="flex items-center w-full">
            <span className="text-[var(--dark-2)] text-sm font-normal w-24 flex-shrink-0 whitespace-nowrap">
              Serverless
            </span>
            <div className="flex items-center gap-1 ml-auto">
              {supportsServerless ? (
                <>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Check className="w-4 h-4 text-[var(--brand-1)]" />
                  </div>
                  <span className="text-[var(--brand-1)] text-sm font-normal">
                    Supported
                  </span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 flex items-center justify-center">
                    <X className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-red-500 text-sm font-normal">
                    Not supported
                  </span>
                </>
              )}
              <div className="w-[18px] h-[18px] ml-1" />
            </div>
          </div>
          {getSupportedFeatures().map((feature) => (
            <InfoItem
              key={feature.key}
              label={feature.label}
              isSupported={feature.isSupported}
            />
          ))}
          {supportAnthropic && (
            <InfoItem
              label="Anthropic API"
              value={supportAnthropic ? "Supported" : "Not Supported"}
              isSupported={supportAnthropic}
            />
          )}
          <InfoItem
            label="Input Capabilities"
            value={model?.inputModalities?.join(", ") || "-"}
          />
          <InfoItem
            label="Output Capabilities"
            value={model?.outputModalities?.join(", ") || "-"}
          />
        </div>
      </div>

      {isLoggedIn && supportsServerless && (
        <>
          <Divider />

          {/* API Access Guide Section */}
          <div className="flex flex-col gap-4 w-full">
            <h3 className="text-[var(--dark-1)] text-lg font-semibold leading-6">
              API Access Guide
            </h3>
            <div className="flex flex-col gap-4 w-full">
              <ApiInfoItem
                label="Base URL"
                value={[
                  API_BASE_URL,
                  supportAnthropic ? ANTHROPIC_BASE_URL : "",
                ].filter((url): url is string => Boolean(url))}
                showCopyButton={true}
              />
              {apiEndpoints.length > 0 && (
                <ApiEndpointItem
                  label="API Endpoint"
                  values={apiEndpoints.map((endpoint) => ({
                    value: endpoint,
                    showCopyButton: true,
                  }))}
                />
              )}
              <ApiInfoItem
                label="Model ID"
                value={getModelInfo("id")}
                showCopyButton={true}
              />
              <ApiInfoItem
                label="API Key"
                value="Create & Query Your API Key"
                onClick={handleAPIKeyClick}
                isClickable={true}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
