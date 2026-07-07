import { matchesBitmask, valuesToMask } from "./bitmaskFacet";
import { matchesSet } from "./setFacet";
import type {
  FacetDefinition,
  FacetFilterState,
  FacetOption,
  ModelFacetRecord,
} from "./types";
import type { AnyModel } from "../capabilities";

function getBitByValue(facet: FacetDefinition) {
  return new Map(
    (facet.options ?? []).map((option) => [option.value, option.bit]),
  );
}

export function buildFacetRecords(
  models: AnyModel[],
  facets: FacetDefinition[],
): ModelFacetRecord[] {
  return models.map((model) => {
    const bitmasks: Record<string, number> = {};
    const values: Record<string, string[]> = {};

    for (const facet of facets) {
      const facetValues = facet.getValues(model);
      values[facet.key] = facetValues;
      if (facet.kind === "bitmask") {
        bitmasks[facet.key] = valuesToMask(facetValues, getBitByValue(facet));
      }
    }

    return {
      model,
      bitmasks,
      values,
    };
  });
}

export function applyFacetFilters(
  records: ModelFacetRecord[],
  facets: FacetDefinition[],
  filters: FacetFilterState,
) {
  const selectedBitmasks: Record<string, number> = {};

  for (const facet of facets) {
    if (facet.kind === "bitmask") {
      selectedBitmasks[facet.key] = valuesToMask(
        filters[facet.key] ?? [],
        getBitByValue(facet),
      );
    }
  }

  const result: AnyModel[] = [];

  for (const record of records) {
    let matches = true;

    for (const facet of facets) {
      const selectedValues = filters[facet.key] ?? [];
      if (selectedValues.length === 0) {
        continue;
      }

      if (facet.kind === "bitmask") {
        if (
          !matchesBitmask(
            record.bitmasks[facet.key] ?? 0,
            selectedBitmasks[facet.key] ?? 0,
            facet.matchMode,
          )
        ) {
          matches = false;
          break;
        }
        continue;
      }

      if (
        !matchesSet(
          record.values[facet.key] ?? [],
          selectedValues,
          facet.matchMode,
        )
      ) {
        matches = false;
        break;
      }
    }

    if (matches) {
      result.push(record.model);
    }
  }

  return result;
}

export function getFacetOptions(
  records: ModelFacetRecord[],
  facets: FacetDefinition[],
): Record<string, FacetOption[]> {
  return facets.reduce<Record<string, FacetOption[]>>((result, facet) => {
    const countByValue = new Map<string, number>();

    for (const record of records) {
      for (const value of record.values[facet.key] ?? []) {
        countByValue.set(value, (countByValue.get(value) ?? 0) + 1);
      }
    }

    const labelByValue = new Map(
      (facet.options ?? []).map((option) => [option.value, option.label]),
    );

    result[facet.key] = Array.from(countByValue.entries())
      .map(([value, count]) => ({
        label: labelByValue.get(value) ?? value,
        value,
        count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return result;
  }, {});
}
