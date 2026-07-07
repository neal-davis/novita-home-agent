"use client";

import { useEffect, forwardRef, useState, useMemo } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import debounce from "lodash/debounce";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixIcon?: React.ReactNode;
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
            "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 focus:border-input-hover",
            allowClear && "pr-8",
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
          <Button
            type="button"
            variant="noborderghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            aria-label="Clear input"
          >
            <X className="h-3.5 w-3.5" style={{ color: "var(--dark-2)" }} />
          </Button>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

interface SearchInputProps extends Omit<InputProps, "onChange"> {
  onSearch: (value: string) => void;
  debounceTime?: number;
}

const SearchInput = forwardRef<
  HTMLInputElement,
  SearchInputProps & { containerClassName?: string }
>(
  (
    { containerClassName, className, onSearch, debounceTime = 1000, ...props },
    ref,
  ) => {
    const debouncedSearch = useMemo(
      () => debounce((value: string) => onSearch(value), debounceTime),
      [onSearch, debounceTime],
    );

    return (
      <div className={cn("relative", containerClassName)}>
        <Input
          ref={ref}
          className={cn("!pl-[40px]", className)}
          onChange={(e) => debouncedSearch(e.target.value.trim())}
          prefixIcon={
            <span className="iconfont icon-search flex items-center justify-center absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
