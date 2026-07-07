"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  WheelEvent,
} from "react";

type NumberInputValue = number | null;

type NumberInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value" | "defaultValue" | "min" | "max" | "step"
> & {
  value?: number | null;
  defaultValue?: number | null;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  controls?: boolean;
  onChange?: (value: NumberInputValue) => void;
};

// i18n-disable-next-line
const decimalInputMode = "decimal";

function clampValue(value: number, min?: number, max?: number) {
  if (typeof min === "number" && value < min) return min;
  if (typeof max === "number" && value > max) return max;
  return value;
}

function normalizeValue(
  rawValue: string,
  min?: number,
  max?: number,
  precision?: number,
): NumberInputValue {
  if (rawValue === "") return null;

  const nextValue = Number(rawValue);
  if (Number.isNaN(nextValue)) return null;

  const clampedValue = clampValue(nextValue, min, max);
  if (typeof precision === "number") {
    return Number(clampedValue.toFixed(precision));
  }

  return clampedValue;
}

export function NumberInput({
  value,
  defaultValue,
  min,
  max,
  step,
  precision,
  controls: _controls,
  className,
  onChange,
  onBlur,
  onWheel,
  ...props
}: NumberInputProps) {
  const valueProps =
    value === undefined
      ? { defaultValue: defaultValue ?? undefined }
      : { value: value ?? "" };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(normalizeValue(event.target.value, min, max, precision));
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
  };

  return (
    <Input
      {...props}
      {...valueProps}
      type="number"
      inputMode={decimalInputMode}
      min={min}
      max={max}
      step={step}
      className={cn("h-9", className)}
      onChange={handleChange}
      onBlur={handleBlur}
      onWheel={(event: WheelEvent<HTMLInputElement>) => {
        event.currentTarget.blur();
        onWheel?.(event);
      }}
    />
  );
}
