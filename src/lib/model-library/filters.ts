import type { FacetFilterState } from "./facets/types";

export function createEmptyFacetFilterState(): FacetFilterState {
  return {
    modalities: [],
    series: [],
    features: [],
  };
}

export function toggleFacetValue(
  filters: FacetFilterState,
  key: string,
  value: string,
): FacetFilterState {
  const currentValues = filters[key] ?? [];
  const nextValues = currentValues.includes(value)
    ? currentValues.filter((item) => item !== value)
    : [...currentValues, value];

  return {
    ...filters,
    [key]: nextValues,
  };
}

export function clearFacetValue(
  filters: FacetFilterState,
  key: string,
  value: string,
): FacetFilterState {
  return {
    ...filters,
    [key]: (filters[key] ?? []).filter((item) => item !== value),
  };
}
