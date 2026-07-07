"use client";

import Link from "next/link";
import {
  AudioLines,
  Bot,
  Braces,
  ChevronDown,
  ChevronRight,
  FileImage,
  Film,
  MessageCircleCode,
  Search,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { AnyModel } from "@/lib/model-library/capabilities";
import {
  getDisplayModelActions,
  getModelActionLinks,
} from "@/lib/model-library/actions";
import {
  getModelCapabilities,
  type ConsoleModelFeature,
} from "@/lib/model-library/capabilities";
import { getPrimaryModelBadge } from "@/lib/model-library/badges";
import {
  formatLongContextTag,
  formatModelDate,
  formatTokenWindow,
} from "@/lib/model-library/display-format";
import {
  getListExpandedPriceLines,
  getListSummaryPriceLines,
  getModelExpandLabel,
  getExpandedModelPriceLines,
  getModelPriceLines,
  getTieredPricingRows,
  type PriceLine,
  type TieredPricingRow,
} from "@/lib/model-library/pricing";
import { ConsoleModelBadge } from "./ConsoleModelBadge";
import { ConsoleExpandedPriceDetails } from "./ConsoleExpandedPriceDetails";
import { ConsoleLegacyExpandedPriceBlock } from "./ConsoleLegacyExpandedPriceBlock";
import { ConsoleMultimodalExpandedTable } from "./ConsoleMultimodalExpandedTable";
import {
  LLMModelModality,
  ModelType,
  type LLMModelWithStatus,
} from "@/types/models";

interface ConsoleModelListProps {
  models: AnyModel[];
}

const capabilityLabels: Record<ConsoleModelFeature, string> = {
  "tool-calling": "Tool calling",
  "json-schema": "JSON schema",
  reasoning: "Reasoning",
  "long-context": "Long context",
};

const modalityIconMap: Record<string, LucideIcon> = {
  text: MessageCircleCode,
  llm: MessageCircleCode,
  vision: FileImage,
  image: FileImage,
  audio: AudioLines,
  video: Film,
  "ai-search": Search,
  embedding: Braces,
  reranker: Bot,
};

type ModalityFlowData = {
  inputs: string[];
  outputs: string[];
};

function isLLMModel(model: AnyModel): model is LLMModelWithStatus {
  return "context_size" in model;
}

function getReleaseText(model: AnyModel) {
  return formatModelDate(model.platform_release_at) ?? "-";
}

function getContextText(model: AnyModel) {
  if (!isLLMModel(model)) {
    return null;
  }

  const context = formatTokenWindow(model.context_size);
  const maxOutput = formatTokenWindow(model.max_output_tokens);

  if (context === "-" && maxOutput === "-") {
    return null;
  }

  if (maxOutput === "-") {
    return `${context} Context`;
  }

  return `${context} Context · ${maxOutput} Max Output`;
}

function getMediaInfoLines(model: AnyModel): string[] {
  if (isLLMModel(model)) {
    return [];
  }

  const [, ...restInfoGroups] = model.infos ?? [];
  return restInfoGroups
    .flatMap((item) => (Array.isArray(item) ? item : [item]))
    .flatMap((item) => {
      const value = String(item ?? "").trim();
      return value ? [value] : [];
    });
}

function getSupportText(model: AnyModel) {
  return (
    getContextText(model) ?? getMediaInfoLines(model).slice(0, 2).join(" · ")
  );
}

function getVisiblePriceLines(priceLines: PriceLine[]) {
  const order = ["Text · Input", "Text · Output", "Input", "Output"];
  return order.flatMap((label) => {
    const line = priceLines.find((item) => item.label === label);
    return line ? [line] : [];
  });
}

function getSummaryPriceLines(model: AnyModel, priceLines: PriceLine[]) {
  const listSummaryPriceLines = getListSummaryPriceLines(model);
  if (listSummaryPriceLines.length > 0) {
    const hasMultimodalSummary = listSummaryPriceLines.some(
      (line) => line.modality !== undefined,
    );

    return hasMultimodalSummary
      ? listSummaryPriceLines.filter(
          (line) => line.kind === "input" || line.kind === "output",
        )
      : listSummaryPriceLines;
  }

  if (isLLMModel(model)) {
    return getVisiblePriceLines(priceLines);
  }

  return priceLines.slice(0, 3);
}

function getPriceLabel(label: string) {
  if (label.toLowerCase() === "cache read") return "Cache Read";
  if (label.toLowerCase() === "cache write") return "Cache Write";
  if (label.toLowerCase() === "text · cache read") return "Text · Cache Read";
  if (label.toLowerCase() === "text · cache write") return "Text · Cache Write";
  if (label.toLowerCase() === "text · cache write 1h")
    return "Text · Cache Write 1h";
  if (label.toLowerCase() === "price") return "";
  return label;
}

function getModelFeatureTags(
  model: AnyModel,
  capabilities: ConsoleModelFeature[],
) {
  const capabilityTags = capabilities.map((capability) => {
    if (capability === "long-context" && isLLMModel(model)) {
      return formatLongContextTag(model.context_size);
    }

    return capabilityLabels[capability] ?? capability;
  });

  return [...capabilityTags, ...(model.tags ?? [])].filter(
    (tag, index, values) => values.indexOf(tag) === index,
  );
}

function dedupeModalities(modalities: string[]) {
  return modalities.filter(
    (modality, index, values) => values.indexOf(modality) === index,
  );
}

function normalizeModality(modality: unknown) {
  const value = String(modality ?? "").toLowerCase();
  if (value === LLMModelModality.Text) return "text";
  if (value === LLMModelModality.Image) return "image";
  if (value === LLMModelModality.Audio) return "audio";
  if (value === LLMModelModality.Video) return "video";
  return null;
}

function hasMediaTag(model: AnyModel, keyword: string) {
  const normalizedKeyword = keyword.toLowerCase();
  return [model.displayName, model.name, ...(model.tags ?? [])].some((item) =>
    String(item ?? "")
      .toLowerCase()
      .includes(normalizedKeyword),
  );
}

function getModelModalityFlow(model: AnyModel): ModalityFlowData {
  if (isLLMModel(model)) {
    const inputs = dedupeModalities(
      (model.inputModalities ?? []).flatMap((item) => {
        const modality = normalizeModality(item);
        return modality ? [modality] : [];
      }),
    );
    const outputs = dedupeModalities(
      (model.outputModalities ?? []).flatMap((item) => {
        const modality = normalizeModality(item);
        return modality ? [modality] : [];
      }),
    );

    return {
      inputs: inputs.length > 0 ? inputs : ["text"],
      outputs: outputs.length > 0 ? outputs : ["text"],
    };
  }

  const inputs: string[] = [];
  if (hasMediaTag(model, "text to") || hasMediaTag(model, "text-to")) {
    inputs.push("text");
  }
  if (
    hasMediaTag(model, "image to") ||
    hasMediaTag(model, "image-to") ||
    hasMediaTag(model, "start-end") ||
    hasMediaTag(model, "reference")
  ) {
    inputs.push("image");
  }
  if (hasMediaTag(model, "audio to") || hasMediaTag(model, "speech to")) {
    inputs.push("audio");
  }
  if (hasMediaTag(model, "video to") || hasMediaTag(model, "video edit")) {
    inputs.push("video");
  }

  const outputs =
    model.type === ModelType.Images
      ? ["image"]
      : model.type === ModelType.Audio
        ? hasMediaTag(model, "speech to text") ||
          hasMediaTag(model, "audio to text")
          ? ["text"]
          : ["audio"]
        : model.type === ModelType.Video
          ? ["video"]
          : ["text"];

  return {
    inputs: dedupeModalities(inputs.length > 0 ? inputs : ["text"]),
    outputs,
  };
}

function SummaryText({
  priceLines,
  supportText,
  highlighted,
}: {
  priceLines: PriceLine[];
  supportText: string;
  highlighted: boolean;
}) {
  return (
    <p className="min-w-0 truncate font-miletus text-paragraph-12 text-[var(--text-3)]">
      {priceLines.map((line, index) => {
        const label = getPriceLabel(line.label);
        return (
          <span
            key={`${line.label}-${line.value}`}
            className={cn(
              "text-[var(--text-1)]",
              (highlighted || line.discounted) && "text-brand-1",
            )}
          >
            {index > 0 ? " · " : null}
            {label ? `${label}  ` : null}
            {line.value}
          </span>
        );
      })}
      {supportText ? (
        <span>
          {priceLines.length > 0 ? " · " : null}
          {supportText}
        </span>
      ) : null}
    </p>
  );
}

function TieredRows({
  rows,
  hasDiscount,
}: {
  rows: TieredPricingRow[];
  hasDiscount: boolean;
}) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-space-8 font-miletus text-paragraph-12">
      {rows.slice(0, 2).map((row) => (
        <div
          key={row.inputRange}
          className="flex gap-space-8 bg-fill-4 p-space-8"
        >
          <div className="flex min-w-[100px] flex-col gap-space-4 lg:w-[300px]">
            <span className="text-[var(--text-3)]">Input length</span>
            <span className="text-[var(--text-1)]">{row.inputRange}</span>
          </div>
          <div className="flex min-w-0 flex-1 items-start gap-space-8 whitespace-nowrap">
            {row.prices.map((price) => (
              <div
                key={price.label}
                className="flex min-w-0 flex-1 flex-col gap-space-4"
              >
                <span className="text-[var(--text-3)]">{price.label}</span>
                <span
                  className={cn(
                    "text-[var(--text-1)]",
                    (hasDiscount || price.discounted) && "text-brand-1",
                  )}
                >
                  {price.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ModalityFlow({ flow }: { flow: ModalityFlowData }) {
  const inputModalities = flow.inputs.slice(0, 4);
  const outputModalities = flow.outputs.slice(0, 4);

  if (inputModalities.length === 0 && outputModalities.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-space-8 text-element-mid-em">
      <div className="flex items-center gap-space-4">
        {inputModalities.map((modality) => {
          const Icon = modalityIconMap[modality] ?? Bot;
          return (
            <Icon
              key={modality}
              className="h-space-12 w-space-12"
              aria-hidden="true"
            />
          );
        })}
      </div>
      {outputModalities.length > 0 ? (
        <>
          <ChevronRight className="h-space-12 w-space-12" aria-hidden="true" />
          <div className="flex items-center gap-space-4">
            {outputModalities.map((modality) => {
              const Icon = modalityIconMap[modality] ?? Bot;
              return (
                <Icon
                  key={`out-${modality}`}
                  className="h-space-12 w-space-12"
                  aria-hidden="true"
                />
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function ConsoleModelList({ models }: ConsoleModelListProps) {
  const [expandedModelId, setExpandedModelId] = useState<
    string | number | null
  >(null);

  return (
    <div className="flex flex-col gap-space-8">
      {models.map((model) => {
        const badge = getPrimaryModelBadge(model);
        const priceLines = getModelPriceLines(model);
        const summaryPriceLines = getSummaryPriceLines(model, priceLines);
        const detailPriceLines = getExpandedModelPriceLines(model);
        const listExpandedPriceLines = getListExpandedPriceLines(model);
        const tierRows = isLLMModel(model) ? getTieredPricingRows(model) : [];
        const expandLabel = getModelExpandLabel(model);
        const showTiered = expandLabel === "Tiered";
        const showLabeledExpandButton =
          expandLabel === "Tiered" || expandLabel === "Multimodal";
        const hasMultimodalDetails = listExpandedPriceLines.length > 0;
        const multimodalTableLines = summaryPriceLines
          .filter(
            (line) =>
              line.modality === "text" &&
              (line.kind === "input" || line.kind === "output"),
          )
          .concat(listExpandedPriceLines);
        const expandable = true;
        const expanded = expandedModelId === model.id;
        const capabilities = getModelCapabilities(model);
        const featureTags = getModelFeatureTags(model, capabilities);
        const modalityFlow = getModelModalityFlow(model);
        const actions = getDisplayModelActions(getModelActionLinks(model));
        const hasActions = actions.length > 0;
        const hasDiscount = badge?.kind === "discount";
        const supportText = getSupportText(model);

        const toggleExpanded = () => {
          if (!expandable) {
            return;
          }

          setExpandedModelId((current) =>
            current === model.id ? null : model.id,
          );
        };

        return (
          <article
            key={model.id}
            onClick={() => {
              if (!expandable) {
                return;
              }

              toggleExpanded();
            }}
            onKeyDown={(event) => {
              if (!expandable) {
                return;
              }

              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleExpanded();
              }
            }}
            className={cn(
              "group relative flex w-full flex-col gap-space-8 rounded-4 border border-[var(--border-2)] bg-fill-white px-space-16 py-space-12 transition-colors duration-200 hover:border-[var(--border-1)]",
              expandable &&
                "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0",
            )}
            role={expandable ? "button" : undefined}
            tabIndex={expandable ? 0 : undefined}
            aria-expanded={expandable ? expanded : undefined}
          >
            <div className="grid min-w-0 grid-cols-[minmax(250px,36%)_minmax(0,1fr)_minmax(132px,auto)] items-center gap-space-24">
              <div className="flex min-w-0 items-center gap-space-4">
                <h2 className="truncate font-miletus text-paragraph-14 text-[var(--text-1)]">
                  {model.displayName || model.name}
                </h2>
                {badge ? (
                  <ConsoleModelBadge badge={badge} className="h-space-16" />
                ) : null}
              </div>

              <div className="flex min-w-0 flex-1 items-center gap-space-4">
                <SummaryText
                  priceLines={summaryPriceLines}
                  supportText={supportText}
                  highlighted={
                    hasDiscount ||
                    summaryPriceLines.some((line) => line.discounted)
                  }
                />
                {showLabeledExpandButton ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleExpanded();
                    }}
                    className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-8 border border-brand-1 pl-space-8 pr-space-2 font-miletus text-paragraph-12 text-brand-1 transition-colors duration-200 hover:bg-brand-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0"
                    aria-expanded={expanded}
                    aria-label={expandLabel ?? "Expand details"}
                  >
                    {expandLabel ? <span>{expandLabel}</span> : null}
                    <ChevronDown
                      className={cn(
                        "h-space-12 w-space-12 transition-transform duration-200",
                        expanded && "rotate-180",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                ) : null}
              </div>

              <p
                className={cn(
                  "shrink-0 justify-self-end whitespace-nowrap text-right font-miletus text-paragraph-12 text-[var(--text-1)] transition-opacity duration-200",
                  hasActions &&
                    "group-hover:opacity-0 group-focus-within:opacity-0",
                  expanded && "opacity-0",
                )}
              >
                {getReleaseText(model)}
              </p>
            </div>

            {expanded ? (
              <>
                <div className="h-px border-t border-dashed border-[var(--border-2)]" />
                {showTiered ? (
                  <TieredRows rows={tierRows} hasDiscount={hasDiscount} />
                ) : null}
                {!showTiered ? (
                  hasMultimodalDetails ? (
                    <ConsoleMultimodalExpandedTable
                      lines={multimodalTableLines}
                      cacheLines={[]}
                      forceDiscountColor={hasDiscount}
                    />
                  ) : showLabeledExpandButton ? (
                    <ConsoleExpandedPriceDetails
                      lines={
                        detailPriceLines.length > 0
                          ? detailPriceLines
                          : priceLines
                      }
                      forceDiscountColor={hasDiscount}
                    />
                  ) : (
                    <ConsoleLegacyExpandedPriceBlock
                      lines={priceLines}
                      forceDiscountColor={hasDiscount}
                    />
                  )
                ) : null}
                <div className="flex items-center gap-space-8">
                  <div className="flex min-w-0 flex-1 flex-wrap gap-space-4">
                    {featureTags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center justify-center rounded-4 border border-[var(--border-2)] bg-fill-4 px-space-6 py-space-4 font-tt-mono text-mono-12 uppercase text-[var(--text-1)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <ModalityFlow flow={modalityFlow} />
                </div>
              </>
            ) : null}

            {hasActions ? (
              <div
                className={cn(
                  "absolute right-space-8 top-space-8 flex gap-space-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100",
                  expanded && "opacity-100",
                )}
              >
                {actions.map((action) => (
                  <Link
                    key={`${action.kind}-${action.href}`}
                    href={action.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className={
                      action.kind === "playground"
                        ? "inline-flex h-space-24 cursor-pointer items-center justify-center rounded-full bg-element-high-em px-space-8 font-miletus text-paragraph-12 text-white transition-colors duration-200 hover:bg-element-low-em focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0"
                        : "inline-flex h-space-24 cursor-pointer items-center justify-center rounded-full border border-[var(--border-strong)] bg-fill-white px-space-8 font-miletus text-paragraph-12 text-[var(--text-1)] transition-colors duration-200 hover:border-brand-1 hover:text-brand-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0"
                    }
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
