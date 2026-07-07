"use client";
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  calcPrice,
  getDefaultParmas,
  CALC_CATEGORY_MAP,
} from "@/lib/utils/pricing";
import { getAudioModelUnit } from "@/constants/model-library-config";
import FUNCS, {
  FUNC_NAME,
  FUNC_TYPE,
  FUNC_TYPE_NAME,
} from "@/app/models/constants/funcs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DOCS_URL } from "@/constants/urls";
import { formatMoneyDisplay } from "@/lib/utils/money";
import map from "lodash/map";
import debounce from "lodash/debounce";
import Big from "big.js";
import CalculatorModal from "./CalculatorModal";
import { Skeleton } from "@/components/ui/skeleton";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import styles from "./ModelAPIPrice.module.scss";
import LLMModelsSection from "./LLMModelsSection";
import { LLMModelWithStatus } from "@/types/models";
import PricingModelFilter, { PricingFilterType } from "./PricingModelFilter";
import { DynamicModelConfig } from "@/types/dynamic-pricing";
import { generateDynamicMultimodalPricingTableRows } from "@/lib/utils/dynamic-pricing/model-table-adapter";
import { extractPrimaryPath } from "@/lib/utils/dynamic-pricing/model-library-adapter";
import { getPathForStaticRow } from "@/lib/utils/static-row-path";
import AISearchPrice from "./AISearchPrice";
import { computeRowSpanMaps } from "./tableRowSpan";
import PricingMobileCard from "./PricingMobileCard";
function createCopy() {
  return {
    title:
      "Novita AI Pricing for Model APIs  - One of The Cheapest Model API Providers",
    description:
      "Explore the potential of Novita AI's cheapest and best Stable Diffusion and LLM APIs. Try for free and pay for what you use.",
    topup_guide: {
      title: "Pricing",
      desc: "Choose a pricing plan that suits you",
      btn: "Top Up",
    },
    tabs: {
      inferential_pricing:
        "Access and utilize industry-leading open-source models, including text, image, audio, and video models. Pay for what you use, with no hidden fees.",
      dedicated_endpoints: "Choose the best plan for your needs.",
    },
    pricing_table: {
      llm: {
        name: "Model Name",
        context: "Context",
        input: "Input",
        output: "Output",
        unit: "Mt",
        token_range: "Input Token Range",
      },
      image: {
        name: "API Name",
        description1:
          "Pricing may vary based on image dimensions, inference steps, and upscaling factors. Use the",
        description2: "for an estimate.",
        resolution: "Width&Height",
        steps: "Steps/Scale",
        price: "Pricing",
        unit: "image",
      },
      video: {
        name: "API Name",
        description1:
          "Pricing may vary based on the number of frames, chosen model, and inference steps. Use the",
        description2: "for an estimate.",
        frames: "Total Frames",
        resolution: "Width&Height",
        model: "Model",
        steps: "Steps",
        price: "Pricing",
        unit: "video",
      },
      audio: {
        name: "API Name",
        price: "Pricing",
        unit: "1M characters",
      },
      training: {
        name: "Name",
        resolution: "Width&Height",
        steps: "Steps",
        isSDXL: "Base Model Is SDXL",
        price: "Pricing",
        unit: "call",
      },
    },
    calculator: {
      name: "Pricing Calculator",
      api_name: "API Name",
      width: "Width",
      height: "Height",
      steps: "Steps",
      scale: "Scale",
      model: "Model",
      frames: "Frames",
      price: "Price",
      connector: ": ",
      currency_symbol: "$",
    },
    enterprise_plan: {
      standard: {
        title: "Standard",
        description:
          "For teams looking for a balance between cost and features.",
        per_month: "per month",
        contact_sales: "Contact Sales",
        features: {
          gpu: "Access to GPU for accelerated processing",
          unlimited_images: "Unlimited images",
          support: "Priority support",
          models: "Access to a wide range of models",
          text_to_image: "Text-to-image generation",
          image_to_image: "Image-to-image generation",
        },
      },
      pro: {
        title: "Pro",
        description:
          "For teams needing the highest level of performance and support.",
        per_month: "per month",
        contact_sales: "Contact Sales",
        features: {
          gpu: "Access to GPU for accelerated processing",
          unlimited_images: "Unlimited images",
          support: "Priority support",
          models: "Access to a wide range of models",
          text_to_image: "Text-to-image generation",
          image_to_image: "Image-to-image generation",
        },
      },
    },
  };
}
type AspectRatio = "21:9 & 9:21" | "16:9 & 9:16" | "4:3 & 3:4" | "1:1";
type Resolution = "480P" | "720P" | "1080P";
type Duration = 5 | 10;
interface SeedanceTableRow {
  name: string;
  rowSpan?: number;
  func: string;
  duration: Duration;
  resolution: Resolution;
  ratio: AspectRatio;
}
interface SeedanceV15ProTableRow {
  name: string;
  rowSpan?: number;
  func: string;
  resolution: "480P" | "720P";
  frameType?: "FLF" | "FF";
  audioType: "SILENT" | "AUDIO";
  batchMode: "ONLINE" | "BATCH";
  unit?: string;
}
const SEEDANCE_CONFIG = {
  RATIOS: ["21:9 & 9:21", "16:9 & 9:16", "4:3 & 3:4", "1:1"] as const,
  RESOLUTIONS: ["480P", "720P", "1080P"] as const,
  DURATIONS: [5, 10] as const,
} as const;
function generateSeedanceTableConfig(
  name: string,
  funcName: string,
): SeedanceTableRow[] {
  const { RATIOS, RESOLUTIONS, DURATIONS } = SEEDANCE_CONFIG;
  const tableRows: SeedanceTableRow[] = [];
  DURATIONS.forEach((duration) => {
    RESOLUTIONS.forEach((resolution) => {
      RATIOS.forEach((ratio, ratioIndex) => {
        const isFirstRow =
          duration === DURATIONS[0] &&
          resolution === RESOLUTIONS[0] &&
          ratioIndex === 0;
        tableRows.push({
          name: isFirstRow ? name : "",
          rowSpan: isFirstRow
            ? DURATIONS.length * RESOLUTIONS.length * RATIOS.length
            : undefined,
          func: funcName,
          duration,
          resolution,
          ratio,
        });
      });
    });
  });
  return tableRows;
}
function generateSeedanceV15ProTableConfig(
  name: string,
  funcName: string,
  isI2V: boolean,
): SeedanceV15ProTableRow[] {
  const RESOLUTIONS: ("480P" | "720P")[] = ["480P", "720P"];
  const FRAME_TYPES: ("FLF" | "FF")[] = isI2V ? ["FLF", "FF"] : [];
  const AUDIO_TYPES: ("SILENT" | "AUDIO")[] = ["SILENT", "AUDIO"];
  const BATCH_MODES: ("ONLINE" | "BATCH")[] = ["ONLINE", "BATCH"];
  const tableRows: SeedanceV15ProTableRow[] = [];
  let isFirstRow = true;
  let totalRows = 0;
  if (isI2V) {
    totalRows =
      RESOLUTIONS.length *
      FRAME_TYPES.length *
      AUDIO_TYPES.length *
      BATCH_MODES.length;
  } else {
    totalRows = RESOLUTIONS.length * AUDIO_TYPES.length * BATCH_MODES.length;
  }
  RESOLUTIONS.forEach((resolution) => {
    if (isI2V) {
      FRAME_TYPES.forEach((frameType) => {
        AUDIO_TYPES.forEach((audioType) => {
          BATCH_MODES.forEach((batchMode) => {
            tableRows.push({
              name: isFirstRow ? name : "",
              rowSpan: isFirstRow ? totalRows : undefined,
              func: funcName,
              resolution,
              frameType,
              audioType,
              batchMode,
              unit: "s",
            });
            isFirstRow = false;
          });
        });
      });
    } else {
      AUDIO_TYPES.forEach((audioType) => {
        BATCH_MODES.forEach((batchMode) => {
          tableRows.push({
            name: isFirstRow ? name : "",
            rowSpan: isFirstRow ? totalRows : undefined,
            func: funcName,
            resolution,
            audioType,
            batchMode,
            unit: "s",
          });
          isFirstRow = false;
        });
      });
    }
  });
  return tableRows;
}
function dealPrice(priceStr: string, originalPriceStr: string) {
  if (priceStr !== originalPriceStr) {
    return (
      <div className="flex flex-col flex-wrap gap-1">
        <span className="text-[var(--brand-1)]">{priceStr}</span>
        <span className="text-[var(--gray-1)] line-through">
          {originalPriceStr}
        </span>
      </div>
    );
  } else {
    return priceStr;
  }
}
function renderNameCell(
  value: string,
  record: {
    priceNote?: {
      text: string;
      link: string;
    };
  },
): React.ReactNode {
  return (
    <div className="flex flex-col gap-0.5">
      <span>{value}</span>
      {record.priceNote && (
        <a
          href={record.priceNote.link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-small text-[var(--brand-0)] underline underline-offset-2 cursor-pointer hover:opacity-80"
        >
          {record.priceNote.text}
        </a>
      )}
    </div>
  );
}
function getCalTableColumns(funcType: any, seg: string) {
  switch (funcType) {
    case FUNC_TYPE.LLM:
      return [
        {
          title: "Model Name",
          dataIndex: "name",
          render: renderNameCell,
        },
        {
          title: "Context",
          dataIndex: "context",
        },
        {
          title: "Input",
          dataIndex: "input",
          render: (_: any, record: Record<string, any>) => {
            if (record?.input === "0") return "Free";
            return `${"$"}${record?.input} /${"Mt"}`;
          },
        },
        {
          title: "Output",
          dataIndex: "output",
          render: (_: any, record: Record<string, any>) => {
            if (record?.output === "0") return "Free";
            return `${"$"}${record?.output} /${"Mt"}`;
          },
        },
      ];
    case FUNC_TYPE.EMBEDDING:
      return [
        {
          title: "Model Name",
          dataIndex: "name",
          render: renderNameCell,
        },
        {
          title: "Context",
          dataIndex: "context",
        },
        {
          title: "Input",
          dataIndex: "input",
          render: (value: string) => {
            return `${"$"}${value} /${"Mt"}`;
          },
        },
      ];
    case FUNC_TYPE.IMG:
      if (seg === "t2") {
        return [
          {
            title: "API Name",
            dataIndex: "name",
            render: renderNameCell,
          },
          {
            title: "Mode",
            dataIndex: "mode",
            render: (model: string) => {
              return model || "-";
            },
          },
          {
            title: "Width&Height",
            dataIndex: "resolution",
            render: (_: any, record: Record<string, string>) => {
              if (record.width && record.height) {
                return `${record.width}*${record.height}`;
              }
              return "-";
            },
          },
          {
            title: "Pricing",
            dataIndex: "price",
            render: (_: any, record: Record<string, any>) => {
              if (record.isDynamic && record.price) return record.price;
              if (record.staticPrice) {
                return record.staticPrice;
              }
              const priceInfo = calcPrice(record.func, {
                width: record.width,
                height: record.height,
                steps: record.steps,
                scale: record.scale,
                mode: record.mode,
              });
              const price = priceInfo.discountPrice;
              const originalPrice = priceInfo.originalPrice;
              return dealPrice(
                `${"$"}${price} /${"image"}`,
                `${"$"}${originalPrice} /${"image"}`,
              );
            },
          },
        ];
      }
      return [
        {
          title: "API Name",
          dataIndex: "name",
          render: renderNameCell,
        },
        {
          title: "Width&Height",
          dataIndex: "resolution",
          render: (_: any, record: Record<string, string>) => {
            if (
              record.isDynamic &&
              record.resolution &&
              record.resolution !== "-"
            ) {
              return record.resolution;
            }
            if (record.width && record.height) {
              return `${record.width}*${record.height}`;
            }
            return "-";
          },
        },
        {
          title: "Steps/Scale",
          dataIndex: "steps",
          render: (steps: number, record: Record<string, any>) =>
            steps || record.scale || "-",
        },
        {
          title: "Pricing",
          dataIndex: "price",
          render: (_: any, record: Record<string, any>) => {
            if (record.isDynamic && record.price) return record.price;
            if (record.staticPrice) {
              return record.staticPrice;
            }
            const priceInfo = calcPrice(record.func, {
              width: record.width,
              height: record.height,
              steps: record.steps,
              scale: record.scale,
            });
            const price = priceInfo.discountPrice;
            const originalPrice = priceInfo.originalPrice;
            return dealPrice(
              `${"$"}${price} /${"image"}`,
              `${"$"}${originalPrice} /${"image"}`,
            );
          },
        },
      ];
    case FUNC_TYPE.VIDEO_GENERATOR:
      if (seg === "t2") {
        return [
          {
            title: "API Name",
            dataIndex: "name",
            render: renderNameCell,
          },
          {
            title: "Mode",
            dataIndex: "mode",
            render: (mode: string, record: Record<string, any>) => {
              if (record.frameType || record.audioType || record.batchMode) {
                const parts: string[] = [];
                if (record.frameType) parts.push(record.frameType);
                if (record.audioType) parts.push(record.audioType);
                if (record.batchMode) parts.push(record.batchMode);
                return parts.join(" / ") || "-";
              }
              return mode || "-";
            },
          },
          {
            title: "Duration",
            dataIndex: "duration",
            render: (duration: any) => (duration ? `${duration}s` : "-"),
          },
          {
            title: "Resolution",
            dataIndex: "resolution",
            render: (resolution: string, record: Record<string, any>) => {
              return (
                <span>
                  {resolution}
                  {record.ratio && (
                    <span className="text-gray-500 ml-2">
                      ( {record.ratio} )
                    </span>
                  )}
                </span>
              );
            },
          },
          {
            title: "Pricing",
            dataIndex: "price",
            render: (_: any, record: Record<string, any>) => {
              if (record.isDynamic && record.price) return record.price;
              const priceInfo = calcPrice(record.func, {
                model: record.model,
                mode: record.mode,
                resolutionType: record.resolution,
                frames: record.model === "hunyuan-video-fast" ? 24 : 16,
                duration: record.duration,
                ratio: record.ratio,
                frameType: record.frameType,
                audioType: record.audioType,
                batchMode: record.batchMode,
                audio: record.audio,
              });
              const price = priceInfo.discountPrice;
              const originalPrice = priceInfo.originalPrice;
              const unit = record.unit || "video";
              return dealPrice(
                `${"$"}${formatMoneyDisplay(price)} /${unit}`,
                `${"$"}${formatMoneyDisplay(originalPrice)} /${unit}`,
              );
            },
          },
        ];
      } else if (seg === "t3") {
        return [
          {
            title: "API Name",
            dataIndex: "name",
            render: renderNameCell,
          },
          {
            title: "Model",
            dataIndex: "model",
            render: (model: string) => {
              return model || "-";
            },
          },
          {
            title: "Steps",
            dataIndex: "steps",
            render: (steps: number, record: Record<string, any>) =>
              steps || record.scale || "-",
          },
          {
            title: "Pricing",
            dataIndex: "price",
            render: (_: any, record: Record<string, any>) => {
              const priceInfo = calcPrice(record.func, {
                steps: record.steps,
                frames: record.frames || 0,
                model: record.model,
              });
              const price = priceInfo.discountPrice;
              const originalPrice = priceInfo.originalPrice;
              return dealPrice(
                `${"$"}${price} /${"video"}`,
                `${"$"}${originalPrice} /${"video"}`,
              );
            },
          },
        ];
      }
      return [
        {
          title: "API Name",
          dataIndex: "name",
          render: renderNameCell,
        },
        {
          title: "Total Frames",
          dataIndex: "frames",
          render: (frames: number) => {
            return frames || "-";
          },
        },
        {
          title: "Steps",
          dataIndex: "steps",
          render: (steps: number, record: Record<string, any>) =>
            steps || record.scale || "-",
        },
        {
          title: "Pricing",
          dataIndex: "price",
          render: (_: any, record: Record<string, any>) => {
            const priceInfo = calcPrice(record.func, {
              steps: record.steps,
              frames: record.frames || 0,
              model: record.model,
            });
            const price = priceInfo.discountPrice;
            const originalPrice = priceInfo.originalPrice;
            return dealPrice(
              `${"$"}${price} /${"video"}`,
              `${"$"}${originalPrice} /${"video"}`,
            );
          },
        },
      ];
    case FUNC_TYPE.AUDIO:
      return [
        {
          title: "API Name",
          dataIndex: "name",
          render: renderNameCell,
        },
        {
          title: "Mode",
          dataIndex: "mode",
          render: (mode: string) => {
            return mode || "-";
          },
        },
        {
          title: "Pricing",
          dataIndex: "price",
          render: (_: any, record: Record<string, any>) => {
            if (record.isDynamic && record.price) return record.price;
            const priceInfo = calcPrice(record.func, {});
            const price = priceInfo.discountPrice;
            const originalPrice = priceInfo.originalPrice;
            if (price === 0 || price === "0") {
              return (
                <span className="w-8 h-5 rounded-[2px] bg-[var(--green-7)] text-[var(--green-2)] text-xs flex items-center justify-center">
                  Free
                </span>
              );
            }
            const unit = getAudioModelUnit(record.func);
            return dealPrice(
              `${"$"}${price} /${unit}`,
              `${"$"}${originalPrice} /${unit}`,
            );
          },
        },
      ];
    case FUNC_TYPE.TRAINING:
      return [
        {
          title: "Name",
          dataIndex: "name",
          render: renderNameCell,
        },
        {
          title: "Width&Height",
          dataIndex: "resolution",
          render: (_: any, record: Record<string, string>) => {
            if (record.width && record.height) {
              return `${record.width}*${record.height}`;
            }
            return "-";
          },
        },
        {
          title: "Steps",
          dataIndex: "steps",
          render: (steps: number) => steps || "-",
        },
        {
          title: "Base Model Is SDXL",
          dataIndex: "isSDXL",
          render: (isSDXL: boolean) => `${isSDXL}`,
        },
        {
          title: "Pricing",
          dataIndex: "price",
          render: (_: any, record: Record<string, any>) => {
            const priceInfo = calcPrice(record.func, {
              width: record.width,
              height: record.height,
              steps: record.steps,
              isSDXL: record.isSDXL,
            });
            const price = priceInfo.discountPrice;
            const originalPrice = priceInfo.originalPrice;
            return dealPrice(
              `${"$"}${price} /${"1M characters"}`,
              `${"$"}${originalPrice} /${"1M characters"}`,
            );
          },
        },
      ];
    default:
      return [];
  }
}
function getPriceContent(embeddingList: LLMModelWithStatus[]) {
  const embeddingContent =
    embeddingList?.length > 0
      ? [
          {
            type: FUNC_TYPE.EMBEDDING,
            table: map(embeddingList, (item) => ({
              name: item.displayName || item.name,
              context: item.context_size,
              input: Big(item.input_token_price_per_m || 0)
                .div(10000)
                .toString(),
            })),
          },
        ]
      : [];
  return [
    ...embeddingContent,
    {
      type: FUNC_TYPE.IMG,
      description1:
        "Pricing may vary based on image dimensions, inference steps, and upscaling factors. Use the",
      description2: "for an estimate.",
      calculate: true,
      table: [
        {
          name: FUNCS.TXT2IMG.displayName,
          func: FUNC_NAME.TXT2IMG,
          ...getDefaultParmas(FUNC_NAME.TXT2IMG),
        },
        {
          name: FUNCS.IMG2IMG.displayName,
          func: FUNC_NAME.IMG2IMG,
          ...getDefaultParmas(FUNC_NAME.IMG2IMG),
        },
        {
          name: FUNCS.REMOVE_BACKGROUND.displayName,
          func: FUNC_NAME.REMOVE_BACKGROUND,
        },
        {
          name: FUNCS.REPLACE_BACKGROUND.displayName,
          func: FUNC_NAME.REPLACE_BACKGROUND,
        },
        {
          name: FUNCS.INPAINTING.displayName,
          func: FUNC_NAME.INPAINTING,
          ...getDefaultParmas(FUNC_NAME.INPAINTING),
        },
        {
          name: FUNCS.REMOVE_TEXT.displayName,
          func: FUNC_NAME.REMOVE_TEXT,
        },
        {
          name: FUNCS.CLEANUP.displayName,
          func: FUNC_NAME.CLEANUP,
        },
        {
          name: FUNCS.MERGE_FACE.displayName,
          func: FUNC_NAME.MERGE_FACE,
        },
        // {
        //   name: FUNCS.IMAGE_REMOVE_BACKGROUND.displayName,
        //   func: FUNC_NAME.IMAGE_REMOVE_BACKGROUND,
        // },
        // {
        //   name: FUNCS.IMAGE_ERASER.displayName,
        //   func: FUNC_NAME.IMAGE_ERASER,
        // },
        // {
        //   name: FUNCS.IMAGE_UPSCALER.displayName,
        //   func: FUNC_NAME.IMAGE_UPSCALER,
        // },
      ],
      table2: [
        {
          name: "Seedream 3.0 Text to Image",
          func: FUNC_NAME.SEEDREAM_3_0_T2I,
        },
        {
          name: "Seedream 4.0",
          func: FUNC_NAME.SEEDREAM_4_0,
        },
        // 已由动态配置提供 (trimmed-data: seedream-4.5, seedream-5.0-lite)
        // {
        //   name: "Seedream 4.5",
        //   func: FUNC_NAME.SEEDREAM_4_5,
        // },
        // {
        //   name: "Seedream 5.0 lite",
        //   func: "seedream-5.0-lite",
        // },
        {
          name: "Hunyuan Image 3",
          func: FUNC_NAME.HUNYUAN_3_0,
        },
        {
          name: "Qwen-Image Text to Image",
          func: FUNC_NAME.QWEN_TXT2IMG,
        },
        {
          name: "Qwen-Image Edit",
          func: FUNC_NAME.QWEN_IMAGE_EDIT,
        },
        {
          name: "Flux.1 Kontext Dev",
          rowSpan: 2,
          func: FUNC_NAME.FLUX1_KONTEXT_DEV,
        },
        {
          name: "",
          func: FUNC_NAME.FLUX1_KONTEXT_DEV,
          mode: "fast_mode",
        },
        {
          name: "Flux.1 Kontext Pro",
          func: FUNC_NAME.FLUX1_KONTEXT_PRO,
        },
        {
          name: "Flux.1 Kontext Max",
          func: FUNC_NAME.FLUX1_KONTEXT_MAX,
        },
        // 已由动态配置提供 (trimmed-data: flux-2-dev, flux-2-flex, flux-2-pro, z-image-turbo-*, glm-image)
        // {
        //   name: "Flux 2 Dev Image Gen",
        //   rowSpan: 4,
        //   func: FUNC_NAME.FLUX_2_DEV_LORA_TXT_TO_IMG,
        //   mode: "Text to Image - LoRA",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.FLUX_2_DEV_TXT_TO_IMG,
        //   mode: "Text to Image",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.FLUX_2_DEV_IMG_TO_IMG,
        //   mode: "Image to Image",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.FLUX_2_DEV_LORA_IMG_TO_IMG,
        //   mode: "Image to Image - LoRA",
        // },
        // {
        //   name: "Flux 2 Flex Image Gen",
        //   rowSpan: 2,
        //   func: FUNC_NAME.FLUX_2_FLEX_TXT_TO_IMG,
        //   mode: "Text to Image",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.FLUX_2_FLEX_IMG_TO_IMG,
        //   mode: "Image to Image",
        // },
        // {
        //   name: "Flux 2 Pro Image Gen",
        //   rowSpan: 2,
        //   func: FUNC_NAME.FLUX_2_PRO_TXT_TO_IMG,
        //   mode: "Text to Image",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.FLUX_2_PRO_IMG_TO_IMG,
        //   mode: "Image to Image",
        // },
        // {
        //   name: "Z-Image Turbo LoRA",
        //   func: FUNC_NAME.Z_IMAGE_TURBO_LORA,
        // },
        // {
        //   name: "Z-Image Turbo",
        //   func: FUNC_NAME.Z_IMAGE_TURBO,
        // },
        // {
        //   name: "GLM Image Generation",
        //   func: FUNC_NAME.GLM_IMAGE,
        // },
      ],
    },
    {
      type: FUNC_TYPE.VIDEO_GENERATOR,
      description1:
        "Pricing may vary based on the number of frames, chosen model, and inference steps. Use the",
      description2: "for an estimate.",
      calculate: true,
      table: [
        {
          name: FUNCS.TXT2VIDEO.displayName,
          func: FUNC_NAME.TXT2VIDEO,
          ...getDefaultParmas(FUNC_NAME.TXT2VIDEO),
        },
      ],
      table2: [
        {
          name: "Kling V1.6 Text to Video",
          rowSpan: 2,
          mode: "Standard",
          func: FUNC_NAME.KLING_V1_6_T2V,
          duration: 5,
          resolution: "720P",
        },
        {
          name: "",
          mode: "Standard",
          func: FUNC_NAME.KLING_V1_6_T2V,
          duration: 10,
          resolution: "720P",
        },
        {
          name: "Kling V1.6 Image to Video",
          rowSpan: 4,
          mode: "Standard",
          func: FUNC_NAME.KLING_V1_6_I2V,
          duration: 5,
          resolution: "720P",
        },
        {
          name: "",
          mode: "Standard",
          func: FUNC_NAME.KLING_V1_6_I2V,
          duration: 10,
          resolution: "720P",
        },
        {
          name: "",
          mode: "Professional",
          func: FUNC_NAME.KLING_V1_6_I2V,
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "",
          mode: "Professional",
          func: FUNC_NAME.KLING_V1_6_I2V,
          duration: 10,
          resolution: "1080P",
        },
        // 已由动态配置提供 (trimmed-data: kling-v2.1-*)
        // {
        //   name: "Kling V2.1 Master Text to Video",
        //   rowSpan: 2,
        //   mode: "Master",
        //   func: FUNC_NAME.KLING_V2_1_T2V_MASTER,
        //   duration: 5,
        //   resolution: "1080P",
        // },
        // {
        //   name: "",
        //   mode: "Master",
        //   func: FUNC_NAME.KLING_V2_1_T2V_MASTER,
        //   duration: 10,
        //   resolution: "1080P",
        // },
        // {
        //   name: "Kling V2.1 Image to Video",
        //   rowSpan: 4,
        //   mode: "Standard",
        //   func: FUNC_NAME.KLING_V2_1_I2V,
        //   duration: 5,
        //   resolution: "720P",
        // },
        // {
        //   name: "",
        //   mode: "Standard",
        //   func: FUNC_NAME.KLING_V2_1_I2V,
        //   duration: 10,
        //   resolution: "720P",
        // },
        // {
        //   name: "",
        //   mode: "Professional",
        //   func: FUNC_NAME.KLING_V2_1_I2V,
        //   duration: 5,
        //   resolution: "1080P",
        // },
        // {
        //   name: "",
        //   mode: "Professional",
        //   func: FUNC_NAME.KLING_V2_1_I2V,
        //   duration: 10,
        //   resolution: "1080P",
        // },
        // {
        //   name: "Kling V2.1 Master Image to Video",
        //   rowSpan: 2,
        //   mode: "Master",
        //   func: FUNC_NAME.KLING_V2_1_I2V_MASTER,
        //   duration: 5,
        //   resolution: "1080P",
        // },
        // {
        //   name: "",
        //   mode: "Master",
        //   func: FUNC_NAME.KLING_V2_1_I2V_MASTER,
        //   duration: 10,
        //   resolution: "1080P",
        // },
        {
          name: "Kling V2.5 Turbo Text to Video",
          rowSpan: 2,
          mode: "-",
          func: FUNC_NAME.KLING_V2_5_T2V,
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "",
          mode: "-",
          func: FUNC_NAME.KLING_V2_5_T2V,
          duration: 10,
          resolution: "1080P",
        },
        {
          name: "Kling V2.5 Turbo Image to Video",
          rowSpan: 2,
          mode: "-",
          func: FUNC_NAME.KLING_V2_5_I2V,
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "",
          mode: "-",
          func: FUNC_NAME.KLING_V2_5_I2V,
          duration: 10,
          resolution: "1080P",
        },
        // {
        //   name: "Kling V2.6 Pro Motion Control",
        //   mode: "-",
        //   func: FUNC_NAME.KLING_V26_PRO_MOTION_CONTROL,
        //   resolution: "1080P",
        //   unit: "s",
        // },
        {
          name: "Kling V2.6 Pro Text to Video",
          rowSpan: 4,
          mode: "No Audio",
          func: FUNC_NAME.KLING_V26_PRO_T2V,
          duration: 5,
          resolution: "1080P",
          audio: false,
        },
        {
          name: "",
          mode: "No Audio",
          func: FUNC_NAME.KLING_V26_PRO_T2V,
          duration: 10,
          resolution: "1080P",
          audio: false,
        },
        {
          name: "",
          mode: "Audio",
          func: FUNC_NAME.KLING_V26_PRO_T2V,
          duration: 5,
          resolution: "1080P",
          audio: true,
        },
        {
          name: "",
          mode: "Audio",
          func: FUNC_NAME.KLING_V26_PRO_T2V,
          duration: 10,
          resolution: "1080P",
          audio: true,
        },
        {
          name: "Kling V2.6 Pro Image to Video",
          rowSpan: 4,
          mode: "No Audio",
          func: FUNC_NAME.KLING_V26_PRO_I2V,
          duration: 5,
          resolution: "1080P",
          audio: false,
        },
        {
          name: "",
          mode: "No Audio",
          func: FUNC_NAME.KLING_V26_PRO_I2V,
          duration: 10,
          resolution: "1080P",
          audio: false,
        },
        {
          name: "",
          mode: "Audio",
          func: FUNC_NAME.KLING_V26_PRO_I2V,
          duration: 5,
          resolution: "1080P",
          audio: true,
        },
        {
          name: "",
          mode: "Audio",
          func: FUNC_NAME.KLING_V26_PRO_I2V,
          duration: 10,
          resolution: "1080P",
          audio: true,
        },
        {
          name: "Kling v3.0 Standard Text-to-Video",
          rowSpan: 2,
          mode: "No Audio",
          func: FUNC_NAME.KLING_V30_STD_T2V,
          audio: false,
          unit: "s",
        },
        {
          name: "",
          mode: "Audio",
          func: FUNC_NAME.KLING_V30_STD_T2V,
          audio: true,
          unit: "s",
        },
        {
          name: "Kling v3.0 Standard Image-to-Video",
          rowSpan: 2,
          mode: "No Audio",
          func: FUNC_NAME.KLING_V30_STD_I2V,
          audio: false,
          unit: "s",
        },
        {
          name: "",
          mode: "Audio",
          func: FUNC_NAME.KLING_V30_STD_I2V,
          audio: true,
          unit: "s",
        },
        {
          name: "Kling v3.0 Pro Text-to-Video",
          rowSpan: 2,
          mode: "No Audio",
          func: FUNC_NAME.KLING_V30_PRO_T2V,
          audio: false,
          unit: "s",
        },
        {
          name: "",
          mode: "Audio",
          func: FUNC_NAME.KLING_V30_PRO_T2V,
          audio: true,
          unit: "s",
        },
        {
          name: "Kling v3.0 Pro Image-to-Video",
          rowSpan: 2,
          mode: "No Audio",
          func: FUNC_NAME.KLING_V30_PRO_I2V,
          audio: false,
          unit: "s",
        },
        {
          name: "",
          mode: "Audio",
          func: FUNC_NAME.KLING_V30_PRO_I2V,
          audio: true,
          unit: "s",
        },
        // 已由动态配置提供 (trimmed-data: kling-o1-*)
        // {
        //   name: "Kling-o1 Reference to Video",
        //   rowSpan: 3,
        //   mode: "Reference Video and Image",
        //   func: FUNC_NAME.KLING_O1_REFERENCE_TO_VIDEO_VIDEO_AND_IMG,
        //   resolution: "720P",
        //   unit: "s",
        // },
        // {
        //   name: "",
        //   mode: "Reference Video",
        //   func: FUNC_NAME.KLING_O1_REFERENCE_TO_VIDEO_ONLY_VIDEO,
        //   resolution: "720P",
        //   unit: "s",
        // },
        // {
        //   name: "",
        //   mode: "Reference Image",
        //   func: FUNC_NAME.KLING_O1_REFERENCE_TO_VIDEO_ONLY_IMG,
        //   resolution: "720P",
        //   unit: "s",
        // },
        // {
        //   name: "Kling-o1 Image to Video",
        //   mode: "-",
        //   func: FUNC_NAME.KLING_O1_IMG_TO_VIDEO_720P_5S_TO_10S,
        //   duration: 5,
        //   resolution: "720P",
        //   unit: "s",
        // },
        // {
        //   name: "Kling-o1 Text to Video",
        //   mode: "-",
        //   func: FUNC_NAME.KLING_O1_TEXT_TO_VIDEO_720P_5S_TO_10S,
        //   duration: 5,
        //   resolution: "720P",
        //   unit: "s",
        // },
        // {
        //   name: "Kling-o1 Edit Video",
        //   rowSpan: 2,
        //   mode: "Fast",
        //   func: FUNC_NAME.KLING_O1_EDIT_VIDEO_FAST_720P_6S_TO_20S,
        //   duration: 6,
        //   resolution: "720P",
        //   unit: "s",
        // },
        // {
        //   name: "",
        //   mode: "-",
        //   func: FUNC_NAME.KLING_O1_EDIT_VIDEO_720P_3S_TO_10S_VIDEO,
        //   duration: 3,
        //   resolution: "720P",
        //   unit: "s",
        // },
        {
          name: "MiniMax Video 01",
          mode: "-",
          func: FUNC_NAME.MINIMAX_VIDEO_01,
          duration: 6,
          resolution: "720P",
        },
        {
          name: "MiniMax Video 02",
          rowSpan: 3,
          mode: "-",
          func: FUNC_NAME.MINIMAX_HAILUO_02,
          duration: 6,
          resolution: "768P",
        },
        {
          name: "",
          mode: "-",
          func: FUNC_NAME.MINIMAX_HAILUO_02,
          duration: 10,
          resolution: "768P",
        },
        {
          name: "",
          mode: "-",
          func: FUNC_NAME.MINIMAX_HAILUO_02,
          duration: 6,
          resolution: "1080P",
        },
        {
          name: "Minimax Hailuo 2.3 Text to Video",
          rowSpan: 3,
          mode: "-",
          func: FUNC_NAME.MINIMAX_HAILUO_2_3_T2V,
          duration: 6,
          resolution: "768P",
        },
        {
          name: "",
          mode: "-",
          func: FUNC_NAME.MINIMAX_HAILUO_2_3_T2V,
          duration: 10,
          resolution: "768P",
        },
        {
          name: "",
          mode: "-",
          func: FUNC_NAME.MINIMAX_HAILUO_2_3_T2V,
          duration: 6,
          resolution: "1080P",
        },
        {
          name: "Minimax Hailuo 2.3 Image to Video",
          rowSpan: 3,
          mode: "-",
          func: FUNC_NAME.MINIMAX_HAILUO_2_3_I2V,
          duration: 6,
          resolution: "768P",
        },
        {
          name: "",
          mode: "-",
          func: FUNC_NAME.MINIMAX_HAILUO_2_3_I2V,
          duration: 10,
          resolution: "768P",
        },
        {
          name: "",
          mode: "-",
          func: FUNC_NAME.MINIMAX_HAILUO_2_3_I2V,
          duration: 6,
          resolution: "1080P",
        },
        {
          name: "Minimax Hailuo 2.3 Fast Image to Video",
          rowSpan: 3,
          mode: "-",
          func: FUNC_NAME.MINIMAX_HAILUO_2_3_FAST_I2V,
          duration: 6,
          resolution: "768P",
        },
        {
          name: "",
          mode: "-",
          func: FUNC_NAME.MINIMAX_HAILUO_2_3_FAST_I2V,
          duration: 10,
          resolution: "768P",
        },
        {
          name: "",
          mode: "-",
          func: FUNC_NAME.MINIMAX_HAILUO_2_3_FAST_I2V,
          duration: 6,
          resolution: "1080P",
        },
        {
          name: "Hunyuan Video Fast",
          model: "hunyuan-video-fast",
          func: FUNC_NAME.TXT2VIDEO,
          duration: 5,
          resolution: "1280*720 | 720*1280",
        },
        // 已由动态配置提供 (trimmed-data: wan-t2v, wan-i2v)
        // {
        //   name: "Wan 2.1 Text to Video",
        //   rowSpan: 4,
        //   model: "wan2.1-t2v",
        //   func: FUNC_NAME.WAN_T2V,
        //   duration: 5,
        //   resolution: "1280*720 | 720*1280",
        // },
        // {
        //   name: "",
        //   model: "wan2.1-t2v",
        //   func: FUNC_NAME.WAN_T2V,
        //   duration: 5,
        //   resolution: "832*480 | 480*832",
        // },
        // {
        //   name: "",
        //   model: "wan2.1-t2v",
        //   mode: "fast_mode",
        //   func: FUNC_NAME.WAN_T2V,
        //   duration: 5,
        //   resolution: "1280*720 | 720*1280",
        // },
        // {
        //   name: "",
        //   model: "wan2.1-t2v",
        //   mode: "fast_mode",
        //   func: FUNC_NAME.WAN_T2V,
        //   duration: 5,
        //   resolution: "832*480 | 480*832",
        // },
        // {
        //   name: "Wan 2.1 Image to Video",
        //   rowSpan: 4,
        //   model: "wan2.1-i2v",
        //   func: FUNC_NAME.WAN_I2V,
        //   duration: 5,
        //   resolution: "1280*720 | 720*1280",
        // },
        // {
        //   name: "",
        //   model: "wan2.1-i2v",
        //   func: FUNC_NAME.WAN_I2V,
        //   duration: 5,
        //   resolution: "832*480 | 480*832",
        // },
        // {
        //   name: "",
        //   model: "wan2.1-i2v",
        //   mode: "fast_mode",
        //   func: FUNC_NAME.WAN_I2V,
        //   duration: 5,
        //   resolution: "1280*720 | 720*1280",
        // },
        // {
        //   name: "",
        //   model: "wan2.1-i2v",
        //   mode: "fast_mode",
        //   func: FUNC_NAME.WAN_I2V,
        //   duration: 5,
        //   resolution: "832*480 | 480*832",
        // },
        // 已由动态配置提供 (trimmed-data: wan-2.2-t2v, wan-2.2-i2v)
        // {
        //   name: "Wan 2.2 Text to Video",
        //   rowSpan: 9,
        //   func: FUNC_NAME.WAN_2_2_T2V,
        //   duration: 5,
        //   resolution: "480P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_T2V,
        //   mode: "LoRA",
        //   duration: 5,
        //   resolution: "480P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_T2V,
        //   duration: 8,
        //   resolution: "480P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_T2V,
        //   mode: "LoRA",
        //   duration: 8,
        //   resolution: "480P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_T2V,
        //   duration: 5,
        //   resolution: "720P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_T2V,
        //   mode: "LoRA",
        //   duration: 5,
        //   resolution: "720P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_T2V,
        //   duration: 8,
        //   resolution: "720P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_T2V,
        //   mode: "LoRA",
        //   duration: 8,
        //   resolution: "720P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_T2V,
        //   duration: 5,
        //   resolution: "1080P",
        // },
        // {
        //   name: "Wan 2.2 Image to Video",
        //   rowSpan: 9,
        //   func: FUNC_NAME.WAN_2_2_I2V,
        //   duration: 5,
        //   resolution: "480P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_I2V,
        //   mode: "LoRA",
        //   duration: 5,
        //   resolution: "480P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_I2V,
        //   duration: 8,
        //   resolution: "480P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_I2V,
        //   mode: "LoRA",
        //   duration: 8,
        //   resolution: "480P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_I2V,
        //   duration: 5,
        //   resolution: "720P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_I2V,
        //   mode: "LoRA",
        //   duration: 5,
        //   resolution: "720P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_I2V,
        //   duration: 8,
        //   resolution: "720P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_I2V,
        //   mode: "LoRA",
        //   duration: 8,
        //   resolution: "720P",
        // },
        // {
        //   name: "",
        //   func: FUNC_NAME.WAN_2_2_I2V,
        //   duration: 5,
        //   resolution: "1080P",
        // },
        {
          name: "Wan 2.5 Text to Video",
          rowSpan: 6,
          model: "WAN25_PREVIEW_T2V_480P_5S",
          func: FUNC_NAME.WAN_2_5_T2V,
          duration: 5,
          resolution: "480P",
        },
        {
          name: "",
          model: "WAN25_PREVIEW_T2V_480P_10S",
          func: FUNC_NAME.WAN_2_5_T2V,
          duration: 10,
          resolution: "480P",
        },
        {
          name: "",
          model: "WAN25_PREVIEW_T2V_720P_5S",
          func: FUNC_NAME.WAN_2_5_T2V,
          duration: 5,
          resolution: "720P",
        },
        {
          name: "",
          model: "WAN25_PREVIEW_T2V_720P_10S",
          func: FUNC_NAME.WAN_2_5_T2V,
          duration: 10,
          resolution: "720P",
        },
        {
          name: "",
          model: "WAN25_PREVIEW_T2V_1080P_5S",
          func: FUNC_NAME.WAN_2_5_T2V,
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "",
          model: "WAN25_PREVIEW_T2V_1080P_10S",
          func: FUNC_NAME.WAN_2_5_T2V,
          duration: 10,
          resolution: "1080P",
        },
        {
          name: "Wan 2.5 Image to Video",
          rowSpan: 6,
          model: "WAN25_PREVIEW_I2V_480P_5S",
          func: FUNC_NAME.WAN_2_5_I2V,
          duration: 5,
          resolution: "480P",
        },
        {
          name: "",
          model: "WAN25_PREVIEW_I2V_480P_10S",
          func: FUNC_NAME.WAN_2_5_I2V,
          duration: 10,
          resolution: "480P",
        },
        {
          name: "",
          model: "WAN25_PREVIEW_I2V_720P_5S",
          func: FUNC_NAME.WAN_2_5_I2V,
          duration: 5,
          resolution: "720P",
        },
        {
          name: "",
          model: "WAN25_PREVIEW_I2V_720P_10S",
          func: FUNC_NAME.WAN_2_5_I2V,
          duration: 10,
          resolution: "720P",
        },
        {
          name: "",
          model: "WAN25_PREVIEW_I2V_1080P_5S",
          func: FUNC_NAME.WAN_2_5_I2V,
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "",
          model: "WAN25_PREVIEW_I2V_1080P_10S",
          func: FUNC_NAME.WAN_2_5_I2V,
          duration: 10,
          resolution: "1080P",
        },
        {
          name: "Wan 2.6 Text to Video",
          rowSpan: 6,
          model: "WAN2_6_T2V_720P_5S",
          func: FUNC_NAME.WAN_2_6_T2V,
          duration: 5,
          resolution: "720P",
        },
        {
          name: "",
          model: "WAN2_6_T2V_720P_10S",
          func: FUNC_NAME.WAN_2_6_T2V,
          duration: 10,
          resolution: "720P",
        },
        {
          name: "",
          model: "WAN2_6_T2V_720P_15S",
          func: FUNC_NAME.WAN_2_6_T2V,
          duration: 15,
          resolution: "720P",
        },
        {
          name: "",
          model: "WAN2_6_T2V_1080P_5S",
          func: FUNC_NAME.WAN_2_6_T2V,
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "",
          model: "WAN2_6_T2V_1080P_10S",
          func: FUNC_NAME.WAN_2_6_T2V,
          duration: 10,
          resolution: "1080P",
        },
        {
          name: "",
          model: "WAN2_6_T2V_1080P_15S",
          func: FUNC_NAME.WAN_2_6_T2V,
          duration: 15,
          resolution: "1080P",
        },
        {
          name: "Wan 2.6 Image to Video",
          rowSpan: 6,
          model: "WAN2_6_I2V_720P_5S",
          func: FUNC_NAME.WAN_2_6_I2V,
          duration: 5,
          resolution: "720P",
        },
        {
          name: "",
          model: "WAN2_6_I2V_720P_10S",
          func: FUNC_NAME.WAN_2_6_I2V,
          duration: 10,
          resolution: "720P",
        },
        {
          name: "",
          model: "WAN2_6_I2V_720P_15S",
          func: FUNC_NAME.WAN_2_6_I2V,
          duration: 15,
          resolution: "720P",
        },
        {
          name: "",
          model: "WAN2_6_I2V_1080P_5S",
          func: FUNC_NAME.WAN_2_6_I2V,
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "",
          model: "WAN2_6_I2V_1080P_10S",
          func: FUNC_NAME.WAN_2_6_I2V,
          duration: 10,
          resolution: "1080P",
        },
        {
          name: "",
          model: "WAN2_6_I2V_1080P_15S",
          func: FUNC_NAME.WAN_2_6_I2V,
          duration: 15,
          resolution: "1080P",
        },
        {
          name: "Wan 2.6 Reference to Video",
          rowSpan: 4,
          model: "WAN2_6_V2V_720P_5S",
          func: FUNC_NAME.WAN_2_6_V2V,
          duration: 5,
          resolution: "720P",
        },
        {
          name: "",
          model: "WAN2_6_V2V_720P_10S",
          func: FUNC_NAME.WAN_2_6_V2V,
          duration: 10,
          resolution: "720P",
        },
        {
          name: "",
          model: "WAN2_6_V2V_1080P_5S",
          func: FUNC_NAME.WAN_2_6_V2V,
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "",
          model: "WAN2_6_V2V_1080P_10S",
          func: FUNC_NAME.WAN_2_6_V2V,
          duration: 10,
          resolution: "1080P",
        },
        {
          name: "Vidu Q1 Text to Video",
          rowSpan: 2,
          func: FUNC_NAME.VIDU_Q1_TEXT2VIDEO,
          mode: "general style",
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q1_TEXT2VIDEO,
          mode: "anime style",
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "Vidu Q1 Image to Video",
          func: FUNC_NAME.VIDU_Q1_IMG2VIDEO,
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "Vidu Q1 Start End to Video",
          func: FUNC_NAME.VIDU_Q1_STARTEND2VIDEO,
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "Vidu Q1 Reference to Video",
          func: FUNC_NAME.VIDU_Q1_REFERENCE2VIDEO,
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "Vidu 2.0 Image to Video",
          rowSpan: 4,
          func: FUNC_NAME.VIDU_2_0_IMG2VIDEO,
          duration: 4,
          resolution: "360P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_2_0_IMG2VIDEO,
          duration: 4,
          resolution: "720P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_2_0_IMG2VIDEO,
          duration: 4,
          resolution: "1080P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_2_0_IMG2VIDEO,
          duration: 8,
          resolution: "720P",
        },
        {
          name: "Vidu 2.0 Reference to Video",
          rowSpan: 2,
          func: FUNC_NAME.VIDU_2_0_REFERENCE2VIDEO,
          duration: 4,
          resolution: "360P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_2_0_REFERENCE2VIDEO,
          duration: 4,
          resolution: "720P",
        },
        {
          name: "Vidu 2.0 Start End to Video",
          rowSpan: 4,
          func: FUNC_NAME.VIDU_2_0_STARTEND2VIDEO,
          duration: 4,
          resolution: "360P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_2_0_STARTEND2VIDEO,
          duration: 4,
          resolution: "720P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_2_0_STARTEND2VIDEO,
          duration: 4,
          resolution: "1080P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_2_0_STARTEND2VIDEO,
          duration: 8,
          resolution: "720P",
        },
        {
          name: "Vidu Q2",
          rowSpan: 6,
          func: FUNC_NAME.VIDU_Q2,
          model: "VIDU_Q2_T2V_540P",
          mode: "Text to Video",
          duration: 5,
          resolution: "540P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2,
          model: "VIDU_Q2_T2V_720P",
          mode: "Text to Video",
          duration: 5,
          resolution: "720P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2,
          model: "VIDU_Q2_T2V_1080P",
          mode: "Text to Video",
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2,
          model: "VIDU_Q2_R2V_540P",
          mode: "Reference to Video",
          duration: 5,
          resolution: "540P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2,
          model: "VIDU_Q2_R2V_720P",
          mode: "Reference to Video",
          duration: 5,
          resolution: "720P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2,
          model: "VIDU_Q2_R2V_1080P",
          mode: "Reference to Video",
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "Vidu Q2 Pro",
          rowSpan: 3,
          func: FUNC_NAME.VIDU_Q2_PRO,
          model: "VIDU_Q2_PRO_I2V_540P",
          mode: "Image to Video",
          duration: 5,
          resolution: "540P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_PRO,
          model: "VIDU_Q2_PRO_I2V_720P",
          mode: "Image to Video",
          duration: 5,
          resolution: "720P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_PRO,
          model: "VIDU_Q2_PRO_I2V_1080P",
          mode: "Image to Video",
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "Vidu Q2 Pro Fast",
          rowSpan: 2,
          func: FUNC_NAME.VIDU_Q2_PRO_FAST,
          model: "VIDU_Q2_PRO_FAST_I2V_720P",
          mode: "Image to Video",
          duration: 5,
          resolution: "720P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_PRO_FAST,
          model: "VIDU_Q2_PRO_FAST_I2V_1080P",
          mode: "Image to Video",
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "Vidu Q2 Turbo",
          rowSpan: 3,
          func: FUNC_NAME.VIDU_Q2_TURBO,
          model: "VIDU_Q2_TURBO_I2V_540P",
          mode: "Image to Video",
          duration: 5,
          resolution: "540P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TURBO,
          model: "VIDU_Q2_TURBO_I2V_720P",
          mode: "Image to Video",
          duration: 5,
          resolution: "720P",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TURBO,
          model: "VIDU_Q2_TURBO_I2V_1080P",
          mode: "Image to Video",
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "Vidu Q2 Template",
          rowSpan: 22,
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_10",
          mode: "10 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_20",
          mode: "20 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_30",
          mode: "30 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_40",
          mode: "40 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_45",
          mode: "45 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_48",
          mode: "48 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_60",
          mode: "60 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_75",
          mode: "75 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_78",
          mode: "78 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_80",
          mode: "80 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_100",
          mode: "100 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_105",
          mode: "105 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_110",
          mode: "110 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_120",
          mode: "120 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_140",
          mode: "140 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_145",
          mode: "145 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_160",
          mode: "160 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_180",
          mode: "180 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_200",
          mode: "200 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_240",
          mode: "240 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_300",
          mode: "300 credit",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q2_TEMPLATE,
          model: "VIDU_Q2_TEMPLATE2VIDEO_CREDIT_460",
          mode: "460 credit",
        },
        {
          name: "Vidu Q3 Pro Text to Video",
          rowSpan: 6,
          func: FUNC_NAME.VIDU_Q3_PRO_T2V,
          model: "VIDU_Q3_PRO_T2V_540P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "540P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_T2V,
          model: "VIDU_Q3_PRO_T2V_540P_PEAK",
          mode: "Peak",
          resolution: "540P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_T2V,
          model: "VIDU_Q3_PRO_T2V_720P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "720P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_T2V,
          model: "VIDU_Q3_PRO_T2V_720P_PEAK",
          mode: "Peak",
          resolution: "720P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_T2V,
          model: "VIDU_Q3_PRO_T2V_1080P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "1080P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_T2V,
          model: "VIDU_Q3_PRO_T2V_1080P_PEAK",
          mode: "Peak",
          resolution: "1080P",
          unit: "s",
        },
        {
          name: "Vidu Q3 Pro Image to Video",
          rowSpan: 6,
          func: FUNC_NAME.VIDU_Q3_PRO_I2V,
          model: "VIDU_Q3_PRO_I2V_540P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "540P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_I2V,
          model: "VIDU_Q3_PRO_I2V_540P_PEAK",
          mode: "Peak",
          resolution: "540P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_I2V,
          model: "VIDU_Q3_PRO_I2V_720P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "720P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_I2V,
          model: "VIDU_Q3_PRO_I2V_720P_PEAK",
          mode: "Peak",
          resolution: "720P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_I2V,
          model: "VIDU_Q3_PRO_I2V_1080P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "1080P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_I2V,
          model: "VIDU_Q3_PRO_I2V_1080P_PEAK",
          mode: "Peak",
          resolution: "1080P",
          unit: "s",
        },
        {
          name: "Vidu Q3 Pro Start-End-to-Video",
          rowSpan: 6,
          func: FUNC_NAME.VIDU_Q3_PRO_F2V,
          model: "VIDU_Q3_PRO_F2V_540P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "540P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_F2V,
          model: "VIDU_Q3_PRO_F2V_540P_PEAK",
          mode: "Peak",
          resolution: "540P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_F2V,
          model: "VIDU_Q3_PRO_F2V_720P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "720P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_F2V,
          model: "VIDU_Q3_PRO_F2V_720P_PEAK",
          mode: "Peak",
          resolution: "720P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_F2V,
          model: "VIDU_Q3_PRO_F2V_1080P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "1080P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_PRO_F2V,
          model: "VIDU_Q3_PRO_F2V_1080P_PEAK",
          mode: "Peak",
          resolution: "1080P",
          unit: "s",
        },
        {
          name: "Vidu Q3 Turbo Text-to-Video",
          rowSpan: 6,
          func: FUNC_NAME.VIDU_Q3_TURBO_T2V,
          model: "VIDU_Q3_TURBO_T2V_540P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "540P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_T2V,
          model: "VIDU_Q3_TURBO_T2V_540P_PEAK",
          mode: "Peak",
          resolution: "540P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_T2V,
          model: "VIDU_Q3_TURBO_T2V_720P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "720P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_T2V,
          model: "VIDU_Q3_TURBO_T2V_720P_PEAK",
          mode: "Peak",
          resolution: "720P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_T2V,
          model: "VIDU_Q3_TURBO_T2V_1080P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "1080P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_T2V,
          model: "VIDU_Q3_TURBO_T2V_1080P_PEAK",
          mode: "Peak",
          resolution: "1080P",
          unit: "s",
        },
        {
          name: "Vidu Q3 Turbo Image-to-Video",
          rowSpan: 6,
          func: FUNC_NAME.VIDU_Q3_TURBO_I2V,
          model: "VIDU_Q3_TURBO_I2V_540P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "540P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_I2V,
          model: "VIDU_Q3_TURBO_I2V_540P_PEAK",
          mode: "Peak",
          resolution: "540P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_I2V,
          model: "VIDU_Q3_TURBO_I2V_720P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "720P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_I2V,
          model: "VIDU_Q3_TURBO_I2V_720P_PEAK",
          mode: "Peak",
          resolution: "720P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_I2V,
          model: "VIDU_Q3_TURBO_I2V_1080P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "1080P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_I2V,
          model: "VIDU_Q3_TURBO_I2V_1080P_PEAK",
          mode: "Peak",
          resolution: "1080P",
          unit: "s",
        },
        {
          name: "Vidu Q3 Turbo Start-End-to-Video",
          rowSpan: 6,
          func: FUNC_NAME.VIDU_Q3_TURBO_F2V,
          model: "VIDU_Q3_TURBO_F2V_540P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "540P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_F2V,
          model: "VIDU_Q3_TURBO_F2V_540P_PEAK",
          mode: "Peak",
          resolution: "540P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_F2V,
          model: "VIDU_Q3_TURBO_F2V_720P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "720P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_F2V,
          model: "VIDU_Q3_TURBO_F2V_720P_PEAK",
          mode: "Peak",
          resolution: "720P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_F2V,
          model: "VIDU_Q3_TURBO_F2V_1080P_OFFPEAK",
          mode: "Off-Peak",
          resolution: "1080P",
          unit: "s",
        },
        {
          name: "",
          func: FUNC_NAME.VIDU_Q3_TURBO_F2V,
          model: "VIDU_Q3_TURBO_F2V_1080P_PEAK",
          mode: "Peak",
          resolution: "1080P",
          unit: "s",
        },
        {
          name: "PixVerse V4.5 Text to Video",
          rowSpan: 7,
          func: FUNC_NAME.PIXVERSE_V4_5_T2V,
          duration: 5,
          resolution: "360P",
        },
        {
          name: "",
          func: FUNC_NAME.PIXVERSE_V4_5_T2V,
          duration: 5,
          resolution: "540P",
        },
        {
          name: "",
          func: FUNC_NAME.PIXVERSE_V4_5_T2V,
          duration: 5,
          resolution: "720P",
        },
        {
          name: "",
          func: FUNC_NAME.PIXVERSE_V4_5_T2V,
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "",
          func: FUNC_NAME.PIXVERSE_V4_5_T2V,
          mode: "fast_mode",
          duration: 5,
          resolution: "360P",
        },
        {
          name: "",
          func: FUNC_NAME.PIXVERSE_V4_5_T2V,
          mode: "fast_mode",
          duration: 5,
          resolution: "540P",
        },
        {
          name: "",
          func: FUNC_NAME.PIXVERSE_V4_5_T2V,
          mode: "fast_mode",
          duration: 5,
          resolution: "720P",
        },
        {
          name: "PixVerse V4.5 Image to Video",
          rowSpan: 7,
          func: FUNC_NAME.PIXVERSE_V4_5_I2V,
          duration: 5,
          resolution: "360P",
        },
        {
          name: "",
          func: FUNC_NAME.PIXVERSE_V4_5_I2V,
          duration: 5,
          resolution: "540P",
        },
        {
          name: "",
          func: FUNC_NAME.PIXVERSE_V4_5_I2V,
          duration: 5,
          resolution: "720P",
        },
        {
          name: "",
          func: FUNC_NAME.PIXVERSE_V4_5_I2V,
          duration: 5,
          resolution: "1080P",
        },
        {
          name: "",
          func: FUNC_NAME.PIXVERSE_V4_5_I2V,
          mode: "fast_mode",
          duration: 5,
          resolution: "360P",
        },
        {
          name: "",
          func: FUNC_NAME.PIXVERSE_V4_5_I2V,
          mode: "fast_mode",
          duration: 5,
          resolution: "540P",
        },
        {
          name: "",
          func: FUNC_NAME.PIXVERSE_V4_5_I2V,
          mode: "fast_mode",
          duration: 5,
          resolution: "720P",
        },
        ...generateSeedanceTableConfig(
          "Seedance V1 Lite Text to Video",
          FUNC_NAME.SEEDANCE_V1_LITE_T2V,
        ),
        ...generateSeedanceTableConfig(
          "Seedance V1 Lite Image to Video",
          FUNC_NAME.SEEDANCE_V1_LITE_I2V,
        ),
        ...generateSeedanceTableConfig(
          "Seedance V1 Pro Text to Video",
          FUNC_NAME.SEEDANCE_V1_PRO_T2V,
        ),
        ...generateSeedanceTableConfig(
          "Seedance V1 Pro Image to Video",
          FUNC_NAME.SEEDANCE_V1_PRO_I2V,
        ),
        // 已由动态配置提供 (trimmed-data: seedance-1.5-pro-*)
        // ...generateSeedanceV15ProTableConfig(
        //   "Seedance 1.5 Pro Text to Video",
        //   FUNC_NAME.SEEDANCE_V15_PRO_T2V,
        //   false,
        // ),
        // ...generateSeedanceV15ProTableConfig(
        //   "Seedance 1.5 Pro Image to Video",
        //   FUNC_NAME.SEEDANCE_V15_PRO_I2V,
        //   true,
        // ),
        // 已由动态配置提供 (trimmed-data: heygen-video-translate)
        // {
        //   name: "Heygen Video-translate",
        //   mode: "-",
        //   func: FUNC_NAME.HEYGEN_VIDEO_TRANSLATE,
        //   unit: "s",
        // },
      ],
      table3: [
        {
          name: FUNCS.IMG2VIDEO.displayName,
          rowSpan: 2,
          func: FUNC_NAME.IMG2VIDEO,
          model: "SVD-XT",
          steps: 20,
        },
        {
          name: "",
          func: FUNC_NAME.IMG2VIDEO,
          model: "SVD",
          steps: 20,
        },
      ],
    },
    {
      type: FUNC_TYPE.AUDIO,
      table: [
        {
          name: FUNCS.TXT2SPEECH.displayName,
          func: FUNC_NAME.TXT2SPEECH,
          ...getDefaultParmas(FUNC_NAME.TXT2SPEECH),
        },
        {
          name: "MiniMax speech-02-hd",
          func: FUNC_NAME.MINIMAX_SPEECH_02_HD,
          mode: "T2A / T2A Async",
        },
        {
          name: "MiniMax speech-02-turbo",
          func: FUNC_NAME.MINIMAX_SPEECH_02_TURBO,
          mode: "T2A / T2A Async",
        },
        {
          name: "MiniMax speech-2.5-hd-preview",
          func: FUNC_NAME.MINIMAX_SPEECH_2_5_HD_PREVIEW,
          mode: "T2A / T2A Async",
        },
        {
          name: "MiniMax speech-2.5-turbo-preview",
          func: FUNC_NAME.MINIMAX_SPEECH_2_5_TURBO_PREVIEW,
          mode: "T2A / T2A Async",
        },
        {
          name: "MiniMax speech-2.6-turbo",
          func: FUNC_NAME.MINIMAX_SPEECH_2_6_TURBO,
          mode: "T2A / T2A Async",
        },
        {
          name: "MiniMax speech-2.6-hd",
          func: FUNC_NAME.MINIMAX_SPEECH_2_6_HD,
          mode: "T2A / T2A Async",
        },
        // 已由动态配置提供 (trimmed-data: minimax-speech-2.8-turbo, minimax-speech-2.8-hd)
        // {
        //   name: "MiniMax speech-2.8-turbo",
        //   func: FUNC_NAME.MINIMAX_SPEECH_2_8_TURBO,
        //   mode: "T2A / T2A Async",
        // },
        // {
        //   name: "MiniMax speech-2.8-hd",
        //   func: FUNC_NAME.MINIMAX_SPEECH_2_8_HD,
        //   mode: "T2A / T2A Async",
        // },
        {
          name: "MiniMax Voice-Cloning",
          func: FUNC_NAME.MINIMAX_VOICE_CLONING,
          mode: "-",
        },
        {
          name: "Fish Audio Text to Speech",
          func: FUNC_NAME.FISH_AUDIO_TEXT_TO_SPEECH,
          mode: "-",
        },
        {
          name: "Fish Audio Voice Cloning",
          func: FUNC_NAME.FISH_AUDIO_VOICE_CLONING,
          mode: "-",
        },
        // 已由动态配置提供 (trimmed-data: glm-tts, glm-tts-clone, glm-asr)
        // {
        //   name: "GLM TTS",
        //   func: FUNC_NAME.GLM_TTS,
        //   mode: "-",
        // },
        // {
        //   name: "GLM TTS Clone",
        //   func: FUNC_NAME.GLM_TTS_CLONE,
        //   mode: "-",
        // },
        // {
        //   name: "GLM Audio to Text",
        //   func: FUNC_NAME.GLM_ASR_2512,
        //   mode: "-",
        // },
      ],
    },
  ];
}
type PriceMapFromRedux = Record<
  string,
  | number
  | string
  | {
      originalPrice: number;
      discountPrice: number;
    }
>;
/** Map pricing filter type to API category (null = All media categories) */
const FILTER_TO_CATEGORY: Record<string, string | null> = {
  All: null,
  Video: "video_gen",
  Image: "image_gen",
  Audio: "audio_gen",
};
function flattenPriceMap(
  map: PriceMapFromRedux,
): Record<string, number | string> {
  const out: Record<string, number | string> = {};
  for (const [k, v] of Object.entries(map)) {
    if (v != null && typeof v === "object" && "discountPrice" in v) {
      const o = v as {
        originalPrice: number;
        discountPrice: number;
      };
      out[k] =
        typeof o.discountPrice === "number" && o.discountPrice < o.originalPrice
          ? o.discountPrice
          : o.originalPrice;
    } else {
      out[k] = v as number | string;
    }
  }
  return out;
}
function getRowSeriesKey(row: Record<string, any>): string {
  const series = row.series?.trim();
  if (series) return series;
  const name = (row.name || row.displayName || "").trim();
  if (!name) return "\u9999";
  const enMatch = name.match(/^([A-Za-z][A-Za-z0-9_-]*)/);
  if (enMatch) return enMatch[1];
  return name.slice(0, 4) || "\u9999";
}
/**
 * Sort table rows by series, preserving rowSpan groups.
 * RowSpan groups must stay consecutive; sorting individual rows would break table layout.
 */
function sortTableRowsBySeries<T extends Record<string, any>>(rows: T[]): T[] {
  if (!rows || rows.length <= 1) return rows;
  const groups: T[][] = [];
  let i = 0;
  while (i < rows.length) {
    const row = rows[i];
    const rowSpan = row.rowSpan;
    if (rowSpan && rowSpan > 1) {
      groups.push(rows.slice(i, i + rowSpan) as T[]);
      i += rowSpan;
    } else {
      groups.push([row]);
      i++;
    }
  }
  groups.sort((ga, gb) => {
    const ka = getRowSeriesKey(ga[0]);
    const kb = getRowSeriesKey(gb[0]);
    if (ka !== kb) return ka.localeCompare(kb, "en");
    return (ga[0].name || "").localeCompare(gb[0].name || "", "en");
  });
  return groups.flat();
}
/**
 * Compute rowSpan and skipNameRows for name column when multiple consecutive
 * rows share the same name (merged cell). Used by both table layouts.
 */
function computeNameRowSpanMaps(
  tableData: Array<Record<string, any>>,
  hasNameColumn: boolean,
): {
  rowSpanMap: Record<number, number>;
  skipNameRows: Set<number>;
} {
  if (!hasNameColumn) {
    return { rowSpanMap: {}, skipNameRows: new Set<number>() };
  }

  const { rowSpanMap, skipRows } = computeRowSpanMaps(
    tableData,
    (data) => data.name,
  );

  return { rowSpanMap, skipNameRows: skipRows };
}
const ModelAPIPrice: React.FC<{
  llmList: LLMModelWithStatus[];
  embeddingList: LLMModelWithStatus[];
  isConsole?: boolean;
  dynamicModelConfigs?: DynamicModelConfig[];
  dynamicPriceMap?: PriceMapFromRedux;
}> = ({
  llmList,
  embeddingList,
  isConsole = false,
  dynamicModelConfigs = [],
  dynamicPriceMap = {},
}) => {
  const [calcFunc, setCalcFunc] = useState<FUNC_NAME | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [filterType, setFilterType] = useState<PricingFilterType>("All");
  const [selectedProvider, setSelectedProvider] = useState("");
  const searchParams = useSearchParams();
  const flatPriceMap = useMemo(
    () => flattenPriceMap(dynamicPriceMap),
    [dynamicPriceMap],
  );
  const filteredDynamicModelConfigs = useMemo(() => {
    let filtered = dynamicModelConfigs.filter(
      (config) =>
        config.modelConfig.skuMappings &&
        config.modelConfig.skuMappings.length > 0,
    );
    const targetCategory = FILTER_TO_CATEGORY[filterType];
    if (targetCategory === null) {
      filtered = filtered.filter((config) =>
        ["video_gen", "image_gen", "audio_gen"].includes(
          config.modelConfig.config.category,
        ),
      );
    } else if (targetCategory) {
      filtered = filtered.filter(
        (config) => config.modelConfig.config.category === targetCategory,
      );
    } else {
      filtered = [];
    }
    return filtered;
  }, [dynamicModelConfigs, filterType]);
  const priceContent = useMemo(() => {
    const content = getPriceContent(embeddingList);
    /**
     * Only dedupe static rows when the dynamic pipeline actually produces rows.
     * If API returns a config for the same path but generateDynamicMultimodalPricingTableRows
     * returns [] (e.g. pricingConfig incomplete / ensureDefaultPricingConfig null),
     * filtering static would hide the model entirely — keep static as fallback.
     */
    const dynamicPathsWithRowsSet = new Set<string>();
    /**
     * Filter static rows whose path exists in dynamic models.
     * Must filter by rowSpan group: if any row in a group matches, exclude the entire group.
     * Otherwise we'd create orphan continuation rows (name: "") and break table column alignment.
     */
    const filterStaticRowsByDynamicPaths = (rows: any[]): any[] => {
      if (!rows || rows.length === 0) return rows;
      const result: any[] = [];
      let i = 0;
      while (i < rows.length) {
        const row = rows[i];
        const rowSpan = row.rowSpan;
        if (rowSpan && rowSpan > 1) {
          const group = rows.slice(i, i + rowSpan);
          const shouldFilter = group.some((r) => {
            const p = getPathForStaticRow(r);
            return p != null && dynamicPathsWithRowsSet.has(p);
          });
          if (!shouldFilter) result.push(...group);
          i += rowSpan;
        } else {
          const p = getPathForStaticRow(row);
          if (!p || !dynamicPathsWithRowsSet.has(p)) result.push(row);
          i++;
        }
      }
      return result;
    };
    const dynamicRowsByCategory: {
      video_gen: any[];
      image_gen: any[];
      audio_gen: any[];
    } = { video_gen: [], image_gen: [], audio_gen: [] };
    filteredDynamicModelConfigs.forEach((modelConfig) => {
      const rows = generateDynamicMultimodalPricingTableRows(
        modelConfig,
        flatPriceMap,
        createCopy(),
      );
      if (rows.length === 0) return;
      const path = extractPrimaryPath(
        modelConfig.modelConfig?.config?.openapiSchema,
      );
      if (path) dynamicPathsWithRowsSet.add(path);
      const category = modelConfig.modelConfig.config
        .category as keyof typeof dynamicRowsByCategory;
      if (dynamicRowsByCategory[category]) {
        dynamicRowsByCategory[category].push(...rows);
      }
    });
    const contentWithDynamic = content.map((item) => {
      const itemWithTables = item as typeof item & {
        table: any[];
        table2?: any[];
        table3?: any[];
      };
      if (item.type === FUNC_TYPE.VIDEO_GENERATOR) {
        const staticTable2 = filterStaticRowsByDynamicPaths(
          itemWithTables.table2 ?? [],
        );
        const table2 = sortTableRowsBySeries([
          ...staticTable2,
          ...dynamicRowsByCategory.video_gen,
        ]);
        return { ...itemWithTables, table2 };
      }
      if (item.type === FUNC_TYPE.IMG) {
        const staticTable2 = filterStaticRowsByDynamicPaths(
          itemWithTables.table2 ?? [],
        );
        const table2 = sortTableRowsBySeries([
          ...staticTable2,
          ...dynamicRowsByCategory.image_gen,
        ]);
        return { ...itemWithTables, table2 };
      }
      if (item.type === FUNC_TYPE.AUDIO) {
        const staticTable = filterStaticRowsByDynamicPaths(
          itemWithTables.table ?? [],
        );
        const table = sortTableRowsBySeries([
          ...staticTable,
          ...dynamicRowsByCategory.audio_gen,
        ]);
        return { ...itemWithTables, table };
      }
      return item;
    });
    return contentWithDynamic;
  }, [embeddingList, filteredDynamicModelConfigs, flatPriceMap]);
  const debouncedSetSearchValue = useMemo(
    () => debounce((value: string) => setSearchValue(value), 1000),
    [],
  );
  useEffect(() => {
    return () => {
      debouncedSetSearchValue.cancel();
    };
  }, [debouncedSetSearchValue]);
  useEffect(() => {
    if (searchParams.get("ai-search")) {
      setFilterType("AI Search");
    }
  }, [searchParams]);
  const handleSearchChange = useCallback(
    (value: string) => {
      setInputValue(value);
      if (value === "") {
        setSearchValue("");
        debouncedSetSearchValue.cancel();
      } else {
        debouncedSetSearchValue(value);
      }
    },
    [debouncedSetSearchValue],
  );
  const availableProviders = useMemo(() => {
    const providers = new Set<string>();
    llmList.forEach((model) => {
      if (model.id) {
        const provider = model.id.split("/")[0];
        if (provider) {
          providers.add(provider);
        }
      }
    });
    return Array.from(providers).sort();
  }, [llmList]);
  const shouldShowLLMSection = useMemo(() => {
    return (
      filterType === "All" || filterType === "LLM" || filterType === "Cache"
    );
  }, [filterType]);
  const filteredLLMList = useMemo(() => {
    let filtered = [...llmList];
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      filtered = filtered.filter(
        (model) =>
          model.displayName?.toLowerCase().includes(searchLower) ||
          model.name?.toLowerCase().includes(searchLower) ||
          model.id?.toLowerCase().includes(searchLower),
      );
    }
    if (selectedProvider) {
      filtered = filtered.filter((model) => {
        const provider = model.id?.split("/")[0];
        return provider === selectedProvider;
      });
    }
    // Filter by Cache: show only models with cache_read_input_token_price_per_m
    if (filterType === "Cache") {
      filtered = filtered.filter((model) => {
        return (
          model.cache_read_input_token_price_per_m !== undefined &&
          model.cache_read_input_token_price_per_m !== null &&
          model.cache_read_input_token_price_per_m > 0
        );
      });
    }
    return filtered;
  }, [llmList, searchValue, selectedProvider, filterType]);
  const scrollToFirstMatch = useCallback(() => {
    if (!searchValue.trim() || !shouldShowLLMSection) {
      return;
    }
    const searchLower = searchValue.toLowerCase();
    const firstMatchingModel = filteredLLMList.find(
      (model) =>
        model.displayName?.toLowerCase().includes(searchLower) ||
        model.name?.toLowerCase().includes(searchLower) ||
        model.id?.toLowerCase().includes(searchLower),
    );
    if (firstMatchingModel) {
      const provider = firstMatchingModel.id?.split("/")[0];
      if (provider) {
        const normalizedProvider =
          provider.toLowerCase() === "sao10k"
            ? "Sao10K"
            : provider.toLowerCase();
        const sectionId = `pricing-model-${normalizedProvider}`;
        const element = document.getElementById(sectionId);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }, 100);
        }
      }
    }
  }, [searchValue, filteredLLMList, shouldShowLLMSection]);
  useEffect(() => {
    if (searchValue.trim()) {
      scrollToFirstMatch();
    }
  }, [searchValue, scrollToFirstMatch]);
  const filteredPriceContent = useMemo(() => {
    let filtered = [...priceContent];
    // Filter by type
    if (filterType !== "All") {
      const typeMap: Record<PricingFilterType, symbol[]> = {
        All: [],
        LLM: [FUNC_TYPE.LLM, FUNC_TYPE.EMBEDDING],
        Image: [FUNC_TYPE.IMG],
        Audio: [FUNC_TYPE.AUDIO],
        Video: [FUNC_TYPE.VIDEO_GENERATOR],
        "AI Search": [],
        Cache: [],
      };
      const allowedTypes = typeMap[filterType];
      if (!allowedTypes || allowedTypes.length === 0) {
        filtered = [];
      } else {
        filtered = filtered.filter((content) =>
          allowedTypes.includes(content.type),
        );
      }
    }
    // Filter by search value
    if (searchValue.trim()) {
      const searchLower = searchValue.toLowerCase();
      // Helper function to filter table rows with rowSpan support
      const filterTableRows = (table: any[]) => {
        if (!table || table.length === 0) return [];
        const filtered: any[] = [];
        let skipCount = 0;
        for (let i = 0; i < table.length; i++) {
          if (skipCount > 0) {
            skipCount--;
            continue;
          }
          const row = table[i];
          const name = row.name?.toLowerCase() || "";
          const func = row.func?.toLowerCase() || "";
          const matches =
            name.includes(searchLower) || func.includes(searchLower);
          if (matches) {
            // If this row matches, include it and its rowSpan rows
            if (row.rowSpan && row.rowSpan > 1) {
              // Include this row and the next (rowSpan - 1) rows
              for (let j = 0; j < row.rowSpan && i + j < table.length; j++) {
                filtered.push(table[i + j]);
              }
              skipCount = row.rowSpan - 1;
            } else {
              filtered.push(row);
            }
          } else if (row.rowSpan && row.rowSpan > 1) {
            // Check if any row in the rowSpan group matches
            let groupMatches = false;
            for (let j = 0; j < row.rowSpan && i + j < table.length; j++) {
              const checkRow = table[i + j];
              const checkName = checkRow.name?.toLowerCase() || "";
              const checkFunc = checkRow.func?.toLowerCase() || "";
              if (
                checkName.includes(searchLower) ||
                checkFunc.includes(searchLower)
              ) {
                groupMatches = true;
                break;
              }
            }
            if (groupMatches) {
              // Include all rows in the group
              for (let j = 0; j < row.rowSpan && i + j < table.length; j++) {
                filtered.push(table[i + j]);
              }
              skipCount = row.rowSpan - 1;
            } else {
              // Skip this rowSpan group
              skipCount = row.rowSpan - 1;
            }
          }
        }
        return filtered;
      };
      filtered = filtered
        .map((content) => {
          // Check if any table row matches the search
          const contentAny = content as any;
          const tables = [
            content.table || [],
            contentAny.table2 || [],
            contentAny.table3 || [],
          ];
          const hasMatch = tables.some((table) =>
            table.some((row: any) => {
              const name = row.name?.toLowerCase() || "";
              const func = row.func?.toLowerCase() || "";
              return name.includes(searchLower) || func.includes(searchLower);
            }),
          );
          if (!hasMatch) {
            return null;
          }
          // Filter table rows that match the search
          const filteredContent: any = { ...content };
          filteredContent.table = filterTableRows(content.table || []);
          if (contentAny.table2) {
            filteredContent.table2 = filterTableRows(contentAny.table2 || []);
          }
          if (contentAny.table3) {
            filteredContent.table3 = filterTableRows(contentAny.table3 || []);
          }
          return filteredContent;
        })
        .filter((content) => content !== null) as typeof filtered;
    }
    return filtered;
  }, [priceContent, filterType, searchValue]);
  const handleOpenCalculator = useCallback((params: any) => {
    analytics.trackClick(
      CLICK_BTN_IDs.PRICING_BTNS.SERVERLESS_ENDPOINTS_CALCULATOR,
      {
        calcFunc: params,
      },
    );
    setCalcFunc(params);
  }, []);
  const handleCloseCalculator = useCallback(() => {
    setCalcFunc(null);
  }, []);
  const renderMobilePricingCards = (
    type: symbol,
    tables: Array<{ data: any[]; segment: string }>,
  ) => (
    <div className="flex flex-col gap-space-12 md:hidden">
      {tables.flatMap((tableItem, tableIndex) => {
        const columns = getCalTableColumns(type, tableItem.segment);
        const tableData = tableItem.data || [];

        return tableData.map((data, rowIndex) => {
          const fields = columns
            .map((column) => {
              if (column.dataIndex === "name") {
                return null;
              }

              const rawValue =
                column.dataIndex === "Input" || column.dataIndex === "Output"
                  ? data
                  : data[column.dataIndex as keyof typeof data];
              const value = column.render
                ? column.render(rawValue, data as any)
                : rawValue;

              if (value === undefined || value === null || value === "") {
                return null;
              }

              return {
                label: column.title,
                value,
              };
            })
            .filter(Boolean) as Array<{
            label: React.ReactNode;
            value: React.ReactNode;
          }>;
          const title =
            data.name ||
            data.func ||
            data.mode ||
            data.resolution ||
            FUNC_TYPE_NAME[type];

          return (
            <PricingMobileCard
              key={`${tableIndex}-${rowIndex}`}
              data-testid="model-api-mobile-card"
              title={title}
              fields={fields}
            />
          );
        });
      })}
    </div>
  );
  return (
    <div
      className={`${styles.model_api_price} ${isConsole ? "w-full px-2 console_model_api_price" : "max_width_container"}`}
    >
      <div className="mb-space-24">
        <p
          className={`font-miletus text-paragraph-13 text-[var(--text-1)] mb-space-16 ${isConsole ? "text-left" : "text-left md:text-center"}`}
        >
          Batch inference is available at an introductory 50% discount on input
          and output tokens for supported models.{" "}
          <a
            href={DOCS_URL.LLM_BATCH_INFERENCE}
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap text-[var(--brand-0)] hover:opacity-80 transition-opacity"
            id={CLICK_BTN_IDs.PRICING_BTNS.PRICING_BATCH_INFERENCE_LEARN_MORE}
          >
            Learn More
          </a>
        </p>
        <div className={isConsole ? "" : "flex justify-center"}>
          <PricingModelFilter
            searchValue={inputValue}
            filterType={filterType}
            selectedProvider={selectedProvider}
            availableProviders={availableProviders}
            onSearchChange={handleSearchChange}
            onFilterTypeChange={(type) => {
              setFilterType(type);
              setSelectedProvider("");
            }}
            onProviderChange={setSelectedProvider}
            isConsole={isConsole}
          />
        </div>
      </div>
      {filterType === "AI Search" ? (
        <AISearchPrice isConsole={isConsole} />
      ) : (
        <>
          {shouldShowLLMSection && filteredLLMList.length > 0 && (
            <div className="mb-[50px]">
              <LLMModelsSection
                llmList={filteredLLMList}
                isConsole={isConsole}
              />
            </div>
          )}
          {shouldShowLLMSection && embeddingList.length === 0 && (
            <div className={`${styles.price_card}`}>
              <h6 className={styles.category_title}>
                {FUNC_TYPE_NAME[FUNC_TYPE.EMBEDDING]}
              </h6>
              <div>
                <Skeleton className="h-[30px] rounded-sm animate-pulse" />
                <Skeleton className="h-[30px] rounded-sm animate-pulse my-4" />
                <Skeleton className="h-[30px] rounded-sm animate-pulse" />
              </div>
            </div>
          )}
          {filteredPriceContent.map(
            (
              {
                type,
                description1,
                description2,
                calculate,
                table,
                table2,
                table3,
              }: {
                type: symbol;
                description1?: string;
                description2?: string;
                calculate?: boolean;
                table: any[];
                table2?: any[];
                table3?: any[];
              },
              index,
            ) => {
              // Create an array of table data and their corresponding segment identifiers
              const tables: Array<{ data: any[]; segment: string }> = [
                { data: table, segment: "t1" },
                { data: table2 ?? [], segment: "t2" },
                { data: table3 ?? [], segment: "t3" },
              ].filter((item) => item.data.length > 0);
              // Check if this type should use the left-right layout (same as LLM)
              const shouldUseLeftRightLayout = [
                FUNC_TYPE.EMBEDDING,
                FUNC_TYPE.IMG,
                FUNC_TYPE.VIDEO_GENERATOR,
                FUNC_TYPE.AUDIO,
              ].includes(type);
              // Build description text
              const descriptionText = description1 ? (
                <>
                  <span>{description1}</span>
                  {calculate && (
                    <span
                      className={styles.calc_btn}
                      onClick={() =>
                        handleOpenCalculator(CALC_CATEGORY_MAP[type][0])
                      }
                    >
                      {"Pricing Calculator"}
                    </span>
                  )}
                  <span>{description2 || ""}</span>
                </>
              ) : null;
              return (
                <div
                  id={type?.description?.toLowerCase().replaceAll(" ", "-")}
                  autoFocus
                  key={index}
                  className={`${styles.price_card}`}
                >
                  {shouldUseLeftRightLayout ? (
                    <div className="-m-6">
                      <div className="bg-white rounded-[6px] border border-[var(--gray-2)] p-4">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Left side: Title and Description */}
                          <div className="flex-shrink-0 w-full md:w-[224px] px-2 md:pt-4">
                            <h3
                              className={`${isConsole ? "text-sm md:text-base" : "text-base md:text-xl"} font-semibold text-foreground mb-2`}
                            >
                              {FUNC_TYPE_NAME[type]}
                            </h3>
                            {descriptionText && (
                              <div className="mt-2">
                                <p className="text-xs text-[var(--dark-2)] leading-relaxed">
                                  {descriptionText}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Right side: Tables */}
                          {renderMobilePricingCards(type, tables)}
                          <div className="hidden flex-1 overflow-x-auto md:block">
                            {tables.map((tableItem, tableIndex) => {
                              const columns = getCalTableColumns(
                                type,
                                tableItem.segment,
                              );
                              const tableData = tableItem.data || [];
                              const hasNameColumn = columns.some(
                                (col) => col.dataIndex === "name",
                              );
                              const { rowSpanMap, skipNameRows } =
                                computeNameRowSpanMaps(
                                  tableData,
                                  hasNameColumn,
                                );
                              return (
                                <Table
                                  key={tableIndex}
                                  className={`${tableIndex > 0 ? "mt-8" : ""} ${styles.table_wrap}`}
                                >
                                  <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                      {columns.map((column) => (
                                        <TableHead
                                          key={column.dataIndex}
                                          className={`font-semibold text-[var(--dark-4)] bg-[var(--gray-3)] ${isConsole ? "text-xs" : "text-xs md:text-sm"}`}
                                        >
                                          {column.title}
                                        </TableHead>
                                      ))}
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody className="bg-white rounded-lg overflow-hidden">
                                    {tableData.map((data, rowIndex) => (
                                      <TableRow
                                        key={rowIndex}
                                        className={styles.table_row_hover}
                                      >
                                        {columns.map((column) => {
                                          const cellAttr: Record<string, any> =
                                            {
                                              className: `${styles.table_cell} ${isConsole ? "text-xs" : "text-xs md:text-sm"}`,
                                            };
                                          if (column.dataIndex === "name") {
                                            if (
                                              hasNameColumn &&
                                              rowSpanMap[rowIndex] !== undefined
                                            ) {
                                              cellAttr.rowSpan =
                                                rowSpanMap[rowIndex];
                                              cellAttr.className = `${styles.table_cell} ${styles.table_cell_no_hover} ${isConsole ? "text-xs" : "text-xs md:text-sm"}`;
                                            } else if (data.rowSpan) {
                                              cellAttr.rowSpan = data.rowSpan;
                                              cellAttr.className = `${styles.table_cell} ${styles.table_cell_no_hover} ${isConsole ? "text-xs" : "text-xs md:text-sm"}`;
                                            }
                                            if (
                                              hasNameColumn &&
                                              skipNameRows.has(rowIndex)
                                            ) {
                                              return null;
                                            }
                                            if (!data.name) {
                                              return null;
                                            }
                                          }
                                          if (
                                            column.dataIndex === "Input" ||
                                            column.dataIndex === "Output"
                                          ) {
                                            return (
                                              <TableCell
                                                key={column.dataIndex}
                                                {...cellAttr}
                                              >
                                                {column.render
                                                  ? column.render(
                                                      data,
                                                      data as any,
                                                    )
                                                  : data[
                                                      column.dataIndex as keyof typeof data
                                                    ]}
                                              </TableCell>
                                            );
                                          }
                                          return (
                                            <TableCell
                                              key={column.dataIndex}
                                              {...cellAttr}
                                            >
                                              {column.render
                                                ? column.render(
                                                    data[
                                                      column.dataIndex as keyof typeof data
                                                    ],
                                                    data as any,
                                                  )
                                                : data[
                                                    column.dataIndex as keyof typeof data
                                                  ]}
                                            </TableCell>
                                          );
                                        })}
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h6 className={styles.category_title}>
                        {FUNC_TYPE_NAME[type]}
                      </h6>
                      <div>
                        {(description1 || calculate) && (
                          <p className={styles.category_desc}>
                            <span>{description1 || ""}</span>
                            {calculate && (
                              <span
                                className={styles.calc_btn}
                                onClick={() =>
                                  handleOpenCalculator(
                                    CALC_CATEGORY_MAP[type][0],
                                  )
                                }
                              >
                                {"Pricing Calculator"}
                              </span>
                            )}
                            <span>{description2 || ""}</span>
                          </p>
                        )}

                        {renderMobilePricingCards(type, tables)}
                        <div className="hidden md:block">
                          {tables.map((tableItem, tableIndex) => {
                            const columns = getCalTableColumns(
                              type,
                              tableItem.segment,
                            );
                            const tableDataAlt = tableItem.data || [];
                            const hasNameColumnAlt = columns.some(
                              (col) => col.dataIndex === "name",
                            );
                            const {
                              rowSpanMap: rowSpanMapAlt,
                              skipNameRows: skipNameRowsAlt,
                            } = computeNameRowSpanMaps(
                              tableDataAlt,
                              hasNameColumnAlt,
                            );
                            return (
                              <Table
                                key={tableIndex}
                                className={`${tableIndex > 0 ? "mt-8" : ""} ${styles.table_wrap}`}
                              >
                                <TableHeader>
                                  <TableRow>
                                    {columns.map((column) => (
                                      <TableHead key={column.dataIndex}>
                                        {column.title}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {tableDataAlt.map((data, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                      {columns.map((column) => {
                                        const cellAttr: Record<string, any> = {
                                          className: styles.table_cell,
                                        };
                                        if (column.dataIndex === "name") {
                                          if (
                                            hasNameColumnAlt &&
                                            rowSpanMapAlt[rowIndex] !==
                                              undefined
                                          ) {
                                            cellAttr.rowSpan =
                                              rowSpanMapAlt[rowIndex];
                                          } else if (data.rowSpan) {
                                            cellAttr.rowSpan = data.rowSpan;
                                          }
                                          if (
                                            hasNameColumnAlt &&
                                            skipNameRowsAlt.has(rowIndex)
                                          ) {
                                            return null;
                                          }
                                          if (!data.name) {
                                            return null;
                                          }
                                        }
                                        return (
                                          <TableCell
                                            key={column.dataIndex}
                                            {...cellAttr}
                                          >
                                            {column.render
                                              ? column.render(
                                                  data[
                                                    column.dataIndex as keyof typeof data
                                                  ],
                                                  data as any,
                                                )
                                              : data[
                                                  column.dataIndex as keyof typeof data
                                                ]}
                                          </TableCell>
                                        );
                                      })}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            },
          )}
        </>
      )}
      {/* Add AI Search pricing card under the "All" view */}
      {filterType === "All" && (
        <AISearchPrice isConsole={isConsole} searchValue={searchValue} />
      )}
      <CalculatorModal
        copy={createCopy()}
        calcFunc={calcFunc}
        onFuncChange={setCalcFunc}
        onClose={handleCloseCalculator}
      />
    </div>
  );
};
export default ModelAPIPrice;
