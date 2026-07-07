"use client";

import type { ReactNode } from "react";
import ModelLogo from "../ModelLogo";
import { Dot } from "lucide-react";
import { LLMLibraryInfo } from "@/types/models";
import styles from "./index.module.scss";
import { cn } from "@/lib/utils";
import PartnerTag from "../PartnerTag";

export type LabelData = { text: string; type: "normal" | "deprecated" };
export interface BaseModelCardProps {
  modelName: string;
  displayName?: string;
  series?: string;
  logo?: string;
  tags: string[];
  infos: string[][] | LLMLibraryInfo;
  clickable?: boolean;
  deprecated?: boolean;
  labelDataList?: LabelData[];
  onClick?: () => void;
  className?: string;
  isPartner?: boolean;
  variant?: "default" | "square";
}

export default function BaseModelCard({
  modelName,
  displayName,
  series,
  logo,
  tags,
  infos,
  clickable = true,
  deprecated = false,
  labelDataList,
  onClick,
  className,
  isPartner = false,
  variant = "default",
}: BaseModelCardProps) {
  const handleClick = () => {
    if (clickable && onClick) {
      onClick();
    }
  };
  const resolvedModelName = displayName || modelName;

  const isLLMLibraryInfo = (
    data: string[][] | LLMLibraryInfo,
  ): data is LLMLibraryInfo => {
    return typeof data === "object" && !Array.isArray(data);
  };

  const renderPricing = (pricing: string, originalPricing?: string) => {
    if (originalPricing) {
      return (
        <span className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5">
          <span className="min-w-0 shrink">
            <span className={styles.discountPrice}>
              {pricing.split("/")[0]}
            </span>
            <span className={styles.discountPrice}>
              /{pricing.split("/")[1]}
            </span>
          </span>
          <span className={`${styles.originalPrice} min-w-0 shrink`}>
            {originalPricing}
          </span>
        </span>
      );
    }
    return pricing;
  };

  const renderInfoContent = () => {
    if (isLLMLibraryInfo(infos)) {
      const hasOriginPricing = !!(
        infos.originInputPricing || infos.originOutputPricing
      );
      const gridCols = hasOriginPricing ? "grid-cols-2" : "grid-cols-3";

      return (
        <div className={`grid ${gridCols} gap-x-3 gap-y-2 w-full`}>
          <div className="flex flex-col">
            <span className={styles.infoItemValue}>
              {renderPricing(infos.inputPricing, infos.originInputPricing)}
            </span>
            <span className={styles.infoItemLabel}>Input</span>
          </div>
          {infos.cacheWrite5mPricing && (
            <div className="flex flex-col">
              <span className={styles.infoItemValue}>
                {renderPricing(
                  infos.cacheWrite5mPricing,
                  infos.originCacheWrite5mPricing,
                )}
              </span>
              <span className={styles.infoItemLabel}>Cache Write(5m)</span>
            </div>
          )}
          {infos.cacheWrite1hPricing && (
            <div className="flex flex-col">
              <span className={styles.infoItemValue}>
                {renderPricing(
                  infos.cacheWrite1hPricing,
                  infos.originCacheWrite1hPricing,
                )}
              </span>
              <span className={styles.infoItemLabel}>Cache Write(1h)</span>
            </div>
          )}
          {infos.cacheReadPricing && (
            <div className="flex flex-col">
              <span className={styles.infoItemValue}>
                {renderPricing(
                  infos.cacheReadPricing,
                  infos.originCacheReadPricing,
                )}
              </span>
              <span className={styles.infoItemLabel}>Cache Read</span>
            </div>
          )}
          {infos.outputPricing && (
            <div className="flex flex-col">
              <span className={styles.infoItemValue}>
                {renderPricing(infos.outputPricing, infos.originOutputPricing)}
              </span>
              <span className={styles.infoItemLabel}>Output</span>
            </div>
          )}
          <div className="flex flex-col">
            <span className={styles.infoItemValue}>{infos.contextSize}</span>
            <span className={styles.infoItemLabel}>Context</span>
          </div>
          <div className="flex flex-col">
            <span className={styles.infoItemValue}>
              {infos.maxOutputTokens}
            </span>
            <span className={styles.infoItemLabel}>Max Output</span>
          </div>
        </div>
      );
    }

    if (!Array.isArray(infos) || infos.length === 0) {
      return null;
    }

    const [pricingInfo, paramsInfo] = infos;

    if (!Array.isArray(pricingInfo)) {
      return null;
    }

    const [discountPrice, originalPrice] = pricingInfo;

    return (
      <>
        <span className={styles.rowInfo}>
          {renderPricing(discountPrice, originalPrice)}
        </span>
        {Array.isArray(paramsInfo) && paramsInfo.length > 0 && (
          <span className={styles.rowInfo}>
            {paramsInfo.map((param: string) => (
              <span key={param}>{param}</span>
            ))}
          </span>
        )}
      </>
    );
  };

  const renderInfoContentSquare = () => {
    if (!isLLMLibraryInfo(infos)) {
      return renderInfoContent();
    }

    const infoItems = [
      {
        label: "Input",
        value: renderPricing(infos.inputPricing, infos.originInputPricing),
      },
      infos.cacheWrite5mPricing
        ? {
            label: "Cache Write(5m)",
            value: renderPricing(
              infos.cacheWrite5mPricing,
              infos.originCacheWrite5mPricing,
            ),
          }
        : null,
      infos.cacheWrite1hPricing
        ? {
            label: "Cache Write(1h)",
            value: renderPricing(
              infos.cacheWrite1hPricing,
              infos.originCacheWrite1hPricing,
            ),
          }
        : null,
      infos.cacheReadPricing
        ? {
            label: "Cache Read",
            value: renderPricing(
              infos.cacheReadPricing,
              infos.originCacheReadPricing,
            ),
          }
        : null,
      infos.outputPricing
        ? {
            label: "Output",
            value: renderPricing(
              infos.outputPricing,
              infos.originOutputPricing,
            ),
          }
        : null,
      {
        label: "Context",
        value: infos.contextSize,
      },
      {
        label: "Max Output",
        value: infos.maxOutputTokens,
      },
    ].filter(Boolean) as Array<{ label: string; value: ReactNode }>;

    return (
      <div className="grid w-full min-w-0 grid-cols-3 items-start gap-x-[var(--space-16)] gap-y-[var(--space-8)]">
        {infoItems.map(({ label, value }) => (
          <div
            key={label}
            className="flex min-w-0 flex-col gap-[var(--space-2)]"
          >
            <span className="min-w-0 break-words font-paragraph-14 text-[var(--text-1)] tabular-nums">
              {value}
            </span>
            <span className="font-paragraph-12 text-[var(--text-3)]">
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const isSquare = variant === "square";

  if (isSquare) {
    return (
      <div
        onClick={handleClick}
        className={cn(
          styles.container,
          styles.square,
          deprecated ? styles.deprecated : "",
          !clickable ? styles.unclickable : "",
          className,
        )}
      >
        {/* Top-right badge labels */}
        <div className={styles.label_container}>
          {labelDataList?.map(({ text, type }, index) => (
            <span
              key={`${text}-${index}`}
              className={cn(
                styles.model_label,
                type === "deprecated"
                  ? styles.deprecated_label
                  : styles.normal_label,
              )}
            >
              {text}
            </span>
          ))}
        </div>

        {/* Header: logo + name */}
        <div
          className={cn(
            styles.squareHeader,
            "flex flex-col gap-[var(--space-8)]",
          )}
        >
          <span
            className={cn(
              styles.logoBox,
              "!w-[var(--height-36)] !h-[var(--height-36)]",
            )}
          >
            <ModelLogo
              logo={logo}
              modelName={resolvedModelName}
              vendorName={series}
              size={36}
            />
          </span>
          <span className="font-paragraph-18-medium text-[var(--text-1)]">
            {displayName || modelName}
          </span>
        </div>

        {/* Divider */}
        <div className={styles.squareDivider} />

        {/* Pricing / Info */}
        <div
          className={cn(
            styles.squarePricing,
            isLLMLibraryInfo(infos)
              ? styles.llmLibraryInfo
              : styles.mediaModelInfo,
          )}
        >
          {renderInfoContentSquare()}
        </div>

        {/* Tags footer */}
        <span className={styles.tags}>
          {isPartner && <PartnerTag />}
          {tags.map((tag: string, index: number) => (
            <span data-tag={tag} key={index}>
              {tag}
            </span>
          ))}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        styles.container,
        deprecated ? styles.deprecated : "",
        !clickable ? styles.unclickable : "",
        className,
      )}
    >
      <div className={styles.label_container}>
        {labelDataList?.map(({ text, type }, index) => (
          <span
            key={`${text}-${index}`}
            className={cn(
              styles.model_label,
              type === "deprecated"
                ? styles.deprecated_label
                : styles.normal_label,
            )}
          >
            {text}
          </span>
        ))}
      </div>

      <span className={styles.logoBox}>
        <ModelLogo
          logo={logo}
          modelName={resolvedModelName}
          vendorName={series}
        />
      </span>

      <span className={styles.modelName}>{displayName || modelName}</span>

      <span
        className={`${styles.info} ${isLLMLibraryInfo(infos) ? styles.llmLibraryInfo : styles.mediaModelInfo}`}
      >
        {renderInfoContent()}
      </span>

      <span className={styles.tags}>
        {isPartner && <PartnerTag />}
        {tags.map((tag: string, index: number) => (
          <span data-tag={tag} key={index}>
            {tag}
          </span>
        ))}
      </span>
    </div>
  );
}
