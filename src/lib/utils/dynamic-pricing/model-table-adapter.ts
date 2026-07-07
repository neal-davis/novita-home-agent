/**
 * Dynamic multimodal pricing adapter
 * Converts video/image/audio pricing data to the existing pricing page row format.
 */
import {
  DynamicModelConfig,
  DynamicPriceTableRow,
} from "@/types/dynamic-pricing";
import { generateTableRows } from "./table-generator";
import Big from "big.js";
/**
 * Get dynamic model series
 */
function getDynamicModelSeries(modelConfig: DynamicModelConfig): string {
  const series = modelConfig.fusionConfig?.series?.trim();
  return series || "others";
}
/**
 * Convert dynamic multimodal pricing data to pricing page table rows.
 */
export function generateDynamicMultimodalPricingTableRows(
  modelConfig: DynamicModelConfig,
  priceMap: Record<
    string,
    | number
    | string
    | {
        originalPrice: number;
        discountPrice: number;
      }
  >,
  copy?: unknown,
): any[] {
  const inferHasAudio = (row: DynamicPriceTableRow): boolean | undefined => {
    const anyRow = row as any;
    if (typeof anyRow.hasAudio === "boolean") return anyRow.hasAudio;
    // Kling v2.6 Pro uses `sound` in OpenAPI & CEL
    if (typeof anyRow.sound === "boolean") return anyRow.sound;
    // Seedance 1.5 Pro uses `generate_audio`
    if (typeof anyRow.generate_audio === "boolean")
      return anyRow.generate_audio;
    // fallback: infer from SKU code conventions
    if (typeof anyRow.skuCode === "string" && anyRow.skuCode) {
      const sku = anyRow.skuCode;
      // explicit "no audio" markers
      if (/(?:^|_)SILENT(?:_|$)/.test(sku)) return false;
      if (/(?:^|_)NA(?:_|$)/.test(sku)) return false;
      // explicit "has audio" markers
      if (/(?:^|_)AUDIO(?:_|$)/.test(sku)) return true;
      if (/(?:^|_)VIDEO_AUDIO(?:_|$)/.test(sku)) return true;
      if (/(?:^|_)A(?:_|$)/.test(sku)) return true;
    }
    return undefined;
  };
  const dynamicRows = generateTableRows(modelConfig, priceMap);
  return dynamicRows.map((row: DynamicPriceTableRow) => {
    const category = modelConfig.modelConfig.config.category;
    const billingExpr = modelConfig.modelConfig.config.billingExpr;
    let formattedPrice: string;
    const originalPrice =
      row.originalPrice !== undefined ? row.originalPrice : row.price;
    const discountPrice =
      row.discountPrice !== undefined ? row.discountPrice : row.price;
    const rawPrice: number | string | undefined =
      typeof discountPrice === "number" ? discountPrice : undefined;
    const unit =
      modelConfig.pricingConfig?.table?.priceUnit ||
      (category === "video_gen"
        ? "video"
        : category === "audio_gen"
          ? "10k chars"
          : "image");
    if (
      discountPrice === "-" ||
      discountPrice === null ||
      discountPrice === undefined ||
      discountPrice === ""
    ) {
      formattedPrice = "-";
    } else if (discountPrice === 0) {
      formattedPrice = "Free";
    } else if (typeof discountPrice === "number") {
      if (billingExpr) {
        const formattedDiscountPrice = new Big(discountPrice).toFixed(4);
        formattedPrice = `${"$"}${formattedDiscountPrice} /${unit}`;
      } else {
        formattedPrice = `${"$"}${discountPrice} /${unit}`;
      }
    } else {
      formattedPrice = discountPrice as string;
    }
    let durationValue: number | null = null;
    if (
      row.duration !== undefined &&
      row.duration !== null &&
      row.duration !== "" &&
      row.duration !== "null"
    ) {
      const numDuration = Number(row.duration);
      if (!isNaN(numDuration) && numDuration > 0) {
        durationValue = numDuration;
      }
    }
    const displayName =
      modelConfig.fusionConfig.displayName?.trim() ||
      modelConfig.fusionConfig.name ||
      modelConfig.modelConfig.config.name ||
      "Unknown model";
    const tableRow: any = {
      name: displayName,
      func: null,
      modelName: modelConfig.fusionConfig.name,
      mode: row.fast_mode || row.mode || "-",
      duration: durationValue,
      resolution: row.resolution || row.size,
      price: formattedPrice,
      rawPrice: rawPrice,
      originalPrice:
        typeof originalPrice === "number"
          ? billingExpr
            ? new Big(originalPrice).toFixed(4)
            : originalPrice
          : undefined,
      discountPrice:
        typeof discountPrice === "number"
          ? billingExpr
            ? new Big(discountPrice).toFixed(4)
            : discountPrice
          : undefined,
      priceUnit:
        modelConfig.pricingConfig?.table?.priceUnit ||
        (category === "video_gen"
          ? "video"
          : category === "audio_gen"
            ? "10k chars"
            : "image"),
      isDynamic: true,
      skuCode: row.skuCode,
      series: getDynamicModelSeries(modelConfig),
      priceNote: modelConfig.pricingConfig?.table?.priceNote,
    };
    if (category === "video_gen") {
      const hasAudio = inferHasAudio(row);
      if (hasAudio !== undefined) {
        tableRow.hasAudio = hasAudio;
      }
    }
    if (category === "image_gen") {
      tableRow.quality = row.quality || "-";
      tableRow.size = row.size || row.resolution || "-";
      if (row.width !== undefined) {
        tableRow.width = row.width;
      }
      if (row.height !== undefined) {
        tableRow.height = row.height;
      }
    }
    return tableRow;
  });
}
