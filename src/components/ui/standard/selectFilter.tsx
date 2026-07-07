"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, CircleX, SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type SearchText = string | number | null | undefined;
type OptionLabel = string | number | null | undefined;
const SEARCH_INPUT_CONTAINER_CLASS_NAME = "w-full";
const SEARCH_INPUT_AUTO_COMPLETE = "off";

interface SelectFilterProps<TOption> {
  /** Currently selected option value. */
  value?: string;
  /** Full list of selectable options before search filtering. */
  options: TOption[];
  /** Called when the user selects an option. */
  onValueChange: (value: string) => void;
  /** Returns the stable string value used by the underlying select item. */
  getOptionValue: (option: TOption) => string;
  /** Returns the default display label for trigger, option row, and search text. */
  getOptionLabel: (option: TOption) => OptionLabel;
  /** Returns one or more text fields used for case-insensitive search matching. Defaults to option label. */
  getOptionSearchText?: (option: TOption) => SearchText | SearchText[];
  /** Renders the trigger content when a value is selected. Defaults to the selected option label. */
  renderTrigger?: (option: TOption | undefined) => ReactNode;
  /** Renders one option row in the dropdown list. Defaults to the option label. */
  renderOption?: (option: TOption) => ReactNode;
  /** Placeholder shown in the trigger when no value is selected. */
  placeholder?: string;
  /** Content shown when the search result has no matching options. */
  emptyText?: ReactNode;
  /** Placeholder text for the dropdown search input. */
  inputPlaceholder?: string;
  /** Class name applied to the select trigger button. */
  triggerClassName?: string;
  /** Optional icon rendered by the select trigger. */
  triggerIcon?: React.ReactElement;
  /** Class name applied to the dropdown content container. */
  contentClassName?: string;
  /** Class name applied to the search input row container. */
  searchContainerClassName?: string;
  /** Class name applied to the wrapper around the search icon and input. */
  searchInputWrapClassName?: string;
  /** Class name applied to the search icon. */
  searchIconClassName?: string;
  /** Class name applied to the search input. */
  searchInputClassName?: string;
  /** Whether to apply the built-in search row layout classes. */
  useDefaultSearchContainerClassName?: boolean;
  /** Class name applied to each select item. */
  itemClassName?: string;
  /** Controls whether the selected check mark appears on the left or right. */
  itemCheckPosition?: "left" | "right";
  /** Hides the selected check mark for each item when true. */
  itemHideCheck?: boolean;
  /** Disables Radix select scroll buttons when true. */
  disableScrollButton?: boolean;
  /** Disables the select trigger and value changes. */
  disabled?: boolean;
  /** Shows the search row inside the dropdown. */
  showSearch?: boolean;
  /** Shows a clear icon instead of the dropdown icon when a value is selected. */
  allowClear?: boolean;
  /** Called when the clear icon is pressed. Defaults to onValueChange(""). */
  onClear?: () => void;
  /** Accessible label for the clear icon. */
  clearAriaLabel?: string;
}

