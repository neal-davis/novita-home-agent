"use client";

import { Slider as BaseSlider } from "@/components/ui/slider";
import type { ComponentPropsWithoutRef } from "react";

type ValueSliderProps = Omit<
  ComponentPropsWithoutRef<typeof BaseSlider>,
  "value" | "defaultValue" | "onChange" | "onValueChange" | "onValueCommit"
> & {
  value?: number | number[];
  defaultValue?: number | number[];
  onChange?: (value: any) => void;
  onAfterChange?: (value: any) => void;
  range?: boolean;
  tooltip?: unknown;
  marks?: unknown;
  styles?: unknown;
};

function normalizeSliderValue(value?: number | number[]) {
  if (Array.isArray(value)) return value;
  if (typeof value === "number") return [value];
  return undefined;
}

function denormalizeSliderValue(value: number[], range?: boolean) {
  return range ? value : value[0];
}

export function ValueSlider({
  value,
  defaultValue,
  onChange,
  onAfterChange,
  range,
  tooltip: _tooltip,
  marks: _marks,
  styles: _styles,
  ...props
}: ValueSliderProps) {
  return (
    <BaseSlider
      {...props}
      value={normalizeSliderValue(value)}
      defaultValue={normalizeSliderValue(defaultValue)}
      onValueChange={(nextValue) => {
        onChange?.(denormalizeSliderValue(nextValue, range));
      }}
      onValueCommit={(nextValue) => {
        onAfterChange?.(denormalizeSliderValue(nextValue, range));
      }}
    />
  );
}
