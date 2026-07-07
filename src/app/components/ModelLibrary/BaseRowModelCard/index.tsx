"use client";

import ModelLogo from "../ModelLogo";
import styles from "./index.module.scss";
import { cn } from "@/lib/utils";
import { LabelData } from "../BaseModelCard";
import { Dot } from "lucide-react";
import { LLMLibraryInfo } from "@/types/models";
import PartnerTag from "../PartnerTag";

export interface BaseRowModelCardProps {
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
}

export default function BaseRowModelCard({
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
}: BaseRowModelCardProps) {
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

  const renderInfoContent = () => {
    if (isLLMLibraryInfo(infos)) {
      const items = [
        `Input ${infos.inputPricing}`,
        ...(infos.cacheReadPricing
          ? [`Cache Read ${infos.cacheReadPricing}`]
          : []),
        ...(infos.cacheWrite5mPricing
          ? [`Cache Write(5m) ${infos.cacheWrite5mPricing}`]
          : []),
        ...(infos.cacheWrite1hPricing
          ? [`Cache Write(1h) ${infos.cacheWrite1hPricing}`]
          : []),
        ...(infos.outputPricing ? [`Output ${infos.outputPricing}`] : []),
        `${infos.contextSize} Context`,
      ];

      return items.map((item, index) => (
        <span key={index} className="flex flex-row items-center">
          <span className="block">{item}</span>
          <span className={styles.separator}>
            {index < items.length - 1 && <Dot height={16} width={16} />}
          </span>
        </span>
      ));
    }

    const [pricingInfo, paramsInfo] = infos;
    const discountPrice = pricingInfo?.[0] || "-";

    return [discountPrice, ...(paramsInfo || [])].map(
      (info: string, index: number) => (
        <span key={index} className="flex flex-row items-center">
          <span className="block">{info}</span>
          <span className={styles.separator}>
            {index < infos.length - 1 && <Dot height={16} width={16} />}
          </span>
        </span>
      ),
    );
  };

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
      <div className={styles.base_info}>
        <span className={styles.logoBox}>
          <ModelLogo
            logo={logo}
            modelName={resolvedModelName}
            vendorName={series}
          />
        </span>

        <div className={styles.content}>
          <span className={styles.modelName}>{displayName || modelName}</span>

          <span className={styles.tags}>
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
          </span>
        </div>
      </div>

      <div className={styles.secondary_info}>
        <div className={styles.info}>{renderInfoContent()}</div>
      </div>

      <div className={styles.model_labels}>
        {isPartner && <PartnerTag className="leading-[14px] h-[14px]" />}
        {tags.map((tag: string, index: number) => (
          <span data-tag={tag} key={index} className={styles.label}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