export function SelectFilter<TOption>({
  value,
  options,
  onValueChange,
  getOptionValue,
  getOptionLabel,
  getOptionSearchText,
  renderTrigger,
  renderOption,
  placeholder,
  emptyText = "No matching results found",
  inputPlaceholder = "Search...",
  triggerClassName,
  triggerIcon,
  contentClassName,
  searchContainerClassName,
  searchInputWrapClassName,
  searchIconClassName,
  searchInputClassName,
  useDefaultSearchContainerClassName = true,
  itemClassName,
  itemCheckPosition = "right",
  itemHideCheck,
  disableScrollButton = true,
  disabled,
  showSearch = true,
  allowClear,
  onClear,
  clearAriaLabel = "Clear selection",
}: SelectFilterProps<TOption>) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isSelectingOptionRef = useRef(false);
  const isSearchInputActiveRef = useRef(false);
  const isPointerDownOutsideRef = useRef(false);

  const scrollContentToTop = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    requestAnimationFrame(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }

      window.setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
      }, 0);
    });
  }, []);

  const focusSearchInput = useCallback(() => {
    requestAnimationFrame(() => {
      window.setTimeout(() => {
        if (isSelectingOptionRef.current) return;

        const input = inputRef.current;
        if (!input) return;

        const cursorPosition = input.selectionStart ?? input.value.length;
        input.focus({ preventScroll: true });
        input.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    });
  }, []);

  const normalizedSearch = search.trim().toLowerCase();
  const selectedOption = useMemo(
    () => options.find((option) => getOptionValue(option) === value),
    [getOptionValue, options, value],
  );
  const filteredOptions = useMemo(() => {
    if (!normalizedSearch) return options;

    return options.filter((option) => {
      const optionSearchText = getOptionSearchText
        ? getOptionSearchText(option)
        : getOptionLabel(option);
      const values = Array.isArray(optionSearchText)
        ? optionSearchText
        : [optionSearchText];

      return values.some((text) =>
        String(text ?? "")
          .toLowerCase()
          .includes(normalizedSearch),
      );
    });
  }, [getOptionLabel, getOptionSearchText, normalizedSearch, options]);
  const selectedOptionContent = useMemo(() => {
    if (!selectedOption) return null;

    return renderTrigger
      ? renderTrigger(selectedOption)
      : renderOption
        ? renderOption(selectedOption)
        : getOptionLabel(selectedOption);
  }, [getOptionLabel, renderOption, renderTrigger, selectedOption]);

  const closeSelect = useCallback((keepOutsidePointerFlag = false) => {
    isSelectingOptionRef.current = false;
    isSearchInputActiveRef.current = false;
    if (!keepOutsidePointerFlag) {
      isPointerDownOutsideRef.current = false;
    }
    setSearch("");
    setIsOpen(false);
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeSelect();
        return;
      }

      setIsOpen(open);
    },
    [closeSelect],
  );

  const handleSearchChange = useCallback(
    (nextSearch: string) => {
      scrollContentToTop();
      setSearch(nextSearch);
    },
    [scrollContentToTop],
  );

  const handleSearchBlur = useCallback(() => {
    if (isPointerDownOutsideRef.current) {
      isSearchInputActiveRef.current = false;
      return;
    }

    if (isOpen && !isSelectingOptionRef.current && search) {
      focusSearchInput();
      return;
    }

    isSearchInputActiveRef.current = false;
  }, [focusSearchInput, isOpen, search]);

  const handleSearchFocus = useCallback(() => {
    isSearchInputActiveRef.current = true;
  }, []);

  const handleSearchKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Escape") return;

    const triggersTypeahead =
      (event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey) ||
      event.key === "Backspace" ||
      event.key === "Delete";

    if (!triggersTypeahead) return;

    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
  }, []);

  const handleOptionChange = useCallback(
    (nextValue: string) => {
      if (disabled) return;
      isSelectingOptionRef.current = false;
      setSearch("");
      onValueChange(nextValue);
    },
    [disabled, onValueChange],
  );

  const handleClear = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      closeSelect();
      if (onClear) {
        onClear();
        return;
      }
      onValueChange("");
    },
    [closeSelect, onClear, onValueChange],
  );

  const shouldShowClear = Boolean(
    !disabled && allowClear && value && selectedOption,
  );
  const selectIcon = shouldShowClear ? (
    <div
      aria-label={clearAriaLabel}
      className="absolute right-3 top-1/2 z-[1] inline-flex h-4 w-4 shrink-0 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[var(--dark-1)]"
      onPointerDown={handleClear}
      role="button"
      style={{ cursor: "pointer" }}
    >
      <CircleX className="h-4 w-4 cursor-pointer" />
    </div>
  ) : (
    triggerIcon || (
      <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 shrink-0 -translate-y-1/2" />
    )
  );

  useEffect(() => {
    if (!isOpen) return;

    const handleDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target;
      const isPointerDownOutside =
        target instanceof Node &&
        !contentRef.current?.contains(target) &&
        !triggerRef.current?.contains(target) &&
        !inputRef.current?.contains(target);

      isPointerDownOutsideRef.current = isPointerDownOutside;

      if (isPointerDownOutside) {
        closeSelect(true);
      }
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown, true);

    return () => {
      document.removeEventListener(
        "pointerdown",
        handleDocumentPointerDown,
        true,
      );
      isPointerDownOutsideRef.current = false;
    };
  }, [closeSelect, isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !search) return;

    scrollContentToTop();
  }, [isOpen, scrollContentToTop, search]);

  useEffect(() => {
    if (!isOpen || (!search && !isSearchInputActiveRef.current)) return;

    focusSearchInput();
  }, [filteredOptions.length, focusSearchInput, isOpen, search]);

  return (
    <Select
      open={isOpen}
      value={value}
      onValueChange={handleOptionChange}
      onOpenChange={handleOpenChange}
      disabled={disabled}
    >
      <SelectTrigger
        ref={triggerRef}
        className={cn(triggerClassName, "relative !w-max min-w-max pr-9")}
        icon={selectIcon}
      >
        <span className="flex-none whitespace-nowrap">
          {value && selectedOption ? (
            selectedOptionContent
          ) : placeholder ? (
            <SelectValue placeholder={placeholder} />
          ) : (
            <SelectValue placeholder="Please select" />
          )}
        </span>
      </SelectTrigger>
      <SelectContent
        ref={contentRef}
        disableScrollButton={disableScrollButton}
        className={cn("[overflow-anchor:none]", contentClassName)}
        topSlot={
          showSearch ? (
            <div
              className={cn(
                useDefaultSearchContainerClassName &&
                  "flex items-center gap-2 p-[10px] border-b border-common-gray-3",
                searchContainerClassName,
              )}
              onKeyDown={handleSearchKeyDown}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <div className={cn("contents", searchInputWrapClassName)}>
                <SearchIcon
                  className={cn(
                    "w-4 h-4 text-common-dark-1",
                    searchIconClassName,
                  )}
                />
                <Input
                  containerClassName={SEARCH_INPUT_CONTAINER_CLASS_NAME}
                  ref={inputRef}
                  placeholder={inputPlaceholder}
                  className={cn(
                    "w-full h-5 text-sm px-0 border-none",
                    searchInputClassName,
                  )}
                  value={search}
                  onChange={(event) => {
                    handleSearchChange(event.target.value);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  onClick={(event) => event.stopPropagation()}
                  onPointerDown={(event) => event.stopPropagation()}
                  onBlur={handleSearchBlur}
                  onFocus={handleSearchFocus}
                  autoComplete={SEARCH_INPUT_AUTO_COMPLETE}
                />
              </div>
            </div>
          ) : undefined
        }
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <SelectItem
              key={getOptionValue(option)}
              value={getOptionValue(option)}
              className={itemClassName}
              checkPosition={itemCheckPosition}
              hideCheck={itemHideCheck}
              onPointerMove={(event) => {
                event.preventDefault();
              }}
              onPointerDown={() => {
                isSelectingOptionRef.current = true;
              }}
            >
              {renderOption ? renderOption(option) : getOptionLabel(option)}
            </SelectItem>
          ))
        ) : (
          <div className="p-2 text-sm text-muted-foreground text-center">
            {emptyText}
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
