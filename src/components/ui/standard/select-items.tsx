"use client";

import type { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SelectItemOption = {
  value: string | number;
  label?: ReactNode;
  disabled?: boolean;
};

type SelectItemGroup = {
  label: ReactNode;
  options: SelectItemOption[];
};

type SelectItemsProps = {
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: ReactNode;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  options: Array<SelectItemOption | SelectItemGroup>;
  onFocus?: () => void;
  onBlur?: () => void;
  onChange?: (value: any) => void;
};

export function SelectItems({
  value,
  defaultValue,
  placeholder,
  disabled,
  className,
  triggerClassName,
  contentClassName,
  options,
  onFocus,
  onBlur,
  onChange,
}: SelectItemsProps) {
  const flatOptions = options.flatMap((item) =>
    "options" in item ? item.options : [item],
  );
  const valueMap = new Map(
    flatOptions.map((item) => [String(item.value), item.value]),
  );

  return (
    <Select
      value={value === undefined ? undefined : String(value)}
      defaultValue={
        defaultValue === undefined ? undefined : String(defaultValue)
      }
      disabled={disabled}
      onValueChange={(nextValue) => {
        onChange?.(valueMap.get(nextValue) ?? nextValue);
      }}
    >
      <SelectTrigger
        className={cn("h-9", triggerClassName, className)}
        onFocus={onFocus}
        onBlur={onBlur}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {options.map((item) =>
          "options" in item ? (
            <SelectGroup key={String(item.label)}>
              <SelectLabel>{item.label}</SelectLabel>
              {item.options.map((option) => (
                <SelectItem
                  key={String(option.value)}
                  value={String(option.value)}
                  disabled={option.disabled}
                >
                  {option.label ?? option.value}
                </SelectItem>
              ))}
            </SelectGroup>
          ) : (
            <SelectItem
              key={String(item.value)}
              value={String(item.value)}
              disabled={item.disabled}
            >
              {item.label ?? item.value}
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  );
}
