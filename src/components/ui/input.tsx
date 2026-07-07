"use client";

import { useEffect, forwardRef, useState, useMemo, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import debounce from "lodash/debounce";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixIcon?: React.ReactNode;
  suffix?: React.ReactNode;
  allowClear?: boolean;
  onClear?: () => void;
}

const Input = forwardRef<
  HTMLInputElement,
  InputProps & { containerClassName?: string }
>(
  (
    {
      className,
      containerClassName,
      type,
      allowClear,
      onClear,
      prefixIcon,
      suffix,
      ...props
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState(
      props.value || props.defaultValue || "",
    );

    useEffect(() => {
      if (props.value !== undefined) {
        setInputValue(props.value);
      }
    }, [props.value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      props.onChange?.(e);
    };

    const handleClear = () => {
      if (props.onChange) {
        const event = Object.create(new Event("change", { bubbles: true }));
        Object.defineProperty(event, "target", {
          writable: false,
          value: { value: "", name: props.name },
        });
        props.onChange(event as any);
      }
      setInputValue("");
      onClear?.();
    };

    return (
      <div className={cn("relative", containerClassName)}>
        {prefixIcon ? prefixIcon : null}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-input-hover hover:border-input-hover",
            allowClear && "pr-8",
            suffix && "pr-10",
            className,
          )}
          ref={ref}
          {...props}
          value={inputValue}
          onChange={handleChange}
          style={
            {
              ...(props.style || {}),
              color: "var(--black)",
            } as React.CSSProperties
          }
        />
        {allowClear && inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            aria-label="Clear input"
          >
            <X className="h-3.5 w-3.5" style={{ color: "var(--dark-2)" }} />
          </button>
        )}
        {suffix ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {suffix}
          </div>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";

interface SearchInputProps extends Omit<InputProps, "onChange"> {
  onSearch: (value: string) => void;
  onValueChange?: (value: string) => void;
  debounceTime?: number;
  value?: string;
}

const SearchInput = forwardRef<
  HTMLInputElement,
  SearchInputProps & { containerClassName?: string; iconClassName?: string }
>(
  (
    {
      containerClassName,
      className,
      iconClassName,
      onSearch,
      onValueChange,
      debounceTime = 1000,
      value,
      ...props
    },
    ref,
  ) => {
    const onSearchRef = useRef(onSearch);

    useEffect(() => {
      onSearchRef.current = onSearch;
    }, [onSearch]);

    const debouncedSearch = useMemo(
      () =>
        debounce((value: string) => onSearchRef.current(value), debounceTime),
      [debounceTime],
    );

    useEffect(() => {
      return () => {
        debouncedSearch.cancel();
      };
    }, [debouncedSearch]);

    return (
      <div className={cn("relative", containerClassName)}>
        <Input
          ref={ref}
          className={cn("pl-8", "hover:border-input-hover", className)}
          value={value}
          onChange={(e) => {
            onValueChange?.(e.target.value);
            debouncedSearch(e.target.value.trim());
          }}
          prefixIcon={
            <span
              className={cn(
                "iconfont icon-search absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground",
                iconClassName,
              )}
            />
          }
          allowClear
          {...props}
        />
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";

export { Input, SearchInput };
