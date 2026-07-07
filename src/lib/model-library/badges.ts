import {
  LLMModelStatus,
  ModelLabelMap,
  type LLMModelWithStatus,
  type MediaModel,
} from "@/types/models";

type AnyModel = LLMModelWithStatus | MediaModel;

export type ModelBadge =
  | { label: "Deprecated"; kind: "deprecated" }
  | { label: string; kind: "discount" }
  | { label: "Free"; kind: "free" }
  | { label: "Hot"; kind: "hot" }
  | { label: "New"; kind: "new" }
  | { label: string; kind: "custom" };

const reservedDisplayLabelValues = new Set<string>([
  ModelLabelMap.Discount,
  ModelLabelMap.Free,
  ModelLabelMap.Hot,
  ModelLabelMap.New,
]);

function hasDisplayLabel(model: AnyModel, value: ModelLabelMap) {
  return (
    model.labels?.some(
      (label) => label.key === ModelLabelMap.Display && label.value === value,
    ) ?? false
  );
}

function getDiscountPercent(model: AnyModel) {
  const discount = "discount" in model ? model.discount : undefined;

  if (discount !== undefined && discount > 0 && discount < 1) {
    return Math.round((1 - discount) * 100);
  }

  return null;
}

function getCustomDisplayLabel(model: AnyModel): string | null {
  const label = model.labels?.find((one) => {
    const value = one.value.trim();

    return (
      one.key === ModelLabelMap.Display &&
      value.length > 0 &&
      !reservedDisplayLabelValues.has(value)
    );
  });

  return label?.value.trim() ?? null;
}

export function getPrimaryModelBadge(model: AnyModel): ModelBadge | null {
  if ("status" in model && model.status === LLMModelStatus.Deprecated) {
    return { label: "Deprecated", kind: "deprecated" };
  }

  const discountPercent = hasDisplayLabel(model, ModelLabelMap.Discount)
    ? getDiscountPercent(model)
    : null;
  if (discountPercent !== null) {
    return {
      // i18n-disable-next-line
      label: `LIMITED TIME ${discountPercent}% OFF`,
      kind: "discount",
    };
  }

  if (
    ("isFree" in model && model.isFree) ||
    hasDisplayLabel(model, ModelLabelMap.Free)
  ) {
    return { label: "Free", kind: "free" };
  }

  if (
    ("isHot" in model && model.isHot) ||
    hasDisplayLabel(model, ModelLabelMap.Hot)
  ) {
    return { label: "Hot", kind: "hot" };
  }

  if (
    ("isNew" in model && model.isNew) ||
    hasDisplayLabel(model, ModelLabelMap.New)
  ) {
    return { label: "New", kind: "new" };
  }

  const customDisplayLabel = getCustomDisplayLabel(model);
  if (customDisplayLabel !== null) {
    return { label: customDisplayLabel, kind: "custom" };
  }

  return null;
}

export function isModelFeatured(model: AnyModel): boolean {
  if (Array.isArray(model.labels)) {
    return model.labels.some(
      (label) =>
        label.key === ModelLabelMap.Filter &&
        label.value === ModelLabelMap.Featured,
    );
  }

  return Boolean("isFeatured" in model && model.isFeatured);
}
