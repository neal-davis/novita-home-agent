"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { ChevronDown, CircleX } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type CascadeFilterProps<TParent, TChild> = {
  parents: TParent[];
  childOptions: TChild[];
  value?: string;
  placeholder?: ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  allowClear?: boolean;
  onValueChange: (value: string) => void;
  onClear?: () => void;
  getParentValue: (parent: TParent) => string;
  getParentLabel: (parent: TParent) => ReactNode;
  getChildValue: (child: TChild) => string;
  getChildLabel: (child: TChild) => ReactNode;
  getChildParentValue: (child: TChild) => string;
  renderTrigger?: (child: TChild | undefined) => ReactNode;
  renderParent?: (parent: TParent, active: boolean) => ReactNode;
  renderChild?: (child: TChild, selected: boolean) => ReactNode;
};

export function CascadeFilter<TParent, TChild>({
  parents,
  childOptions,
  value,
  placeholder = "Please select",
  triggerClassName,
  contentClassName,
  allowClear,
  onValueChange,
  onClear,
  getParentValue,
  getParentLabel,
  getChildValue,
  getChildLabel,
  getChildParentValue,
  renderTrigger,
  renderParent,
  renderChild,
}: CascadeFilterProps<TParent, TChild>) {
  const [open, setOpen] = useState(false);
  const selectedChild = useMemo(
    () => childOptions.find((child) => getChildValue(child) === value),
    [childOptions, getChildValue, value],
  );
  const selectedParentValue = selectedChild
    ? getChildParentValue(selectedChild)
    : undefined;
  const [activeParentValue, setActiveParentValue] = useState(
    selectedParentValue || (parents[0] ? getParentValue(parents[0]) : ""),
  );

  useEffect(() => {
    if (selectedParentValue) {
      setActiveParentValue(selectedParentValue);
      return;
    }

    if (
      activeParentValue &&
      parents.some((parent) => getParentValue(parent) === activeParentValue)
    ) {
      return;
    }

    setActiveParentValue(parents[0] ? getParentValue(parents[0]) : "");
  }, [activeParentValue, getParentValue, parents, selectedParentValue]);

  const activeChildren = useMemo(
    () =>
      childOptions.filter(
        (child) => getChildParentValue(child) === activeParentValue,
      ),
    [activeParentValue, childOptions, getChildParentValue],
  );
  const showClear = Boolean(allowClear && value && selectedChild);

  const handleClear = (event: React.PointerEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(false);

    if (onClear) {
      onClear();
      return;
    }

    onValueChange("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "relative flex h-9 w-full items-center rounded-[6px] border border-[var(--gray-2)] bg-background py-2 pl-3 pr-9 text-left text-sm ring-offset-background hover:border-input-hover focus:border-input-hover focus:outline-none focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            triggerClassName,
          )}
        >
          <span className="min-w-0 flex-1 truncate">
            {selectedChild
              ? renderTrigger
                ? renderTrigger(selectedChild)
                : getChildLabel(selectedChild)
              : placeholder}
          </span>
          {showClear ? (
            <span
              aria-label="Clear selection"
              className="absolute right-3 top-1/2 inline-flex h-4 w-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[var(--dark-1)]"
              onPointerDown={handleClear}
              role="button"
            >
              <CircleX className="h-4 w-4 cursor-pointer" />
            </span>
          ) : (
            <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 shrink-0 text-[var(--dark-3-1)]" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn(
          "z-[10002] flex w-auto min-w-[320px] gap-1 p-1",
          contentClassName,
        )}
      >
        <div className="max-h-64 min-w-[140px] overflow-y-auto border-r border-[var(--gray-2)] pr-1 scrollBar_container_new">
          {parents.map((parent) => {
            const parentValue = getParentValue(parent);
            const active = parentValue === activeParentValue;

            return (
              <button
                key={parentValue}
                type="button"
                className={cn(
                  "flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-[var(--gray-3)]",
                  active && "bg-[var(--gray-3)]",
                )}
                onClick={() => setActiveParentValue(parentValue)}
              >
                {renderParent
                  ? renderParent(parent, active)
                  : getParentLabel(parent)}
              </button>
            );
          })}
        </div>
        <div className="max-h-64 min-w-[180px] overflow-y-auto scrollBar_container_new">
          {activeChildren.length > 0 ? (
            activeChildren.map((child) => {
              const childValue = getChildValue(child);
              const selected = childValue === value;

              return (
                <button
                  key={childValue}
                  type="button"
                  className={cn(
                    "flex w-full items-center rounded-sm px-2 py-1.5 text-left text-sm hover:bg-[var(--gray-3)]",
                    selected && "bg-[var(--gray-3)]",
                  )}
                  onClick={() => {
                    onValueChange(childValue);
                    setOpen(false);
                  }}
                >
                  {renderChild
                    ? renderChild(child, selected)
                    : getChildLabel(child)}
                </button>
              );
            })
          ) : (
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              No options
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
