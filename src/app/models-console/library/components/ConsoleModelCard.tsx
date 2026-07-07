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
  type LucideIcon,
} from "lucide-react";
import { useState, type KeyboardEvent, type MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getModelCapabilities,
  type AnyModel,
} from "@/lib/model-library/capabilities";
import {
  getDisplayModelActions,
  getModelActionLinks,
} from "@/lib/model-library/actions";
import { getPrimaryModelBadge } from "@/lib/model-library/badges";
import {
  formatLongContextTag,
  formatModelDate,
  formatTokenWindow,
} from "@/lib/model-library/display-format";
import {
  getExpandedModelPriceLines,
  getModelExpandLabel,
  getModelPriceLines,
  getTieredPricingRows,
  type PriceLine,
  type TieredPricingRow,
} from "@/lib/model-library/pricing";
import { ConsoleModelBadge } from "./ConsoleModelBadge";
import { ConsoleTieredPricingPopover } from "./ConsoleTieredPricingPopover";
import {
  LLMModelModality,
  ModelType,
  type LLMModelWithStatus,
} from "@/types/models";

interface ConsoleModelCardProps {
  model: AnyModel;
}

const capabilityLabels: Record<string, string> = {
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
  embedding: Braces,
  reranker: Bot,
};

function isLLMModel(model: AnyModel): model is LLMModelWithStatus {
  return "context_size" in model;
}

function getModelSubtitle(model: AnyModel) {
  if (model.series) {
    return model.series;
  }
  return model.type;
}

