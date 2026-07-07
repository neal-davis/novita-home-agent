"use client";

import BaseModelCard, { type LabelData } from "./BaseModelCard";
import BaseRowModelCard from "./BaseRowModelCard";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import { NOVITA_URL } from "@/constants/urls";
import { useRouter, usePathname } from "next/navigation";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { MediaModel, ModelLabelMap } from "@/types/models";

export interface MediaModelCardProps {
  data: MediaModel;
  displayMode?: "block" | "row";
  variant?: "default" | "square";
}

export default function MediaModelCard({
  data,
  displayMode = "block",
  variant = "default",
}: MediaModelCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const businessPathname = getPathnameWithoutLocale(pathname);
  const { locale } = useI18n();

  const modelName = data.name || data.id.toString();
  const displayModelName = data.displayName;
  const series = data.series;
  const infos = data.infos || [];
  const link = data.link;
  const tags = data.tags;

  // Build labelDataList: prefer display labels from model.labels, fallback to isNew/isHot
  const labelDataList: LabelData[] = (() => {
    const displayLabels = data.labels
      ?.filter((l) => l.key === ModelLabelMap.Display)
      .map((l) => ({ text: l.value, type: "normal" as const }));
    if (displayLabels && displayLabels.length > 0) {
      return displayLabels;
    }
    const fallback: LabelData[] = [];
    if (data.isNew) fallback.push({ text: "New", type: "normal" });
    if (data.isHot) fallback.push({ text: "Hot", type: "normal" });
    return fallback;
  })();

  const handleClick = () => {
    analytics.trackClick(
      businessPathname === NOVITA_URL.MODEL_LIBRARY_INDEX
        ? CLICK_BTN_IDs.MODELS_BTNS.LIBRARY_CARD
        : CLICK_BTN_IDs.MODELS_CONSOLE.MODEL_LIB_CARD_CLICK,
      {
        apiName: displayModelName || modelName,
      },
    );

    if (link) {
      router.push(getLocalizedPath(link, locale));
    }
  };

  const Component = displayMode === "row" ? BaseRowModelCard : BaseModelCard;
  return (
    <Component
      modelName={modelName}
      displayName={displayModelName}
      series={series}
      tags={tags}
      infos={infos}
      clickable={!!link}
      labelDataList={labelDataList}
      onClick={handleClick}
      variant={displayMode === "row" ? undefined : variant}
    />
  );
}
