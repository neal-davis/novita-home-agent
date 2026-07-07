import type { AnyModel } from "../capabilities";

export type FacetMatchMode = "any" | "all" | "single";

export type FacetOption = {
  label: string;
  value: string;
  count: number;
};

export type FacetDefinition = {
  key: string;
  label: string;
  matchMode: FacetMatchMode;
  kind: "bitmask" | "set";
  options?: Array<{ label: string; value: string; bit: number }>;
  getValues: (model: AnyModel) => string[];
};

export type FacetFilterState = Record<string, string[]>;

export type ModelFacetRecord = {
  model: AnyModel;
  bitmasks: Record<string, number>;
  values: Record<string, string[]>;
};