function getDateRows(model: AnyModel) {
  const modelReleasedAt =
    "model_released_at" in model ? model.model_released_at : undefined;
  const platformReleaseAt =
    "platform_release_at" in model ? model.platform_release_at : undefined;

  return [
    {
      label: "Model released",
      value: formatModelDate(modelReleasedAt) ?? "-",
    },
    { label: "On Novita", value: formatModelDate(platformReleaseAt) ?? "-" },
  ];
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

function getCacheWriteSortValue(label: string) {
  const normalized = label.toLowerCase();
  if (normalized === "cache write") {
    return 0;
  }

  const match = normalized.match(/cache write\s+(\d+(?:\.\d+)?)\s*(m|h|d)?/);
  if (!match) {
    return Number.MAX_SAFE_INTEGER;
  }

  const value = Number(match[1]);
  const unit = match[2] ?? "m";
  const unitMultiplier = unit === "d" ? 1440 : unit === "h" ? 60 : 1;
  return value * unitMultiplier;
}

function isExtraCacheWritePriceLine(line: PriceLine) {
  const label = line.label.toLowerCase();
  return /cache write\s+\d/.test(label);
}

function getCardPriceLineOrder(includeDefaultCacheLines: boolean) {
  return includeDefaultCacheLines
    ? [
        "Text · Input",
        "Text · Output",
        "Input",
        "Output",
        "Text · Cache Read",
        "Text · Cache Write",
        "Cache read",
        "Cache write",
      ]
    : ["Text · Input", "Text · Output", "Input", "Output"];
}

function getVisiblePriceLines(
  priceLines: PriceLine[],
  includeExpandedCacheWrites: boolean,
  includeDefaultCacheLines: boolean,
  appendRemainingLines = false,
) {
  const order = getCardPriceLineOrder(includeDefaultCacheLines);
  const usedLabels = new Set<string>();
  const orderedLines = order.flatMap((label) => {
    const line = priceLines.find((item) => item.label === label);
    const isCacheWriteLabel =
      label === "Cache write" || label === "Text · Cache Write";

    if (!isCacheWriteLabel || !includeExpandedCacheWrites) {
      if (line) {
        usedLabels.add(line.label);
        return [line];
      }
      return [];
    }

    const cacheWriteLines = priceLines
      .filter((item) => {
        if (!isExtraCacheWritePriceLine(item)) {
          return false;
        }

        if (
          label === "Text · Cache Write" &&
          !item.label.toLowerCase().startsWith("text · cache write")
        ) {
          return false;
        }

        if (
          label === "Cache write" &&
          !item.label.toLowerCase().startsWith("cache write")
        ) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          getCacheWriteSortValue(a.label) - getCacheWriteSortValue(b.label),
      );

    const lines = line ? [line, ...cacheWriteLines] : cacheWriteLines;
    lines.forEach((item) => usedLabels.add(item.label));
    return lines;
  });

  if (!appendRemainingLines) {
    return orderedLines;
  }

  return [
    ...orderedLines,
    ...priceLines.filter((item) => !usedLabels.has(item.label)),
  ];
}

function getSummaryPriceLines(
  priceLines: PriceLine[],
  includeDefaultCacheLines: boolean,
) {
  const order = getCardPriceLineOrder(includeDefaultCacheLines);
  return order.flatMap((label) => {
    const line = priceLines.find((item) => item.label === label);
    return line ? [line] : [];
  });
}

function getDisplayPriceLines(
  summaryPriceLines: PriceLine[],
  expandedPriceLines: PriceLine[],
  expanded: boolean,
  includeExpandedCacheWrites: boolean,
  includeDefaultCacheLines: boolean,
) {
  if (!expanded) {
    return getSummaryPriceLines(summaryPriceLines, includeDefaultCacheLines);
  }

  if (expandedPriceLines.length > 0) {
    return getVisiblePriceLines(
      expandedPriceLines,
      includeExpandedCacheWrites,
      includeDefaultCacheLines,
      true,
    );
  }

  return getVisiblePriceLines(
    summaryPriceLines,
    includeExpandedCacheWrites,
    includeDefaultCacheLines,
  );
}

function PriceValue({
  line,
  forceDiscountColor,
}: {
  line: PriceLine;
  forceDiscountColor?: boolean;
}) {
  return (
    <span
      className={cn(
        "whitespace-nowrap text-[var(--text-1)]",
        (line.discounted || forceDiscountColor) && "text-brand-1",
      )}
    >
      {line.value}
    </span>
  );
}

function getMediaOutputLabel(model: AnyModel) {
  if (model.type === ModelType.Images) return "Image";
  if (model.type === ModelType.Audio) return "Audio";
  if (model.type === ModelType.Video) return "Video";
  if (model.type === ModelType.AISearch) return "Search";
  return model.type;
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

function getModelFeatureTags(model: AnyModel, capabilities: string[]) {
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
    <div className="flex flex-col gap-space-4 font-miletus text-paragraph-12">
      {rows.slice(0, 2).map((row, index) => (
        <div
          key={`${row.inputRange}-${index}`}
          className="flex flex-wrap items-start gap-space-8 rounded-2 bg-fill-4 p-space-8"
        >
          <div className="flex w-[132px] shrink-0 flex-col gap-space-4">
            <span className="text-[var(--text-3)]">Input length</span>
            <span className="text-[var(--text-1)]">{row.inputRange}</span>
          </div>
          <div className="grid min-w-[132px] flex-1 grid-cols-2 gap-x-space-8 gap-y-space-8 whitespace-nowrap">
            {row.prices.map((price) => (
              <div key={price.label} className="flex flex-col gap-space-4">
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

type ModalityFlowData = {
  inputs: string[];
  outputs: string[];
};

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

function shouldIgnoreExpandToggle(
  target: EventTarget | null,
  currentTarget: HTMLElement,
) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const interactiveElement = target.closest(
    'a, button, input, textarea, select, [role="button"], [contenteditable="true"]',
  );

  return Boolean(interactiveElement && interactiveElement !== currentTarget);
}

export function ConsoleModelCard({ model }: ConsoleModelCardProps) {
  const [tieredExpanded, setTieredExpanded] = useState(false);
  const [cardActive, setCardActive] = useState(false);
  const badge = getPrimaryModelBadge(model);
  const isLLM = isLLMModel(model);
  const priceLines = getModelPriceLines(model);
  const expandedPriceLines = getExpandedModelPriceLines(model);
  const mediaInfoLines = getMediaInfoLines(model);
  const dateRows = getDateRows(model);
  const contextText = getContextText(model);
  const tierRows = isLLM ? getTieredPricingRows(model) : [];
  const expandLabel = getModelExpandLabel(model);
  const showTiered = expandLabel === "Tiered";
  const hasMultimodalDetails = expandedPriceLines.length > priceLines.length;
  const capabilities = getModelCapabilities(model);
  const featureTags = getModelFeatureTags(model, capabilities);
  const modalityFlow = getModelModalityFlow(model);
  const showExpandableDetails = true;
  const showExpandControl = true;
  const includeDefaultCacheLines = !hasMultimodalDetails;
  const visiblePriceLines = getDisplayPriceLines(
    priceLines,
    expandedPriceLines,
    tieredExpanded,
    tieredExpanded,
    includeDefaultCacheLines,
  );
  const actions = getDisplayModelActions(getModelActionLinks(model));
  const hasDiscount = badge?.kind === "discount";
  const hideDateRows = tieredExpanded && hasMultimodalDetails && !showTiered;
  const handleExpand = () => {
    if (!showExpandableDetails || tieredExpanded) {
      return;
    }

    setTieredExpanded(true);
  };

  const handleCardBodyClick = (event: MouseEvent<HTMLDivElement>) => {
    if (shouldIgnoreExpandToggle(event.target, event.currentTarget)) {
      return;
    }

    handleExpand();
  };

  const handleCardBodyKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleExpand();
  };

  return (
    <div className="relative h-[270px]">
      <article
        onMouseEnter={() => setCardActive(true)}
        onMouseLeave={(event) => {
          const activeElement = document.activeElement;
          if (
            activeElement instanceof HTMLElement &&
            event.currentTarget.contains(activeElement)
          ) {
            activeElement.blur();
          }
          setCardActive(false);
          setTieredExpanded(false);
        }}
        onFocus={() => setCardActive(true)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setCardActive(false);
            setTieredExpanded(false);
          }
        }}
        className={cn(
          "group absolute inset-x-0 top-0 z-0 flex min-h-[270px] flex-col justify-center overflow-visible rounded-4 border border-[var(--border-2)] bg-fill-white transition-[border-color,box-shadow,z-index] duration-200 hover:z-10 hover:border-[var(--border-1)]",
          !tieredExpanded && "h-[270px]",
          tieredExpanded && "z-20 h-auto shadow-3",
        )}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={handleCardBodyClick}
          onKeyDown={handleCardBodyKeyDown}
          className={cn(
            "relative flex min-h-0 flex-1 cursor-pointer flex-col gap-space-16 p-space-16 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0",
            !tieredExpanded && "overflow-hidden",
          )}
          aria-label={model.displayName || model.name}
          aria-expanded={tieredExpanded}
        >
          <div className="flex min-w-0 flex-col gap-space-2">
            <div className="flex h-[18px] min-w-0 items-center justify-between gap-space-6">
              <p className="min-w-0 truncate font-miletus text-paragraph-12 leading-none text-[var(--text-4)]">
                {getModelSubtitle(model)}
              </p>
              {badge ? (
                <ConsoleModelBadge
                  badge={badge}
                  className="h-[18px] font-medium leading-none"
                />
              ) : null}
            </div>
            <h2 className="truncate font-miletus text-paragraph-18 text-[var(--text-1)]">
              {model.displayName || model.name}
            </h2>
          </div>

          <div className="h-px border-t border-dashed border-[var(--border-2)]" />

          {isLLM ? (
            <div className="flex min-h-0 flex-col gap-space-4">
              {visiblePriceLines.map((line) => (
                <div
                  key={`${line.label}-${line.value}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-space-8 font-miletus text-paragraph-12"
                >
                  <span className="truncate text-[var(--text-3)]">
                    {line.label}
                  </span>
                  <PriceValue line={line} forceDiscountColor={hasDiscount} />
                </div>
              ))}
              <div className="flex items-center gap-space-8">
                <p className="min-w-0 flex-1 truncate font-miletus text-paragraph-12 text-[var(--text-3)]">
                  {contextText ?? model.type}
                </p>
                {expandLabel ? (
                  <ConsoleTieredPricingPopover
                    expanded={tieredExpanded}
                    label={expandLabel}
                  />
                ) : null}
              </div>
              {visiblePriceLines.length === 0 ? (
                <p className="font-miletus text-paragraph-12 text-[var(--text-3)]">
                  {priceLines[0]?.value ?? "Pricing available in details"}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-0 flex-col gap-space-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-space-8 font-miletus text-paragraph-12">
                <span className="truncate text-[var(--text-3)]">
                  {getMediaOutputLabel(model)}
                </span>
                {priceLines[0] ? (
                  <PriceValue
                    line={priceLines[0]}
                    forceDiscountColor={hasDiscount}
                  />
                ) : (
                  <span className="whitespace-nowrap text-[var(--text-1)]">
                    Pricing available in details
                  </span>
                )}
              </div>
              {mediaInfoLines.slice(0, 2).map((line) => (
                <p
                  key={line}
                  className="truncate font-miletus text-paragraph-12 text-[var(--text-3)]"
                >
                  {line}
                </p>
              ))}
            </div>
          )}

          {tieredExpanded ? (
            <>
              {showTiered ? (
                <TieredRows rows={tierRows} hasDiscount={hasDiscount} />
              ) : null}
              <div className="flex flex-col gap-space-8">
                {featureTags.length > 0 ? (
                  <div className="flex flex-wrap gap-space-4">
                    {featureTags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center justify-center rounded-4 border border-[var(--border-2)] bg-fill-4 px-space-6 py-space-4 font-tt-mono text-mono-12 uppercase text-[var(--text-1)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <ModalityFlow flow={modalityFlow} />
              </div>
            </>
          ) : null}
        </div>

        <div className="relative h-[68px] shrink-0 border-t border-dashed border-[var(--border-2)] px-space-16 py-space-16">
          {showExpandControl ? (
            <button
              type="button"
              onClick={() => {
                setTieredExpanded((current) => !current);
              }}
              className="absolute left-1/2 top-0 z-10 flex h-space-24 w-space-24 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--border-3)] bg-fill-white text-element-low-em opacity-0 transition-colors duration-200 hover:text-element-high-em focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0 group-hover:opacity-100 group-focus-within:opacity-100"
              aria-label={
                tieredExpanded
                  ? "Collapse model details"
                  : "Expand model details"
              }
              aria-expanded={tieredExpanded}
            >
              <ChevronDown
                className={cn(
                  "h-space-12 w-space-12 transition-transform duration-200",
                  tieredExpanded && "rotate-180",
                )}
                aria-hidden="true"
              />
            </button>
          ) : null}
          {!hideDateRows ? (
            <div
              className={cn(
                "absolute inset-space-16 flex flex-col gap-space-4 font-miletus text-paragraph-12 transition-opacity duration-200",
                cardActive ? "opacity-0" : "opacity-100",
              )}
            >
              {dateRows.length > 0 ? (
                dateRows.map((row, index) => (
                  <div
                    key={row.label}
                    className="grid grid-cols-[1fr_auto] gap-space-12"
                  >
                    <span className="text-[var(--text-3)]">{row.label}</span>
                    <span
                      className={cn(
                        "text-[var(--text-3)]",
                        index === dateRows.length - 1 && "text-[var(--text-1)]",
                      )}
                    >
                      {row.value}
                    </span>
                  </div>
                ))
              ) : (
                <div className="grid grid-cols-[1fr_auto] gap-space-12">
                  <span className="text-[var(--text-3)]">Context</span>
                  <span className="text-[var(--text-1)]">
                    {contextText ?? "-"}
                  </span>
                </div>
              )}
            </div>
          ) : null}

          <div
            className={cn(
              "absolute inset-space-16 flex gap-space-12 transition-opacity duration-200",
              cardActive
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0",
            )}
          >
            {actions.map((action) =>
              action.kind === "playground" ? (
                <Button
                  key={`${action.kind}-${action.href}`}
                  asChild
                  variant="default"
                  size="link"
                  className="h-[var(--height-36)] min-w-0 flex-1 px-space-20"
                >
                  <Link href={action.href} target="_blank" rel="noreferrer">
                    {action.label}
                  </Link>
                </Button>
              ) : (
                <Link
                  key={`${action.kind}-${action.href}`}
                  href={action.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-[var(--height-36)] min-w-0 flex-1 items-center justify-center rounded-full border border-[var(--border-strong)] bg-fill-white px-space-20 font-miletus text-paragraph-15 text-[var(--text-1)] transition-colors duration-200 hover:border-brand-1 hover:text-brand-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-0"
                >
                  {action.label === "More" ? "More info" : action.label}
                </Link>
              ),
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
