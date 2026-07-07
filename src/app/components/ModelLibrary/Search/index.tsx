"use client";

import React, { useState, useEffect, useRef } from "react";
import { SearchInput } from "@/components/ui/input";
import { LLMModelWithStatus, MediaModel } from "@/types/models";
import { cn } from "@/lib/utils";
import ModelLogo from "@/app/components/ModelLibrary/ModelLogo";
import { NOVITA_URL } from "@/constants/urls";
import { usePathname } from "next/navigation";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import styles from "./index.module.scss";

type AnyModel = LLMModelWithStatus | MediaModel;
interface ModelSearchProps {
  models: AnyModel[];
  className?: string;
}

export default function ModelSearch({ models, className }: ModelSearchProps) {
  const { locale } = useI18n();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AnyModel[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const businessPathname = getPathnameWithoutLocale(pathname);

  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = models.filter(
        (model) =>
          model.name.toLowerCase().includes(query.toLowerCase()) ||
          model.displayName?.toLowerCase().includes(query.toLowerCase()),
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, models]);

  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const suggestionItems = suggestionsRef.current.querySelectorAll(
        "[data-suggestion-item]",
      );
      if (suggestionItems[selectedIndex]) {
        suggestionItems[selectedIndex].scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleModelSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        break;
      default:
        break;
    }
  };

  const handleSearch = (value: string) => {
    setQuery(value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleModelSelect = (model: AnyModel) => {
    if (model.link) {
      window.location.href = getLocalizedPath(model.link, locale);
    } else if ("linkPath" in model && model.linkPath) {
      const isConsole = businessPathname.includes(NOVITA_URL.MODEL_API_CONSOLE);
      const targetUrl = isConsole
        ? `${NOVITA_URL.MODEL_API_CONSOLE_MODEL_DETAIL}/${model.linkPath}`
        : `/models/model-detail/${model.linkPath}`;
      window.location.href = getLocalizedPath(targetUrl, locale);
    }
    setShowSuggestions(false);
  };

  return (
    <div className={cn("relative w-full", className)} ref={searchRef}>
      <SearchInput
        placeholder="Search Model"
        value={query}
        onSearch={handleSearch}
        debounceTime={300}
        className={cn(
          "h-12 border-2 border-[var(--brand-1)] focus:border-[var(--brand-1)] rounded-[12px] hover:border-[var(--brand-1)] pl-[52px] pr-8",
          styles.search_input,
          className,
        )}
        containerClassName="w-full"
        onKeyDown={handleKeyDown}
        ref={inputRef}
        iconClassName="left-6 text-[20px]"
      />

      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-[var(--gray-1)] rounded-lg shadow-lg z-50 max-h-[256px] overflow-y-auto"
        >
          {suggestions.map((model, index) => (
            <div
              key={model.id}
              data-suggestion-item
              ref={index === selectedIndex ? selectedItemRef : null}
              className={cn(
                "flex items-center justify-between px-4 py-3 hover:bg-[var(--gray-3)] cursor-pointer",
                { "bg-[var(--gray-3)]": index === selectedIndex },
              )}
              onClick={() => handleModelSelect(model)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-center gap-3">
                <ModelLogo
                  modelName={model.displayName || model.name}
                  vendorName={model.series}
                  size={22}
                />
                <span className="font-subtle-medium text-[var(--black)]">
                  {model.displayName || model.name}
                </span>
              </div>
              <span className="text-xs bg-[var(--gray-2)] text-[var(--dark-2)] px-2 py-1 rounded">
                {model.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
