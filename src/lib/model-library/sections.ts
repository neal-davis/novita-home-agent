import type { AnyModel } from "./capabilities";
import { isModelFeatured } from "./badges";
import type { FacetFilterState } from "./facets/types";

const FEATURED_LIMIT = 5;

export function hasActiveFacetFilters(filters: FacetFilterState): boolean {
  return Object.values(filters).some((values) => values.length > 0);
}

export function shouldShowFeaturedSection(filters: FacetFilterState): boolean {
  return !hasActiveFacetFilters(filters);
}

export function shouldUseFlatModelResults(filters: FacetFilterState): boolean {
  return (
    (filters.modalities?.length ?? 0) > 0 || (filters.series?.length ?? 0) > 0
  );
}

export function getFeaturedModels<T extends AnyModel>(models: T[]): T[] {
  return models.filter(isModelFeatured).slice(0, FEATURED_LIMIT);
}

function getModelSortTime(model: AnyModel) {
  if (!("platform_release_at" in model)) {
    return 0;
  }

  const value = model.platform_release_at;
  if (typeof value !== "string" && typeof value !== "number") {
    return 0;
  }

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    if (numericValue <= 0) {
      return 0;
    }

    const numericDate = new Date(
      numericValue < 10_000_000_000 ? numericValue * 1000 : numericValue,
    );
    return Number.isNaN(numericDate.getTime()) ? 0 : numericDate.getTime();
  }

  const date =
    typeof value === "string" && value.trim() !== "" ? new Date(value) : null;

  return !date || Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export function sortModelsByNewest<T extends AnyModel>(models: T[]): T[] {
  return [...models].sort((a, b) => {
    const timeDifference = getModelSortTime(b) - getModelSortTime(a);
    if (timeDifference !== 0) {
      return timeDifference;
    }

    const aName = a.displayName || a.name;
    const bName = b.displayName || b.name;
    return String(aName).localeCompare(String(bName));
  });
}
