"use client";

import BaseModelCard, { type LabelData } from "./BaseModelCard";
import BaseRowModelCard from "./BaseRowModelCard";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import { NOVITA_URL } from "@/constants/urls";
import { usePathname } from "next/navigation";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import {
  ModelLabel,
  ModelLabelMap,
  LLMModel,
  LLMModelStatus,
  LLMLibraryInfo,
} from "@/types/models";

export interface LLMModelCardProps {
  data: LLMModel;
  displayMode?: "block" | "row";
  className?: string;
  variant?: "default" | "square";
}

export default function LLMModelCard({
  data,
  displayMode = "block",
  className,
  variant = "default",
}: LLMModelCardProps) {
  const pathname = usePathname();
  const businessPathname = getPathnameWithoutLocale(pathname);
  const { locale } = useI18n();

  const modelName = data.name || data.id;
  const displayModelName = data.displayName;
  const series = data.series;
  const infos = data.infos as string[][] | LLMLibraryInfo;
  const labels = data.labels;
  const link = data.link;
  const linkPath = data.linkPath;
  const modelType = data.type;
  const input_pricing = data.input_pricing;
  const tags = data.tags;
  const logo = data.icon;
  const isDeprecated = data.status === LLMModelStatus.Deprecated;

  const isNew = labels?.some(
    (label) =>
      label.key === ModelLabelMap.Display && label.value === ModelLabelMap.New,
  );
  const isHot = labels?.some(
    (label) =>
      label.key === ModelLabelMap.Display && label.value === ModelLabelMap.Hot,
  );
  const isDiscount = labels?.some(
    (label) =>
      label.key === ModelLabelMap.Display &&
      label.value === ModelLabelMap.Discount,
  );
  const isPartner = labels?.some(
    (label) =>
      label.key === ModelLabelMap.Partner &&
      label.value === ModelLabelMap.Partner,
  );

  const discount =
    input_pricing && input_pricing.originPricePerM > 0
      ? input_pricing.pricePerM / input_pricing.originPricePerM
      : undefined;

  const getPrimaryLabel = (): LabelData | null => {
    if (isDeprecated) return { text: "Deprecated", type: "deprecated" };
    if (isDiscount && discount !== undefined) {
      if (input_pricing?.pricePerM === 0) {
        return { text: "Free", type: "normal" };
      } else if (discount > 0 && discount < 1) {
        return {
          // i18n-disable-next-line
          text: `LIMITED TIME ${Math.round((1 - discount) * 100)}% OFF`,
          type: "normal",
        };
      }
    }
    if (isNew) return { text: "New", type: "normal" };
    if (isHot) return { text: "Hot", type: "normal" };
    return null;
  };

  const getExtraLabels = (): LabelData[] => {
    if (!Array.isArray(labels)) return [];
    return labels
      .filter(
        (one: ModelLabel) =>
          one.key === ModelLabelMap.Display &&
          one.value !== ModelLabelMap.Discount &&
          one.value !== ModelLabelMap.New &&
          one.value !== ModelLabelMap.Hot,
      )
      .map((one: ModelLabel) => ({ text: one.value, type: "normal" as const }));
  };

  const labelDataList: LabelData[] = [
    ...(getPrimaryLabel() ? [getPrimaryLabel() as LabelData] : []),
    ...getExtraLabels(),
  ];

  const handleClick = () => {
    if (modelType === "Chat" || modelType === "Embedding") {
      analytics.trackClick(
        businessPathname === NOVITA_URL.MODEL_LIBRARY_INDEX
          ? CLICK_BTN_IDs.MODELS_BTNS.LIBRARY_CARD
          : CLICK_BTN_IDs.MODELS_CONSOLE.MODEL_LIB_CARD_CLICK,
        {
          modelId: displayModelName || modelName,
        },
      );
    } else {
      analytics.trackClick(
        businessPathname === NOVITA_URL.MODEL_LIBRARY_INDEX
          ? CLICK_BTN_IDs.MODELS_BTNS.LIBRARY_CARD
          : CLICK_BTN_IDs.MODELS_CONSOLE.MODEL_LIB_CARD_CLICK,
        {
          apiName: displayModelName || modelName,
        },
      );
    }

    if (link) {
      window.location.href = getLocalizedPath(link, locale);
    } else if (linkPath) {
      const isConsole = businessPathname.includes(NOVITA_URL.MODEL_API_CONSOLE);
      const targetUrl = isConsole
        ? `${NOVITA_URL.MODEL_API_CONSOLE_MODEL_DETAIL}/${linkPath}`
        : `/models/model-detail/${linkPath}`;
      window.location.href = getLocalizedPath(targetUrl, locale);
    }
  };

  const Component = displayMode === "row" ? BaseRowModelCard : BaseModelCard;
  return (
    <Component
      modelName={modelName}
      displayName={displayModelName}
      series={series}
      logo={logo}
      tags={tags || []}
      infos={infos}
      clickable={!!link || !!linkPath}
      deprecated={isDeprecated}
      labelDataList={labelDataList}
      onClick={handleClick}
      className={className}
      isPartner={isPartner}
      variant={displayMode === "row" ? undefined : variant}
    />
  );
}
